import Link from "next/link";

export default function LogsPage() {
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
          
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              日誌列表準備中
            </h3>
            <p className="text-gray-500">
              Firebase Firestore 連接後將顯示所有日誌記錄
            </p>
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
