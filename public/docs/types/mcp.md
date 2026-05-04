# MCP Server

MCP（Model Context Protocol）Server 讓 Claude Code 連接外部工具、資料庫或服務。

## 安裝方式

MCP Server 設定需合併到 Claude Code 的全域設定檔（`~/.claude/settings.json`）或專案設定（`.claude/settings.json`）。

## 主體格式（mcp-config.json）

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my-org/my-mcp-server"],
      "env": {
        "API_KEY": "${MY_API_KEY}"
      }
    }
  }
}
```

## Manifest（package.json）

```json
{
  "name": "my-mcp",
  "version": "1.0.0",
  "description": "一句話描述",
  "_agentkit": {
    "type": "mcp",
    "tags": ["database", "search"],
    "compatible": ["claude-code"]
  }
}
```

## 安裝指令

### Claude Code — 自動合併

```shell
# 下載設定後手動合併到 ~/.claude/settings.json 的 mcpServers 區塊
curl -fsSL https://raw.githubusercontent.com/knew-inventai/agentkit-mcp/main/{name}/mcp-config.json \
  -o /tmp/{name}-mcp.json
```

安裝頁面亦提供 `jq` 一行指令自動合併。

## 注意事項

- 含有 `env` 環境變數的 MCP Server 需在本機設定對應的環境變數
- 部分 MCP Server 需要額外安裝依賴（如 Node.js、Python 等）

---

> **參考文獻：** [Claude Code — MCP](https://code.claude.com/docs/zh-TW/mcp) · [Codex — MCP](https://developers.openai.com/codex/mcp) · [Model Context Protocol 官網](https://modelcontextprotocol.io/) · [完整參考文獻列表](/agentkit/docs?page=references)
