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

## 持久化指令檔案

各 AI coding 工具都有一個「持久化指令檔案」，讓你把專案規範、偏好設定寫進去，每次 session 開始時自動載入。以下是各工具的對應檔案：

| 工具 | 檔案 | 放置位置 |
|------|------|---------|
| Claude Code | `CLAUDE.md` | 專案根目錄 或 `~/.claude/CLAUDE.md`（全域） |
| Codex | `AGENTS.md` | 專案根目錄 或 `~/.codex/AGENTS.md`（全域） |
| Gemini CLI | `GEMINI.md` | 專案根目錄 或 `~/.gemini/GEMINI.md`（全域） |
| GitHub Copilot | `.github/copilot-instructions.md` | 專案 `.github/` 目錄 |

**注意：** GitHub Copilot 的 Agent 功能也能識別 `AGENTS.md`、`CLAUDE.md`、`GEMINI.md`，因此一份檔案可同時被多個工具使用。

Skill 的主體內容寫在 `SKILL.md` 中；持久化指令檔案則是給工具本身的行為規範，兩者用途不同。

**參考：**
- [Claude Code — CLAUDE.md](https://code.claude.com/docs/zh-TW/glossary#claude-md)
- [Codex — AGENTS.md](https://developers.openai.com/codex/guides/agents-md)
- [Gemini CLI — GEMINI.md](https://geminicli.com/docs/cli/gemini-md/)
- [GitHub Copilot — 自訂指令](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)

---

> **參見：** [參考文獻](/docs?page=references)
