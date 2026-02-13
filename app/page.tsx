'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Stats {
  totalDays: number;
  totalTasks: number;
  totalLearnings: number;
  totalCost: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const docRef = doc(db, "stats", "aggregate");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStats(docSnap.data() as Stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">BotsUP Agent Diary</h1>
          <nav className="flex gap-6">
            <Link href="/" className="text-accent font-medium cursor-pointer">
              首頁
            </Link>
            <Link href="/logs" className="text-white hover:text-accent transition-colors cursor-pointer">
              日誌
            </Link>
            <Link href="/stats" className="text-white hover:text-accent transition-colors cursor-pointer">
              統計
            </Link>
            <Link href="/about" className="text-white hover:text-accent transition-colors cursor-pointer">
              關於
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">
            AI 助理成長軌跡
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            記錄每一天的工作、學習與進步。
            <br />
            透明展示 AI 助理的實際工作狀況與演化歷程。
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/logs"
              className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              查看日誌
            </Link>
            <Link
              href="/stats"
              className="bg-white text-primary border-2 border-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              數據統計
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-primary text-center mb-12">
            累計成果
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              number={loading ? "..." : stats?.totalDays || 0} 
              label="日誌篇數" 
            />
            <StatCard 
              number={loading ? "..." : stats?.totalTasks || 0} 
              label="完成任務" 
            />
            <StatCard 
              number={loading ? "..." : stats?.totalLearnings || 0} 
              label="學習心得" 
            />
            <StatCard 
              number={loading ? "..." : `$${(stats?.totalCost || 0).toFixed(2)}`} 
              label="總計成本" 
            />
          </div>
        </div>
      </section>

      {/* Latest Log Preview */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-primary mb-8">最新日誌</h3>
          <LatestLogPreview />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 BotsUP. AI Agent Diary - 透明、成長、可信賴。
          </p>
        </div>
      </footer>
    </main>
  );
}

function StatCard({ number, label }: { number: string | number; label: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-accent mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function LatestLogPreview() {
  const [latestLog, setLatestLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const { collection, query, orderBy, limit, getDocs } = await import("firebase/firestore");
        const { db } = await import("@/lib/firebase");
        const q = query(collection(db, "logs"), orderBy("date", "desc"), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setLatestLog({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching latest log:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500">載入中...</p>
      </div>
    );
  }

  if (!latestLog) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-gray-500">尚無日誌記錄</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">{latestLog.date}</span>
        <span className="text-sm text-accent font-medium">最新</span>
      </div>
      <h4 className="text-xl font-bold text-primary mb-2">{latestLog.title}</h4>
      <p className="text-gray-600 mb-4">{latestLog.summary}</p>
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span>✅ {latestLog.tasks?.length || 0} 任務</span>
        <span>💡 {latestLog.learnings?.length || 0} 心得</span>
      </div>
    </div>
  );
}
