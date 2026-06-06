# Agent 工作流模式 · Agent Workflow Patterns

> 把「agent 工作流」整理成一個有佐證、可互動、可分享的雙語教學網站 —— 六種模式，每個論點都附一手權威來源。

這個網站把建構有效 LLM 系統的核心模式整理成清楚、可瀏覽的形式：先講「工作流 vs 代理」的核心概念，再逐一拆解五種工作流模式（提示鏈、路由、平行化、協調者—工作者、評估者—優化者）與自主代理。內容不只照單一篇部落格，而是回到 **Anthropic、OpenAI、Google** 等一手來源，以及 ReAct、Reflexion 等學術論文交叉佐證；每個模式都標出「何時用、取捨、實例」與出處，並在概念頁說明為什麼不同來源對「到底有幾種模式」說法不一。

---

## 🔗 線上版 / Live

| | |
|---|---|
| 🌐 網站 | <https://tingwei161803.github.io/agent-workflow-design/> |

> 直接點進去就能用，無需安裝。每個子頁都有獨立網址（例如 `…/chaining.html`、`…/agent.html`），方便分享到特定模式。

---

## ✨ 功能特色

- 🌏 **雙語切換** — 中文 / English 一鍵整頁切換，無語言殘留
- 🌗 **深色 / 淺色模式** — 預設深色「玻璃質感」主題，可手動切換並記憶
- 🧭 **多頁面導覽** — 首頁總覽 + 概念 + 六種模式 + 比較 + 練習 + 來源，共 11 頁，跨頁共用導航
- 🔍 **比較表可搜尋／排序／篩選** — 依「類型（工作流／代理）」或「出處」即時篩選
- 🧠 **練習模組** — 術語速查（詞彙表）、翻卡（flashcards）、隨堂測驗（quiz，即時對錯＋計分；僅存於當次瀏覽）
- 🔗 **每個論點都附來源** — 內文與「參考來源」頁皆可點開一手出處
- 📱 **響應式設計** — 手機、平板、桌機皆適配
- ⚡ **純靜態** — 無後端、無建置流程、載入快

---

## 📂 內容結構 / 資料來源

本站內容整理、交叉佐證自 **Anthropic、OpenAI、Google、LangGraph、Lilian Weng 等一手與權威來源**（完整清單見站內「參考來源 / Sources」頁）。

```
agent-workflow-design/
├── index.html          # 首頁總覽（hub）
├── concept.html        # 核心概念：Workflow vs Agent
├── chaining.html       # 1 · 提示鏈 Prompt Chaining
├── routing.html        # 2 · 路由 Routing
├── parallelization.html# 3 · 平行化 Parallelization
├── orchestrator.html   # 4 · 協調者—工作者 Orchestrator–Workers
├── evaluator.html      # 5 · 評估者—優化者 Evaluator–Optimizer
├── agent.html          # 6 · 自主代理 Autonomous Agents
├── compare.html        # 六種模式比較表
├── practice.html       # 練習：詞彙表 / 翻卡 / 測驗
├── sources.html        # 參考來源清單
├── assets/             # styles.css · shell.js（共用 chrome）· app.js（版型引擎）
├── data/data.js        # 唯一資料層（雙語內容、SITE_PAGES）
└── .nojekyll
```

> ⚠️ **非官方整理**：本網站為個人教學用途之非官方整理，內容彙整並交叉佐證自上述來源；
> 如有錯誤或出入，請以各官方來源為準。引用的句子已盡量貼近原文，僅作教學說明。

---

## 🛠 本機使用

```bash
# 1. clone 專案
git clone git@github.com:tingwei161803/agent-workflow-design.git
cd agent-workflow-design

# 2a. 最簡單：直接開啟首頁
open index.html

# 2b. 或啟動本機伺服器（建議，跨頁導覽 / 深連結才完全正常）
uv run python -m http.server 4173
# 然後瀏覽 http://localhost:4173
```

> 本專案為純靜態網站，不需安裝任何依賴。若要跑本機伺服器，一律使用 `uv`。

---

## 📊 流量分析

本網站使用 **Google Analytics 4**（GA4 property：`Agent Workflow`）蒐集匿名的瀏覽流量數據，用於了解造訪情況。除此之外不蒐集任何個人資料。若你依受眾所在地區需要 cookie 同意機制，請另行評估。

---

## 📝 聲明 / License

- 本站為非官方教學整理，各引用內容之著作權歸原始來源所有。
- 程式碼以 **MIT** 授權釋出。
- 若你是權利人並希望調整或移除內容，請開 issue 聯絡。
