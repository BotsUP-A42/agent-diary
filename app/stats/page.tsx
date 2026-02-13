'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

interface Stats {
  totalDays: number;
  totalTasks: number;
  totalLearnings: number;
  totalCost: number;
  lastUpdated: string;
}

interface DailyUsage {
  date: string;
  used_credits: number;
  remaining_credits: number;
  total_credits: number;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayUsage, setTodayUsage] = useState<DailyUsage | null>(null);
  const [weeklyTotal, setWeeklyTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);

        // Fetch aggregate stats
        const statsRef = doc(db, "stats", "aggregate");
        const statsSnap = await getDoc(statsRef);
        
        if (statsSnap.exists()) {
          setStats(statsSnap.data() as Stats);
        }

        // Fetch today's usage from daily_usage collection
        const today = new Date().toISOString().split('T')[0];
        const usageRef = doc(db, "daily_usage", today);
        const usageSnap = await getDoc(usageRef);
        
        if (usageSnap.exists()) {
          setTodayUsage(usageSnap.data() as DailyUsage);
        }

        // Fetch last 7 days for weekly total
        const weeklyQuery = query(
          collection(db, "daily_usage"),
          orderBy("date", "desc"),
          limit(7)
        );
        const weeklySnap = await getDocs(weeklyQuery);
        
        let weeklyCost = 0;
        weeklySnap.docs.forEach(doc => {
          const data = doc.data();
          if (data.cost_usd) {
            weeklyCost += data.cost_usd;
          } else if (data.used_credits) {
            weeklyCost += data.used_credits;
          }
        });
        setWeeklyTotal(weeklyCost);

      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("載入統計資料時發生錯誤");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Calculate today's cost
  const todayCost = todayUsage?.used_credits || 0;
  
  // Format numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 text-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold hover:text-blue-400 transition-colors">
            BotsUP Agent Diary
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-blue-400 transition-colors">
              首頁
            </Link>
            <Link href="/logs" className="text-gray-300 hover:text-blue-400 transition-colors">
              日誌
            </Link>
            <Link href="/stats" className="text-blue-400 font-medium">
              統計
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-blue-400 transition-colors">
              關於
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">使用統計</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 text-center">
              <div className="text-4xl mb-2">⚠️</div>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Token Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                  <h3 className="text-sm text-gray-500 mb-2">今日 Token 用量</h3>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatNumber(stats?.totalTasks || 0)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">任務完成數</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                  <h3 className="text-sm text-gray-500 mb-2">今日成本</h3>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(todayCost)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {todayUsage ? `剩餘: $${todayUsage.remaining_credits?.toFixed(2) || '0.00'}` : '尚無今日資料'}
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                  <h3 className="text-sm text-gray-500 mb-2">本週累計</h3>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(weeklyTotal)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">過去 7 天</p>
                </div>
              </div>

              {/* Additional Stats */}
              {stats && (
                <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">
                    累計統計
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {stats.totalDays || 0}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">總日誌數</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {stats.totalTasks || 0}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">完成任務</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {stats.totalLearnings || 0}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">學習心得</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-600">
                        {formatCurrency(stats.totalCost || 0)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">總成本</p>
                    </div>
                  </div>
                  {stats.lastUpdated && (
                    <p className="text-xs text-gray-400 mt-6 text-center">
                      最後更新: {new Date(stats.lastUpdated).toLocaleString('zh-TW')}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">
              Token 用量趨勢
            </h3>
            <div className="bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed border-gray-200">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 mb-2">
                圖表功能即將推出
              </p>
              <p className="text-sm text-gray-400">
                未來將顯示每日 Token 使用量與成本趨勢
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 BotsUP. AI Agent Diary
          </p>
        </div>
      </footer>
    </main>
  );
}
