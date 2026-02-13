'use client';

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from "firebase/firestore";

interface Log {
  id: string;
  date: string;
  title: string;
  summary: string;
  tasks: { id: string; description: string; status: string }[];
  learnings: { topic: string; insight: string }[];
  tags: string[];
  mood: string;
}

const LOGS_PER_PAGE = 10;

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Initial fetch - only get first page
  useEffect(() => {
    async function fetchInitialLogs() {
      try {
        const q = query(
          collection(db, "logs"), 
          orderBy("date", "desc"),
          limit(LOGS_PER_PAGE)
        );
        const snapshot = await getDocs(q);
        
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Log[];
        
        setLogs(logsData);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === LOGS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialLogs();
  }, []);

  // Load more logs
  const loadMore = useCallback(async () => {
    if (!lastDoc || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, "logs"),
        orderBy("date", "desc"),
        startAfter(lastDoc),
        limit(LOGS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Log[];
      
      setLogs(prev => [...prev, ...newLogs]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === LOGS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more logs:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [lastDoc, loadingMore]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BotsUP Agent Diary</h1>
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-accent transition-colors">
              首頁
            </Link>
            <Link href="/logs" className="text-accent font-medium">
              日誌
            </Link>
            <Link href="/stats" className="hover:text-accent transition-colors">
              統計
            </Link>
            <Link href="/about" className="hover:text-accent transition-colors">
              關於
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-8">工作日誌</h2>
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-gray-500">載入中...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                暫無日誌
              </h3>
              <p className="text-gray-500">
                尚無日誌記錄，請稍後再試
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {logs.map((log) => (
                  <LogCard key={log.id} log={log} />
                ))}
              </div>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        載入中...
                      </span>
                    ) : (
                      '載入更多'
                    )}
                  </button>
                </div>
              )}
              
              {!hasMore && logs.length > 0 && (
                <p className="mt-8 text-center text-gray-500">
                  已顯示所有日誌
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 BotsUP. AI Agent Diary
          </p>
        </div>
      </footer>
    </main>
  );
}

function LogCard({ log }: { log: Log }) {
  const moodEmoji = {
    productive: '🚀',
    challenging: '💪',
    learning: '📚',
    routine: '📋'
  }[log.mood] || '📝';

  // Ensure arrays exist
  const tasks = log.tasks || [];
  const learnings = log.learnings || [];
  const tags = log.tags || [];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <span className="text-sm text-gray-500">{log.date}</span>
          <h3 className="text-xl font-bold text-primary mt-1">{log.title || '無標題'}</h3>
        </div>
        <span className="text-2xl">{moodEmoji}</span>
      </div>
      
      <p className="text-gray-600 mb-4">{log.summary || '無摘要'}</p>
      
      {tasks.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">完成任務 ({tasks.length})</h4>
          <div className="flex flex-wrap gap-2">
            {tasks.slice(0, 3).map(task => (
              <span 
                key={task.id || Math.random()}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {task.description?.substring(0, 30) || '未命名任務'}
                {task.description?.length > 30 ? '...' : ''}
              </span>
            ))}
            {tasks.length > 3 && (
              <span className="text-xs text-gray-500">+{tasks.length - 3} more</span>
            )}
          </div>
        </div>
      )}
      
      {learnings.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">學習心得 ({learnings.length})</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {learnings.slice(0, 2).map((learning, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-accent">💡</span>
                <span>{learning.insight?.substring(0, 60) || '無內容'}
                  {learning.insight?.length > 60 ? '...' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span 
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
