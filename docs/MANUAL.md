# AgentKit 使用手冊

## 簡介

AgentKit 是 [Inventai](https://www.chtinventai.com) 的 AI 工具資源平台，提供 Skill、Prompt、Plugin、MCP Server 的瀏覽、搜尋、發布與安裝。

---

## 工具類型

AgentKit 收錄四種工具類型，功能互補，以下是詳細說明與選用建議。

---

### Skill

**Skill** 是一個包含指令、知識或工作流程的 `SKILL.md` 檔案，讓 Claude 擴充其能力。

- **觸發方式**：Claude 在認為相關時自動載入，或使用者直接輸入 `/skill-name`
- **適合場景**：定義 AI 應如何完成某類任務的「行為規則」，例如 code review 風格、debugging 步驟、發布流程等
- **主體檔案**：`SKILL.md`（Markdown 格式的指令文件）

> 範例：`code-reviewer` — 定義 AI 進行 code review 的標準流程與輸出格式

---

### Prompt

**Prompt** 是可重複使用的提示模板，通常用來設定 AI 的整體行為準則或系統提示。

- **觸發方式**：手動複製內容，貼入 `CLAUDE.md` 或作為 system prompt
- **適合場景**：跨專案通用的行為規範，例如「永遠先思考再實作」、「只做最小必要的修改」
- **主體檔案**：`PROMPT.md`

> 範例：`karpathy-coding-guide` — Andrej Karpathy 整理的 AI 編碼行為準則，減少過度設計與不必要修改

---

### MCP Server

**MCP（Model Context Protocol）** 是一個開放標準，讓 AI 連接外部服務與資料來源。MCP Server 設定檔定義如何啟動一個 MCP server，為 Claude 新增操作外部工具的能力。

- **觸發方式**：設定後由 Claude Code 自動載入，提供新的工具供 Claude 使用
- **適合場景**：連接 GitHub、資料庫、網頁抓取、Slack 等外部服務
- **主體檔案**：`mcp-config.json`（JSON 格式的伺服器設定）

> 範例：`github-mcp` — 串接 GitHub API，讓 Claude 直接操作 issues、PR、commits

---

### Plugin

**Plugin** 是將 Skills、Hooks、Subagents 和 MCP Servers 打包成單一可安裝單元的套件，使用 `/plugin install` 一次安裝所有元件。

- **觸發方式**：`/plugin install` 安裝後，其中的 Skills 與 Commands 自動可用
- **適合場景**：功能完整的工具包，需要組合多個元件時（例如同時包含 slash commands、hooks 和 MCP 設定）
- **主體檔案**：`plugin.json`（manifest + 功能定義）

> 範例：`conventional-commits` — 提供 `/commit` slash command，根據 git diff 自動產生 Conventional Commits 格式訊息

---

### 快速比較

| 類型 | 主要用途 | 安裝方式 | 主體檔案 |
|------|---------|---------|---------|
| **Skill** | 定義 AI 的行為與工作流程 | `/plugin install` | `SKILL.md` |
| **Prompt** | 通用行為準則 / system prompt | 手動複製貼上 | `PROMPT.md` |
| **MCP Server** | 連接外部服務 | 加入 `.mcp.json` | `mcp-config.json` |
| **Plugin** | 多元件工具包 | `/plugin install` | `plugin.json` |

---

## 安裝工具

### Claude Code

每個工具的詳情頁都有「安裝指令」面板，直接複製執行即可。

```bash
# 1. 新增 marketplace 來源（每個類型各一次）
/plugin marketplace add knew-inventai/agentkit-skills

# 2. 安裝指定工具
/plugin install code-reviewer@agentkit-skills
```

### Cursor / 其他編輯器

在詳情頁選擇「Cursor」頁籤，複製 `settings.json` 片段貼入設定檔。

### 手動下載

在詳情頁點擊「下載主體檔案」，或直接從 GitHub 取得：

```bash
curl -O https://raw.githubusercontent.com/knew-inventai/agentkit-skills/main/TOOL_NAME/SKILL.md
```

---

## 發布新工具

### 方法一：透過平台網頁（推薦）

1. 登入後點擊右上角 **「發布工具」**
2. 填寫表單：
   - **類型**：選擇 Skill / Prompt / MCP / Plugin
   - **名稱**：使用 `kebab-case`，例如 `my-awesome-skill`
   - **版本**：遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)，初版填 `1.0.0`
   - **標籤**：以逗號分隔，例如 `review, typescript, security`
   - **主體內容**：貼入對應主體檔案的內容
   - **README.md**（選填）：用 Markdown 撰寫詳細說明文件
