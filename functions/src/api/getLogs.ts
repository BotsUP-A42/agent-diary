import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const getLogs = functions.https.onCall(async (data, context) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, category, tag } = data;
    
    let query: admin.firestore.Query = db.collection('logs')
      .orderBy('date', 'desc');
    
    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }
    
    if (tag) {
      query = query.where('tags', 'array-contains', tag);
    }
    
    const offset = (page - 1) * limit;
    const snapshot = await query.limit(limit).offset(offset).get();
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get total count
    const totalSnapshot = await db.collection('logs').count().get();
    const total = totalSnapshot.data().count;
    
    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting logs:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get logs');
  }
});
