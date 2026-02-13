#!/usr/bin/env node
/**
 * 直接上傳日誌到 Firestore
 * 使用方法: node upload-log.js [date]
 * 如果沒有指定日期，使用今天
 */

const fs = require('fs');
const path = require('path');

// 檢查是否有 service account key
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '..', 'service-account-key.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: Service account key not found!');
  console.error('\n請按照以下步驟建立 service account key:');
  console.error('1. 前往 https://console.firebase.google.com/project/a42-diary/settings/serviceaccounts/adminsdk');
  console.error('2. 點擊「產生新的私鑰」');
  console.error('3. 下載 JSON 檔案');
  console.error('4. 將檔案放在:', path.resolve('./service-account-key.json'));
  console.error('\n或者設定環境變數:');
  console.error('export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json');
  process.exit(1);
}

// 動態引入 firebase-admin (避免在沒有 key 時載入失敗)
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'a42-diary'
});

const db = admin.firestore();

// Parse tasks from markdown
function parseTasks(content) {
  const tasks = [];
  const taskRegex = /- \[([ x])\]\s*(.+)/g;
  let match;
  let index = 0;
  
  while ((match = taskRegex.exec(content)) !== null) {
    const isCompleted = match[1] === 'x';
    const description = match[2].trim();
    
    tasks.push({
      id: `task-${index++}`,
      description: description.replace(/^### \d+\.\s*/, ''),
      category: inferCategory(description),
      status: isCompleted ? 'completed' : 'in-progress'
    });
  }
  
  return tasks;
}

// Infer category from task description
function inferCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('開發') || lower.includes('deploy') || lower.includes('build') || 
      lower.includes('code') || lower.includes('程式') || lower.includes('firebase') ||
      lower.includes('next.js') || lower.includes('網站') || lower.includes('安裝')) {
    return 'development';
  }
  if (lower.includes('研究') || lower.includes('調查') || lower.includes('search') || lower.includes('查詢')) {
    return 'research';
  }
  if (lower.includes('學習') || lower.includes('learning') || lower.includes('心得')) {
    return 'learning';
  }
  if (lower.includes('溝通') || lower.includes('討論') || lower.includes('slack') ||
      lower.includes('會議') || lower.includes('訊息') || lower.includes('對話')) {
    return 'communication';
  }
  if (lower.includes('規劃') || lower.includes('計畫') || lower.includes('排程') ||
      lower.includes('規格') || lower.includes('設計') || lower.includes('撰寫')) {
    return 'planning';
  }
  return 'development';
}

// Parse learnings from markdown
function parseLearnings(content) {
  const learnings = [];
  const learningSection = content.match(/##\s+(?:學習心得|Learnings|Insights)[^#]*/i);
  
  if (learningSection) {
    const lines = learningSection[0].split('\n');
    for (const line of lines) {
      const match = line.match(/^\d+\.\s*(.+)/);
      if (match) {
        const text = match[1].trim();
        learnings.push({
          topic: text.split(/[.!:。！：]/)[0].substring(0, 50),
          insight: text
        });
      }
    }
  }
  
  return learnings;
}

// Main function
async function uploadLog(dateStr) {
  const memoryDir = '/Users/a42/.openclaw/workspace/memory';
  const logFile = path.join(memoryDir, `${dateStr}.md`);
  
  console.log(`📖 Reading log file: ${logFile}`);
  
  let content = '';
  if (fs.existsSync(logFile)) {
    content = fs.readFileSync(logFile, 'utf-8');
    console.log('✅ Log file found');
  } else {
    console.log('⚠️  Log file not found, using default content');
    content = `# 工作日誌 - ${dateStr}\n\n今日暫無詳細記錄。\n`;
  }
  
  // Parse data
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : `工作日誌 - ${dateStr}`;
  
  const summaryMatch = content.match(/##\s+今日完成任務[^#]*/i);
  let summary = '今日工作記錄';
  if (summaryMatch) {
    const taskCount = (summaryMatch[0].match(/- \[x\]/g) || []).length;
    summary = `完成 ${taskCount} 項任務`;
  }
  
  const tasks = parseTasks(content);
  const learnings = parseLearnings(content);
  
  // Extract tags
  const tags = ['daily'];
  if (content.includes('AI') || content.includes('Claude')) tags.push('ai');
  if (content.includes('Firebase') || content.includes('Next.js')) tags.push('development');
  if (content.includes('部署') || content.includes('上線')) tags.push('deployment');
  
  // Determine mood
  let mood = 'productive';
  if (content.includes('錯誤') || content.includes('Error') || content.includes('failed')) {
    mood = 'challenging';
  } else if (content.includes('學習') || content.includes('心得') || learnings.length > 0) {
    mood = 'learning';
  }
  
  // Build log data
  const logData = {
    date: dateStr,
    title,
    summary,
    content,
    tasks,
    learnings,
    tokenUsage: null, // Not exposing token usage publicly
    tags: [...new Set(tags)],
    mood,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  console.log('\n📊 Parsed Data:');
  console.log(`  Title: ${title}`);
  console.log(`  Summary: ${summary}`);
  console.log(`  Tasks: ${tasks.length}`);
  console.log(`  Learnings: ${learnings.length}`);
  console.log(`  Tags: ${tags.join(', ')}`);
  console.log(`  Mood: ${mood}`);
  
  // Upload to Firestore
  console.log(`\n☁️  Uploading to Firestore...`);
  await db.collection('logs').doc(dateStr).set(logData);
  console.log(`✅ Successfully uploaded log for ${dateStr}`);
  
  // Update stats
  console.log('\n📈 Updating stats...');
  const logsSnapshot = await db.collection('logs').get();
  const totalDays = logsSnapshot.size;
  
  let totalTasks = 0;
  let totalLearnings = 0;
  const categoryDistribution = {};
  
  logsSnapshot.forEach(doc => {
    const data = doc.data();
    totalTasks += (data.tasks || []).length;
    totalLearnings += (data.learnings || []).length;
    
    (data.tasks || []).forEach(task => {
      const cat = task.category || 'other';
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
    });
  });
  
  await db.collection('stats').doc('aggregate').set({
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    totalDays,
    totalTasks,
    totalLearnings,
    totalCost: 0,
    averageDailyCost: 0,
    categoryDistribution,
  });
  
  console.log('✅ Stats updated');
  console.log(`\n🎉 Done! Total logs: ${totalDays}`);
}

// Get date from command line or use today
const dateArg = process.argv[2];
const dateStr = dateArg || new Date().toISOString().split('T')[0];

console.log(`🚀 Uploading log for: ${dateStr}\n`);

uploadLog(dateStr)
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('permission')) {
      console.error('\n💡 Make sure the service account has Firestore permissions');
    }
    process.exit(1);
  });
