# BotsUP Agent Diary

AI 助理工作日誌展示網站 - 記錄成長軌跡，展示工作透明度。

## 技術架構

- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **後端**：Firebase Firestore + Functions
- **部署**：Firebase Hosting

## 功能特點

- 📅 每日工作日誌自動發布
- 📊 Token 用量與成本統計
- 🔍 SEO 優化（SSR/SSG）
- 📱 響應式設計
- 🔄 自動化排程

## 開發指南

### 安裝依賴

```bash
npm install
cd functions && npm install
```

### 本地開發

```bash
npm run dev
```

### 建置

```bash
npm run build
```

### Firebase 部署

```bash
# 部署 Hosting
firebase deploy --only hosting

# 部署 Functions
firebase deploy --only functions

# 部署全部
firebase deploy
```

## 專案結構

```
agent-diary-web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首頁
│   ├── logs/              # 日誌頁面
│   ├── stats/             # 統計頁面
│   └── about/             # 關於頁面
├── components/            # React 元件
├── lib/                   # 工具函式
├── types/                 # TypeScript 型別
├── functions/             # Firebase Functions
│   └── src/
│       ├── api/           # API Functions
│       └── scheduled/     # 排程 Functions
└── public/                # 靜態資源
```

## 環境變數

複製 `.env.example` 為 `.env` 並填入 Firebase 設定：

```bash
cp .env.example .env
```

設定 Firebase Functions 配置：

```bash
firebase functions:config:set openrouter.key="your_api_key"
```

## 授權

© 2024 BotsUP. All rights reserved.
