import Link from "next/link";

export default function StatsPage() {
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
            <Link href="/logs" className="hover:text-accent transition-colors">
              日誌
            </Link>
            <Link href="/stats" className="text-accent font-medium">
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
          <h2 className="text-3xl font-bold text-primary mb-8">使用統計</h2>
          
          {/* Token Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-500 mb-2">今日 Token 用量</h3>
              <p className="text-3xl font-bold text-primary">0</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-500 mb-2">今日成本</h3>
              <p className="text-3xl font-bold text-secondary">$0.00</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-500 mb-2">本週累計</h3>
              <p className="text-3xl font-bold text-accent">$0.00</p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-xl font-semibold text-primary mb-6">
              Token 用量趨勢
            </h3>
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-500">
                📊 圖表資料將從 Firestore 載入
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 BotsUP. AI Agent Diary
          </p>
        </div>
      </footer>
    </main>
  );
}
