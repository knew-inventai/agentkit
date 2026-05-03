# Agent

Agent 是定義 Claude Code Sub-Agent 行為的 Markdown 文件，讓 Claude Code 在特定子任務中以獨立代理模式運行。

## 安裝路徑

```
~/.claude/agents/{name}.md
```

注意：Agent 是**單一檔案**，直接放在 `agents/` 目錄下（不像 Skill 有子目錄）。

## 主體格式

Agent Markdown 建議包含以下 frontmatter：

```markdown
---
name: my-agent
description: 當使用者需要...時由此代理接管（此欄位影響自動路由）
color: purple
---

# 代理職責

...
```

`description` 欄位非常重要：Claude Code 根據此描述決定是否自動派遣此 Agent。

## Manifest（package.json）

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "description": "一句話描述",
  "_agentkit": {
    "type": "agent",
    "tags": ["automation", "review"],
    "compatible": ["claude-code"]
  }
}
```

## 安裝指令

### Claude Code

```shell
# 全域安裝
curl -fsSL https://raw.githubusercontent.com/knew-inventai/agentkit-agents/main/{name}/AGENT.md \
  --create-dirs -o ~/.claude/agents/{name}.md

# 專案安裝（僅此專案有效）
curl -fsSL https://raw.githubusercontent.com/knew-inventai/agentkit-agents/main/{name}/AGENT.md \
  --create-dirs -o .claude/agents/{name}.md
```

## 使用方式

安裝後，Claude Code 會在適合的情境**自動**啟用對應的 Sub-Agent，無需手動呼叫。

---

> **參考文獻：** [Claude Code — Sub-agents](https://code.claude.com/docs/zh-TW/sub-agents) · [Claude Code — Subagent 詞彙](https://code.claude.com/docs/zh-TW/glossary#subagent) · [Codex — Subagents](https://developers.openai.com/codex/concepts/subagents) · [完整參考文獻列表](/docs?page=references)