3. 點擊「**發布（建立 Pull Request）**」
4. 系統會自動在對應的 category repo 建立一個 Pull Request
5. 等待 maintainer review 並 merge 後，工具即正式上線

### 方法二：直接提交 PR（進階）

如果熟悉 Git，可以直接 fork 對應的 category repo 並建立 PR：

| 類型 | Repository |
|------|-----------|
| Skill | `knew-inventai/agentkit-skills` |
| Prompt | `knew-inventai/agentkit-prompts` |
| MCP | `knew-inventai/agentkit-mcp` |
| Plugin | `knew-inventai/agentkit-plugins` |

每個工具需建立一個獨立目錄，結構如下：

```
your-tool-name/
├── plugin.json       # 必填：manifest（所有類型都需要）
├── SKILL.md          # Skill 的主體內容
├── PROMPT.md         # Prompt 的主體內容
├── mcp-config.json   # MCP Server 的主體內容
└── README.md         # 選填：詳細說明文件
```

---

## Manifest 格式（plugin.json）

每個工具目錄下都需要一個 `plugin.json`：

```json
{
  "name": "my-awesome-skill",
  "version": "1.0.0",
  "description": "一句話說明這個工具的功能（100 字以內）",
  "author": {
    "name": "your-github-username",
    "email": "you@example.com"
  },
  "license": "MIT",
  "_agentkit": {
    "type": "skill",
    "tags": ["review", "typescript"],
    "compatible": ["claude", "openai", "gemini"]
  }
}
```

| 欄位 | 說明 |
|------|------|
| `name` | 工具唯一識別名稱，需與目錄名相同，使用 `kebab-case` |
| `version` | 語意化版本號，例如 `1.0.0` |
| `description` | 簡短說明（100 字以內） |
| `author.name` | 作者 GitHub 帳號或姓名 |
| `license` | 授權類型，預設 `MIT` |
| `_agentkit.type` | `skill` / `prompt` / `mcp` / `plugin` |
| `_agentkit.tags` | 分類標籤陣列 |
| `_agentkit.compatible` | 相容的 AI 平台：`claude`、`openai`、`gemini` 等 |

---

## 更新與版本管理

### 更新工具內容

1. 對 category repo 建立新的 PR，修改對應目錄的檔案
2. 在 `plugin.json` 中更新 `version` 欄位（遵循 SemVer）
3. PR merge 後，平台自動更新

### 建立正式版本（Release）

為工具建立 GitHub Release 可讓使用者在詳情頁看到版本歷史：

1. 前往對應的 category repo，例如 `knew-inventai/agentkit-skills`
2. 點擊 **Releases → Draft a new release**
3. **Tag** 格式：`{工具名稱}/v{版本號}`，例如 `code-reviewer/v1.1.0`
4. **Title**：`code-reviewer v1.1.0`
5. 填寫 Release Notes 說明本版本的變更
6. 點擊 **Publish release**

### SemVer 版本號規則

```
MAJOR.MINOR.PATCH

1.0.0  → 初始版本
1.0.1  → Bug 修正（不影響相容性）
1.1.0  → 新增功能（向下相容）
2.0.0  → 破壞性變更（不相容舊版）
```

---

## 常見問題

**Q：PR 建立後多久會上線？**
A：由 maintainer 人工 review，通常 1–2 個工作天內處理。

**Q：可以刪除已發布的工具嗎？**
A：請聯繫 maintainer 或直接對 category repo 建立移除 PR。

**Q：工具名稱有衝突怎麼辦？**
A：每個 category repo 內名稱不可重複。建議加上作者前綴，例如 `alice-code-reviewer`。

**Q：支援私有工具嗎？**
A：目前平台僅支援公開工具。私有需求請聯繫 Inventai 團隊。
