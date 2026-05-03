# 名詞解釋

本頁說明使用 AgentKit 時會遇到的常見術語。

---

## AgentKit

Inventai 打造的 AI 工具市集，提供 Skill、Agent、MCP Server、Plugin 四種套件類型的瀏覽、安裝與發布。

---

## Skill

一個 Markdown 檔案（`SKILL.md`），定義 Claude Code 執行特定任務時應遵循的角色與規則。安裝後放置於 `~/.claude/skills/{name}/SKILL.md`，以 `/skill-name` 呼叫。

Codex 的等效機制同樣稱為 Skill，安裝路徑略有不同。

**參考：** [套件類型 — Skill](/docs?page=types/skill)

---

## Agent

一個 Markdown 檔案（`AGENT.md`），定義 Claude Code 的 Sub-Agent：一個負責特定子任務的獨立 AI 助手。安裝後放置於 `~/.claude/agents/{name}.md`，Claude 會在適合的情境自動派遣，無需手動呼叫。

**參考：** [套件類型 — Agent](/docs?page=types/agent)

---

## MCP Server

實作 Model Context Protocol（MCP）的服務，讓 Claude Code 連接外部工具或資料來源（如資料庫、API、第三方服務）。安裝時需將設定合併到 Claude Code 的 `settings.json`。

MCP 是由 Anthropic 提出的開放標準，Claude Code 與 Codex 均支援。

**參考：** [套件類型 — MCP Server](/docs?page=types/mcp)

---

## Plugin

包含 Slash Commands、Hooks、MCP Server 等多個檔案的進階套件，打包為單一可安裝單元。Plugin 透過 Claude Code Marketplace 安裝，或手動複製目錄。

**參考：** [套件類型 — Plugin](/docs?page=types/plugin)

---

## CLAUDE.md

Claude Code 的持久化指令檔案，放置於專案根目錄或 `~/.claude/CLAUDE.md`（全域）。每次 session 開始時自動載入，提供 Claude 需要遵循的規範與上下文。

Skill 的主體內容通常寫在 `SKILL.md` 中，而非 `CLAUDE.md`。

---

## AGENTS.md

Codex 的持久化指令檔案，功能等同於 Claude Code 的 `CLAUDE.md`。放置於 repo 根目錄供整個團隊共用，或 `~/.codex/AGENTS.md` 供個人全域使用。

---

> **參見：** [參考文獻](/docs?page=references)
