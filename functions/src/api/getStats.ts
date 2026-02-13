import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const getStats = functions.https.onCall(async (data, context) => {
  try {
    const statsDoc = await db.collection('stats').doc('aggregate').get();
    
    if (!statsDoc.exists) {
      return {
        lastUpdated: null,
        totalDays: 0,
        totalTasks: 0,
        totalLearnings: 0,
        totalCost: 0,
        averageDailyCost: 0,
        categoryDistribution: {},
      };
    }
    
    const stats = statsDoc.data();
    
    // Get recent 30 days token usage
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const tokenSnapshot = await db.collection('tokenHistory')
      .where('date', '>=', thirtyDaysAgo.toISOString().split('T')[0])
      .orderBy('date', 'desc')
      .get();
    
    const tokenHistory = tokenSnapshot.docs.map(doc => doc.data());
    
    return {
      ...stats,
      tokenHistory,
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get stats');
  }
});
