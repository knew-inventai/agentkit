# 安裝套件

## 找到套件

前往 [瀏覽頁面](/agentkit/#/browse)，使用類型或標籤篩選，找到想要的套件後點擊進入詳情頁。

## 選擇安裝工具

詳情頁提供三個分頁：

| 分頁 | 適用情境 |
|------|---------|
| Claude Code | 使用 Claude Code CLI 的使用者（推薦） |
| Cursor | Cursor 編輯器（僅 Skill 類型） |
| 下載 | 手動管理或其他編輯器 |

## Skill 安裝

```shell
# 全域（所有專案可用）
curl -fsSL {raw_url} --create-dirs -o ~/.claude/skills/{name}/SKILL.md

# 專案（僅當前目錄）
curl -fsSL {raw_url} --create-dirs -o .claude/skills/{name}/SKILL.md
```

## Agent 安裝

```shell
# 全域
curl -fsSL {raw_url} --create-dirs -o ~/.claude/agents/{name}.md

# 專案
curl -fsSL {raw_url} --create-dirs -o .claude/agents/{name}.md
```

## MCP Server 安裝

```shell
# 下載設定
curl -fsSL {raw_url} -o /tmp/{name}-mcp.json

# 合併到全域設定（需要 jq）
jq -s '.[0] * .[1]' ~/.claude/settings.json /tmp/{name}-mcp.json > /tmp/merged.json \
  && mv /tmp/merged.json ~/.claude/settings.json
```

## Plugin 安裝

```shell
# Claude Code Marketplace
/plugin marketplace add knew-inventai/agentkit-plugins
/plugin install {name}@agentkit-plugins
```

## 指定版本

套件詳情頁可切換歷史版本，版本切換後安裝指令會自動更新為對應版本的 raw URL。
