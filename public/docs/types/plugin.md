# Plugin

Plugin 是最完整的套件類型，可包含 Slash Commands、Hooks、MCP Server 設定，以及自訂 Skills 和 Agents。

## 目錄結構

```
your-plugin-name/
├── plugin.json                 # AgentKit manifest
├── .claude-plugin/
│   └── plugin.json             # Claude Code 原生 manifest
├── commands/
│   └── my-command.md           # Slash commands（格式同 Skill）
├── hooks/                      # 可選
│   └── post-commit.sh
└── README.md
```

## 安裝方式

Plugin 透過 Claude Code Marketplace 安裝，或手動複製目錄。

### Claude Code Marketplace

```shell
/plugin marketplace add knew-inventai/agentkit-plugins
/plugin install {name}@agentkit-plugins
```

### 手動安裝

```shell
git clone https://github.com/knew-inventai/agentkit-plugins.git /tmp/agentkit-plugins
cp -r /tmp/agentkit-plugins/{name} ~/.claude/plugins/{name}
```

## Manifest（plugin.json）

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "一句話描述",
  "_agentkit": {
    "type": "plugin",
    "tags": ["productivity"],
    "compatible": ["claude-code"]
  }
}
```

## 發布 Plugin

Plugin 包含多個檔案，需透過 GitHub Pull Request 發布。前往 [發布頁面](/agentkit/#/publish)，選擇 Plugin 類型，即可看到詳細的 Fork & PR 流程說明。

---

> **參考文獻：** [Claude Code — Plugins](https://code.claude.com/docs/zh-TW/plugins) · [Codex — Plugins](https://developers.openai.com/codex/plugins) · [完整參考文獻列表](/docs?page=references)
