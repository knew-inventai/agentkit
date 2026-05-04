# 貢獻指南

歡迎對 AgentKit 做出貢獻！

## 貢獻方式

### 提交新套件

最常見的貢獻方式。請參閱 [發布套件](/agentkit/docs?page=publishing) 文件。

### 回報問題

在 [GitHub Issues](https://github.com/knew-inventai/agentkit/issues) 回報：
- 套件安裝問題
- 網站 bug
- 功能建議

### 改善現有套件

如果發現套件有錯誤或可以改善，可以：
1. 在該套件的 GitHub 頁面開 Issue
2. 直接提交修改 PR

### 改善 AgentKit 平台

前端、Worker、驗證邏輯等均為開源：

| Repo | 說明 |
|------|------|
| [agentkit](https://github.com/knew-inventai/agentkit) | React 前端 |
| [agentkit-api](https://github.com/knew-inventai/agentkit-api) | Cloudflare Worker |
| [agentkit-skills](https://github.com/knew-inventai/agentkit-skills) | Skill 套件集 |
| [agentkit-agents](https://github.com/knew-inventai/agentkit-agents) | Agent 套件集 |
| [agentkit-mcp](https://github.com/knew-inventai/agentkit-mcp) | MCP Server 套件集 |
| [agentkit-plugins](https://github.com/knew-inventai/agentkit-plugins) | Plugin 套件集 |

#### 技術架構

| 層 | 技術 | 文件 |
|----|------|------|
| 前端 | React + Vite，部署於 GitHub Pages | [Vite 文件](https://vitejs.dev/guide/) |
| API | Cloudflare Workers（Hono + TypeScript） | [Cloudflare Workers 文件](https://developers.cloudflare.com/workers/) |
| 資料庫 | Cloudflare D1（serverless SQLite） | [Cloudflare D1 文件](https://developers.cloudflare.com/d1/) |
| 套件儲存 | GitHub Repositories（每種類型一個 repo） | — |
| 驗證 | GitHub OAuth App | [GitHub OAuth 文件](https://docs.github.com/en/apps/oauth-apps) |

## 套件品質標準

- 主體檔案（SKILL.md / AGENT.md 等）應包含清楚的用途說明
- 版本遵循 [語義化版本](https://semver.org/lang/zh-TW/)
- 標籤使用英文小寫、具描述性（如 `code-review`、`git`、`testing`）
- README 說明安裝步驟與使用範例

## 行為準則

所有貢獻者需遵守基本的開源社群禮儀，尊重其他貢獻者，共同維護友善的環境。
