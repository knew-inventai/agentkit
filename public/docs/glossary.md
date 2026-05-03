# 名詞解釋

本頁解釋 AgentKit 及相關 AI coding 工具生態中常見的術語。  
部分術語在 Claude Code 與 Codex 之間有對應關係，會一併說明。

> 外部官方定義請參閱 [參考文獻](/docs?page=references)。

---

## A

### AGENTS.md
Codex 的持久化指令檔案，等同於 Claude Code 的 `CLAUDE.md`。放置於 repo 根目錄（`AGENTS.md`）或使用者全域目錄（`~/.codex/AGENTS.md`）。每次 session 開始時自動載入，提供 repo 規範、架構說明等持久化上下文。

**對應：** Claude Code → `CLAUDE.md`

**參考：** [Codex — Customization](https://developers.openai.com/codex/concepts/customization)

---

### Agent（Sub-Agent）
一個擁有獨立 context window 與自訂系統提示的專門 AI 助手，用於處理委派的子任務。在 Claude Code 中以 `~/.claude/agents/{name}.md` 的形式存在；`description` 欄位決定 Claude 是否自動派遣此 agent 處理特定任務。

在 AgentKit 中，`agent` 是一種套件類型，主體檔案為 `AGENT.md`，儲存於 `agentkit-agents` repo。

**對應：** Claude Code → Sub-Agent；Codex → Subagent

**參考：** [Claude Code — Subagent 詞彙](https://code.claude.com/docs/zh-TW/glossary#subagent)、[Codex — Subagents](https://developers.openai.com/codex/concepts/subagents)

---

### AgentKit
Inventai 打造的 AI 工具市集，提供 Skill、Agent、MCP Server、Plugin 四種套件類型的瀏覽、安裝與發布功能。前端為 React SPA，後端為 Cloudflare Worker + D1，套件內容存於 GitHub category repos。

---

### Agentic Loop
Claude 執行每個任務的循環：收集上下文 → 採取行動 → 驗證結果 → 重複，直到完成。Skills、Agents、Hooks、MCP 都是在此循環的特定階段插入的擴展點。

**參考：** [Claude Code — Agentic Loop](https://code.claude.com/docs/zh-TW/glossary#agentic-loop)

---

## C

### Category Repo
AgentKit 用來存放各類型套件的 GitHub repository：

| Repo | 套件類型 |
|------|---------|
| `agentkit-skills` | Skill |
| `agentkit-agents` | Agent |
| `agentkit-mcp` | MCP Server |
| `agentkit-plugins` | Plugin |

每個 repo 內以套件名稱為子目錄，包含 `package.json`（manifest）與主體檔案。

---

### CLAUDE.md
Claude Code 的持久化指令檔案。每個 session 開始時作為系統提示後的使用者訊息載入，在 compaction 後仍保留並從磁碟重新讀取。可放在專案根目錄（`./CLAUDE.md`）或使用者全域目錄（`~/.claude/CLAUDE.md`）。

**對應：** Codex → `AGENTS.md`

**參考：** [Claude Code — CLAUDE.md](https://code.claude.com/docs/zh-TW/glossary#claude-md)

---

### Cloudflare Worker
AgentKit 的後端 API，以 Hono + TypeScript 實作，部署於 Cloudflare Workers。負責 GitHub OAuth 驗證、套件索引（D1）的讀寫、以及接收 category repos 的 sync 推送。

---

### Context Window
AI 模型一次 session 的工作記憶，包含對話歷史、載入的檔案、CLAUDE.md、skills 等。填滿時觸發 compaction（自動摘要）。

**參考：** [Claude Code — Context Window](https://code.claude.com/docs/zh-TW/glossary#context-window)

---

## D

### D1
Cloudflare 的 serverless SQLite 資料庫服務。AgentKit 使用 D1 儲存套件索引（名稱、類型、描述、下載數、按讚數等），供前端快速查詢，無需每次直接讀取 GitHub。

---

## H

### Hook
在 AI coding 工具生命週期特定點自動執行的使用者定義處理程式，例如工具執行前、檔案編輯後、session 開始時。屬於確定性觸發（非由模型自行決定）。Claude Code 與 Codex 均支援 hooks。

**參考：** [Claude Code — Hook](https://code.claude.com/docs/zh-TW/glossary#hook)、[Codex — Hooks](https://developers.openai.com/codex/hooks)

---

## M

### Manifest
AgentKit 套件的元資料檔案，即每個套件目錄下的 `package.json`。必須包含 `name`、`version`、`description`、`author`、`license` 以及 `_agentkit` 欄位（含 `type`、`tags`、`compatible`）。

---

### MCP（Model Context Protocol）
Anthropic 提出的開放標準，用於將 AI 工具連接到外部資料來源與服務（如資料庫、API、第三方工具）。Claude Code 與 Codex 均支援 MCP。

在 AgentKit 中，`mcp` 是一種套件類型，主體檔案為 `mcp-config.json`，安裝時需合併到 Claude Code 的 `settings.json`。

**參考：** [Claude Code — MCP](https://code.claude.com/docs/zh-TW/glossary#mcp-model-context-protocol)、[Codex — MCP](https://developers.openai.com/codex/mcp)

---

## P

### Package
AgentKit 中的可安裝單元，泛指 Skill、Agent、MCP Server、Plugin 四種類型之一。每個 package 包含 `package.json`（manifest）與主體檔案，存放於對應的 category repo。

---

### Plugin
包含 Slash Commands、Hooks、MCP Server 設定及其他資源的多檔案套件，打包為單一可安裝單元。Claude Code 與 Codex 對 Plugin 的定義基本一致：將 skills、app integrations、MCP servers 捆綁在一起。

在 AgentKit 中，plugin 是最進階的套件類型，需透過 GitHub PR 發布（不支援網頁表單）。

**對應：** Claude Code Plugin ≈ Codex Plugin

**參考：** [Claude Code — Plugin](https://code.claude.com/docs/zh-TW/glossary#plugin)、[Codex — Plugins](https://developers.openai.com/codex/plugins)

---

## S

### Skill
包含指令、知識或工作流程的 Markdown 檔案，讓 AI 工具以特定角色或流程執行任務。Claude Code 中以 `/skill-name` 呼叫，或由 Claude 在相關情境自動載入。

在 AgentKit 中，`skill` 是一種套件類型，主體檔案為 `SKILL.md`，安裝至 `~/.claude/skills/{name}/SKILL.md`。

**注意：** Codex 中 `commands/` 目錄的 Slash Commands 與 Claude Code 的 `skills/` 機制相同（兩個名稱都有效）。

**參考：** [Claude Code — Skill](https://code.claude.com/docs/zh-TW/glossary#skill)、[Codex — Skills](https://developers.openai.com/codex/skills)

---

### Sync Secret（AGENTKIT_SYNC_SECRET）
AgentKit 系統中用於驗證 category repos 推送到 Cloudflare Worker 的共享密鑰。category repo 的 GitHub Actions workflow 在 sync 時以 `Bearer {secret}` 方式傳遞，Worker 驗證後才寫入 D1。

---

## V

### Vite / VITE_*
AgentKit 前端使用 [Vite](https://vitejs.dev/) 作為建置工具。環境變數需以 `VITE_` 為前綴才能在前端程式碼中存取（如 `VITE_GITHUB_ORG`、`VITE_API_BASE_URL`）。在 GitHub Pages 部署時，這些值由 GitHub Actions secrets 在 build 時注入。

---

> **參見：** [參考文獻](/docs?page=references)
