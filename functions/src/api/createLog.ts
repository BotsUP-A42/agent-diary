import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const createLog = functions.https.onCall(async (data, context) => {
  // Verify auth (optional - can be disabled for automated processes)
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  // }
  
  try {
    const { date, title, summary, content, tasks, learnings, tokenUsage, tags, mood } = data;
    
    // Validation
    if (!date || !title || !content) {
      throw new functions.https.HttpsError('invalid-argument', 'Date, title, and content are required');
    }
    
    const logData = {
      date,
      title,
      summary: summary || '',
      content,
      tasks: tasks || [],
      learnings: learnings || [],
      tokenUsage: tokenUsage || null,
      tags: tags || [],
      mood: mood || 'productive',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await db.collection('logs').doc(date).set(logData);
    
    // Update stats
    await updateStats();
    
    return { success: true, id: date };
  } catch (error) {
    console.error('Error creating log:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to create log');
  }
});

async function updateStats() {
  const logsSnapshot = await db.collection('logs').get();
  const totalDays = logsSnapshot.size;
  
  let totalTasks = 0;
  let totalLearnings = 0;
  let totalCost = 0;
  const categoryDistribution: Record<string, number> = {};
  
  logsSnapshot.forEach(doc => {
    const data = doc.data();
    totalTasks += (data.tasks || []).length;
    totalLearnings += (data.learnings || []).length;
    totalCost += (data.tokenUsage?.estimatedCost || 0);
    
    (data.tasks || []).forEach((task: any) => {
      const cat = task.category || 'other';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });
  });
  
  await db.collection('stats').doc('aggregate').set({
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    totalDays,
    totalTasks,
    totalLearnings,
    totalCost,
    averageDailyCost: totalDays > 0 ? totalCost / totalDays : 0,
    categoryDistribution,
  });
}
