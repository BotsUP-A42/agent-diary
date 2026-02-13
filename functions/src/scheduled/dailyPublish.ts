import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

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
      
      // 2. Read daily log from memory file
      const logData = await readDailyLog(dateStr);
      
      // 3. Save to Firestore
      await db.collection('logs').doc(dateStr).set({
        ...logData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      // 4. Update stats
      await updateStats();
      
      console.log('Daily publish completed for:', dateStr);
      return null;
    } catch (error) {
      console.error('Error in daily publish:', error);
      throw error;
    }
  });

async function readDailyLog(date: string): Promise<any> {
  const memoryDir = '/Users/a42/.openclaw/workspace/memory';
  const logFile = path.join(memoryDir, `${date}.md`);
  
  let content = '';
  let title = `工作日誌 - ${date}`;
  let summary = '今日工作記錄';
  let tasks: any[] = [];
  let learnings: any[] = [];
  let tags = ['daily'];
  let mood: 'productive' | 'challenging' | 'learning' | 'routine' = 'productive';
  
  try {
    if (fs.existsSync(logFile)) {
      content = fs.readFileSync(logFile, 'utf-8');
      
      // Parse markdown content
      const lines = content.split('\n');
      
      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1];
      }
      
      // Extract summary (first paragraph after title)
      const summaryMatch = content.match(/^#[^\n]+\n+([^#\n][^\n]*)/m);
      if (summaryMatch) {
        summary = summaryMatch[1].trim();
      }
      
      // Extract tasks from "## 今日完成任務" or "## Tasks"
      const tasksSection = content.match(/##\s+(?:今日完成任務|Tasks|Completed)[^#]*/i);
      if (tasksSection) {
        const taskLines = tasksSection[0].split('\n').filter(line => 
          line.trim().startsWith('- [x]') || line.trim().startsWith('- ') || line.trim().startsWith('### ')
        );
        tasks = taskLines.map((line, index) => ({
          id: `task-${index}`,
          description: line.replace(/^- \[x\]\s*/, '').replace(/^- \[ \]\s*/, '').replace(/^- /, '').replace(/^### /, '').trim(),
          category: inferCategory(line),
          status: line.includes('[x]') ? 'completed' : 'in-progress',
        }));
      }
      
      // Extract learnings from "## 學習心得" or "## Learnings"
      const learningsSection = content.match(/##\s+(?:學習心得|Learnings|Insights)[^#]*/i);
      if (learningsSection) {
        const learningLines = learningsSection[0].split('\n').filter(line => 
          line.trim().startsWith('- ') || line.trim().startsWith(/\d+\./)
        );
        learnings = learningLines.map(line => ({
          topic: extractTopic(line),
          insight: line.replace(/^- /, '').replace(/^\d+\.\s*/, '').trim(),
        }));
      }
      
      // Extract tags
      if (content.includes('AI') || content.includes('Claude')) tags.push('ai');
      if (content.includes('Firebase') || content.includes('Next.js')) tags.push('development');
      if (content.includes('部署') || content.includes('上線')) tags.push('deployment');
      
      // Determine mood based on content
      if (content.includes('錯誤') || content.includes('Error') || content.includes('failed')) {
        mood = 'challenging';
      } else if (content.includes('學習') || content.includes('心得')) {
        mood = 'learning';
      } else if (content.includes('例行') || content.includes('日常')) {
        mood = 'routine';
      }
    } else {
      console.log(`No log file found for ${date}, creating default log`);
      content = `# 工作日誌 - ${date}\n\n今日暫無詳細記錄。\n`;
    }
  } catch (error) {
    console.error('Error reading log file:', error);
    content = `# 工作日誌 - ${date}\n\n讀取日誌檔案時發生錯誤。\n`;
  }
  
  return {
    date,
    title,
    summary,
    content,
    tasks,
    learnings,
    tokenUsage: null, // Will be populated separately if needed
    tags: [...new Set(tags)],
    mood,
  };
}

function inferCategory(line: string): 'development' | 'research' | 'learning' | 'communication' | 'planning' {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('開發') || lowerLine.includes('deploy') || lowerLine.includes('build') || 
      lowerLine.includes('code') || lowerLine.includes('程式') || lowerLine.includes('firebase') ||
      lowerLine.includes('next.js') || lowerLine.includes('網站')) {
    return 'development';
  }
  if (lowerLine.includes('研究') || lowerLine.includes('調查') || lowerLine.includes('search')) {
    return 'research';
  }
  if (lowerLine.includes('學習') || lowerLine.includes('learning') || lowerLine.includes('心得')) {
    return 'learning';
  }
  if (lowerLine.includes('溝通') || lowerLine.includes('討論') || lowerLine.includes('slack') ||
      lowerLine.includes('會議') || lowerLine.includes('訊息')) {
    return 'communication';
  }
  if (lowerLine.includes('規劃') || lowerLine.includes('計畫') || lowerLine.includes('排程') ||
      lowerLine.includes('規格') || lowerLine.includes('設計')) {
    return 'planning';
  }
  return 'development';
}

function extractTopic(line: string): string {
  const cleaned = line.replace(/^- /, '').replace(/^\d+\.\s*/, '').trim();
  // Extract first sentence or first 20 chars as topic
  const firstSentence = cleaned.split(/[.!?。！？]/)[0];
  return firstSentence.length > 30 ? firstSentence.substring(0, 30) + '...' : firstSentence;
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
