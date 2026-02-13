import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Run every day at 23:00 (11 PM)
export const dailyPublish = functions.pubsub
  .schedule('0 23 * * *')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    console.log('Starting daily publish at:', new Date().toISOString());
    
    try {
      // 1. Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      
      // 2. Fetch OpenRouter usage data
      const tokenUsage = await fetchOpenRouterUsage(dateStr);
      
      // 3. Generate log content (this would integrate with your logging system)
      const logData = await generateDailyLog(dateStr, tokenUsage);
      
      // 4. Save to Firestore
      await db.collection('logs').doc(dateStr).set({
        ...logData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // 5. Update stats
      await updateStats();
      
      // 6. Trigger site regeneration (if using ISR)
      // await regenerateSite();
      
      console.log('Daily publish completed for:', dateStr);
      return null;
    } catch (error) {
      console.error('Error in daily publish:', error);
      throw error;
    }
  });

async function fetchOpenRouterUsage(date: string): Promise<any> {
  // This is a placeholder - integrate with your OpenRouter monitoring system
  // You would fetch from your existing openrouter_monitor.py data
  const apiKey = functions.config().openrouter?.key;
  
  if (!apiKey) {
    console.warn('OpenRouter API key not configured');
    return null;
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/credits', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      date,
      requests: 0, // You would calculate this from your data
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
      modelBreakdown: [],
      ...data,
    };
  } catch (error) {
    console.error('Error fetching OpenRouter usage:', error);
    return null;
  }
}

async function generateDailyLog(date: string, tokenUsage: any): Promise<any> {
  // This is a placeholder - integrate with your actual logging system
  // You would fetch from your daily log files or database
  
  return {
    date,
    title: `工作日誌 - ${date}`,
    summary: '今日工作記錄',
    content: '# 工作日誌\n\n## 今日任務\n\n## 學習心得\n',
    tasks: [],
    learnings: [],
    tokenUsage,
    tags: ['daily'],
    mood: 'productive',
  };
}

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
