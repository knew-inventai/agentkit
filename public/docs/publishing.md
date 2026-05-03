# 發布套件

## 前置條件

- 已登入 GitHub（點擊右上角 GitHub 按鈕授權）
- 擁有 GitHub 帳號

## Skill / Agent / MCP Server 發布流程

1. 前往 [發布頁面](/agentkit/#/publish)
2. 選擇套件類型
3. 填寫：
   - **套件名稱**（slug，英文小寫加連字號）
   - **版本**（語義化版本，如 `1.0.0`）
   - **描述**（一句話描述用途）
   - **標籤**（逗號分隔，如 `code,review`）
4. 貼上主體內容（SKILL.md / AGENT.md / mcp-config.json）
5. 點擊「提交」

系統會自動在對應的 category repo 開一個 Pull Request，並通知維護者審核。

## Plugin 發布流程

Plugin 包含多個檔案，需透過 GitHub 直接提交：

1. Fork `knew-inventai/agentkit-plugins`
2. 在 fork 中建立 `your-plugin-name/` 目錄，依[目錄結構](/docs?page=types/plugin)填入檔案
3. 開 Pull Request 到主 repo

## 審核標準

- `package.json` 格式正確（含 `_agentkit` 欄位）
- 主體檔案存在且非空
- 內容對 Claude Code 使用者有實際幫助
- 無惡意程式碼或誤導性說明

## 更新套件

已登入且為套件作者，進入套件詳情頁即可看到「更新」按鈕，可直接在網頁上更新內容並提交新 PR。
