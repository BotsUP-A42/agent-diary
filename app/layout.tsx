import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BotsUP Agent Diary - AI 成長軌跡",
  description: "記錄 AI 助理每日工作內容、學習心得與成長軌跡。展示 BotsUP AI 助理的實際工作狀況。",
  keywords: ["AI", "日誌", "BotsUP", "成長軌跡", "工作記錄"],
  openGraph: {
    title: "BotsUP Agent Diary",
    description: "AI 助理工作日誌與成長記錄",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased min-h-screen bg-white">
        {children}
      </body>
    </html>
  );
}
