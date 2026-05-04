# Skill

Skill 是包含完整指令與執行規則的 Markdown 文件，讓 Claude Code 以特定角色執行任務。

## 安裝路徑

```
~/.claude/skills/{name}/SKILL.md
```

## 主體格式

Skill 以 Markdown 撰寫，通常包含：

- **角色定義**（Role）
- **行為規則**（Rules）
- **輸出格式**（Output Format）
- **範例**（Examples）

檔案名稱固定為 `SKILL.md`。

## Manifest（package.json）

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "一句話描述",
  "_agentkit": {
    "type": "skill",
    "tags": ["code", "review"],
    "compatible": ["claude-code"]
  }
}
```

## 安裝指令

### Claude Code（推薦）

```shell
# 全域安裝
curl -fsSL https://raw.githubusercontent.com/knew-inventai/agentkit-skills/main/{name}/SKILL.md \
  --create-dirs -o ~/.claude/skills/{name}/SKILL.md
```

### Cursor

Cursor 使用 `~/.cursor/rules/` 路徑，格式相容：

```shell
curl -fsSL https://raw.githubusercontent.com/knew-inventai/agentkit-skills/main/{name}/SKILL.md \
  --create-dirs -o ~/.cursor/rules/{name}.mdc
```

## 使用方式

安裝後，在 Claude Code 中輸入：

```
/skill {name}
```

即可啟用該 Skill。

---

> **參考文獻：** [Claude Code — Skills](https://code.claude.com/docs/zh-TW/skills) · [Codex — Skills](https://developers.openai.com/codex/skills) · [完整參考文獻列表](/agentkit/docs?page=references)
