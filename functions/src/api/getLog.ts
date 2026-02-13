import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const getLog = functions.https.onCall(async (data, context) => {
  try {
    const { date } = data;
    
    if (!date) {
      throw new functions.https.HttpsError('invalid-argument', 'Date is required');
    }
    
    const doc = await db.collection('logs').doc(date).get();
    
    if (!doc.exists) {
      throw new functions.https.HttpsError('not-found', 'Log not found');
    }
    
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting log:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to get log');
  }
});
