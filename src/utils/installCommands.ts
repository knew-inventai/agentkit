import type { InstallScope, InstallTool, PackageType } from '../types'
import { getRawFileUrl, getRawFileUrlAtTag } from '../services/github'

const ORG = import.meta.env.VITE_GITHUB_ORG

export interface InstallCommand {
  title: string
  command: string
  language: 'shell'
}

export function getInstallCommands(
  tool: InstallTool,
  scope: InstallScope,
  type: PackageType,
  name: string,
  version?: string,
): InstallCommand[] {
  const repo = `agentkit-${type}s`
  const repoUrl = `https://github.com/${ORG}/${repo}`
  const rawUrl = version
    ? getRawFileUrlAtTag(type, name, version)
    : getRawFileUrl(type, name)

  // ─── GitHub Copilot ───────────────────────────────────

  if (tool === 'copilot') {
    if (type === 'skill') {
      const scopeFlag = scope === 'global' ? '--scope user' : '--scope project'
      const installCmd = version
        ? `gh skill install ${ORG}/${repo} ${name}@${version} ${scopeFlag}`
        : `gh skill install ${ORG}/${repo} ${name} ${scopeFlag}`
      return [
        {
          title: '方式一：gh skill 指令（推薦）',
          command: installCmd,
          language: 'shell',
        },
        {
          title: '方式二：手動安裝',
          command: [
            `# 下載至個人技能目錄`,
            `curl -fsSL ${rawUrl} \\`,
            `  --create-dirs -o ${scope === 'global' ? '~/.copilot' : '.github'}/skills/${name}/SKILL.md`,
          ].join('\n'),
          language: 'shell',
        },
      ]
    }
    if (type === 'plugin') {
      const commands: InstallCommand[] = []
      if (!version) {
        commands.push({
          title: '方式一：copilot plugin 指令（推薦）',
          command: [
            `copilot plugin marketplace add ${ORG}/${repo}`,
            `copilot plugin install ${name}@${repo}`,
          ].join('\n'),
          language: 'shell',
        })
      }
      const pluginDir = scope === 'global'
        ? `~/.copilot/plugins/${name}`
        : `.github/plugins/${name}`
      commands.push({
        title: version ? `git 安裝 v${version}` : '方式二：git 手動安裝',
        command: [
          `git clone --depth=1 --filter=blob:none --sparse \\`,
          `  ${repoUrl}.git /tmp/${repo}`,
          `cd /tmp/${repo} && git sparse-checkout set ${name}`,
          `mkdir -p ${pluginDir}`,
          `cp -r ${name}/. ${pluginDir}/`,
        ].join('\n'),
        language: 'shell',
      })
      return commands
    }
    if (type === 'mcp') {
      return [
        {
          title: 'MCP 設定（手動）',
          command: `# 下載設定檔後，加入 VS Code Copilot MCP 設定\ncurl -fsSL ${rawUrl} -o ~/Downloads/${name}.json`,
          language: 'shell',
        },
      ]
    }
    // agent: Copilot custom agent profile is Markdown, compatible with AgentKit AGENT.md
    if (type === 'agent') {
      const agentPath = scope === 'global'
        ? `~/.copilot/agents/${name}.md`
        : `.github/agents/${name}.md`
      return [
        {
          title: version ? `curl 安裝 v${version}` : 'curl 安裝',
          command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${agentPath}`,
          language: 'shell',
        },
      ]
    }
    return []
  }

  // ─── Claude Code ──────────────────────────────────────

  if (tool === 'claude-code') {

    // Plugin: /plugin marketplace 或 git sparse-checkout
    if (type === 'plugin') {
      const pluginDir = scope === 'global'
        ? `~/.claude/plugins/${repo}/${name}`
        : `.claude/plugins/${repo}/${name}`
      const commands: InstallCommand[] = []
      if (!version) {
        commands.push({
          title: '方式一：/plugin 指令（推薦）',
          command: `/plugin marketplace add ${ORG}/${repo}\n/plugin install ${name}@${repo}`,
          language: 'shell',
        })
      }
      commands.push({
        title: version ? `git 安裝 v${version}` : '方式二：git 手動安裝',
        command: [
          `git clone --depth=1 --filter=blob:none --sparse \\`,
          `  ${repoUrl}.git /tmp/${repo}`,
          `cd /tmp/${repo} && git sparse-checkout set ${name}`,
          `mkdir -p ${pluginDir}`,
          `cp -r ${name}/. ${pluginDir}/`,
        ].join('\n'),
        language: 'shell',
      })
      return commands
    }

    // MCP: 下載 config 檔 + 手動加入 settings
    if (type === 'mcp') {
      const configDir = scope === 'global'
        ? `~/.claude/mcp-configs`
        : `.claude/mcp-configs`
      return [
        {
          title: '步驟 1：下載 MCP 設定檔',
          command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${configDir}/${name}.json`,
          language: 'shell',
        },
        {
          title: '步驟 2：加入 Claude Code settings',
          command: `# 將 ${configDir}/${name}.json 的內容\n# 合併至 ~/.claude/settings.json 的 "mcpServers" 欄位`,
          language: 'shell',
        },
      ]
    }

    // Agent: installs to ~/.claude/agents/{name}.md (flat file)
    if (type === 'agent') {
      const agentPath = scope === 'global'
        ? `~/.claude/agents/${name}.md`
        : `.claude/agents/${name}.md`
      const commands: InstallCommand[] = []
      if (!version) {
        commands.push({
          title: '方式一：Claude Code Marketplace（推薦）',
          command: `/plugin marketplace add ${ORG}/${repo}\n/plugin install ${name}@${repo}`,
          language: 'shell',
        })
      }
      commands.push({
        title: version ? `curl 安裝 v${version}` : '方式二：curl 手動安裝',
        command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${agentPath}`,
        language: 'shell',
      })
      return commands
    }

    // Skill / Prompt: curl 到 skills 目錄
    const skillPath = scope === 'global'
      ? `~/.claude/skills/${name}/SKILL.md`
      : `.claude/skills/${name}/SKILL.md`
    const commands: InstallCommand[] = []
    if (!version) {
      commands.push({
        title: '方式一：Claude Code Marketplace（推薦）',
        command: `/plugin marketplace add ${ORG}/${repo}\n/plugin install ${name}@${repo}`,
        language: 'shell',
      })
    }
    commands.push({
      title: version ? `curl 安裝 v${version}` : '方式二：curl 手動安裝',
      command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${skillPath}`,
      language: 'shell',
    })
    return commands
  }

  // ─── OpenAI Codex ─────────────────────────────────────

  if (tool === 'codex') {
    if (type === 'skill') {
      const skillPath = scope === 'global'
        ? `~/.agents/skills/${name}/SKILL.md`
        : `.agents/skills/${name}/SKILL.md`
      return [
        {
          title: version ? `curl 安裝 v${version}` : 'curl 安裝',
          command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${skillPath}`,
          language: 'shell',
        },
      ]
    }
    if (type === 'plugin') {
      const commands: InstallCommand[] = []
      if (!version) {
        commands.push({
          title: '方式一：codex plugin marketplace 指令（推薦）',
          command: [
            `codex plugin marketplace add ${ORG}/${repo}`,
            `# 然後在 Codex Plugin Directory 中安裝 ${name}`,
          ].join('\n'),
          language: 'shell',
        })
      }
      const pluginDir = scope === 'global'
        ? `~/.codex/plugins/${name}`
        : `.agents/plugins/${name}`
      commands.push({
        title: version ? `git 安裝 v${version}` : '方式二：git 手動安裝',
        command: [
          `git clone --depth=1 --filter=blob:none --sparse \\`,
          `  ${repoUrl}.git /tmp/${repo}`,
          `cd /tmp/${repo} && git sparse-checkout set ${name}`,
          `mkdir -p ${pluginDir}`,
          `cp -r ${name}/. ${pluginDir}/`,
        ].join('\n'),
        language: 'shell',
      })
      return commands
    }
    if (type === 'mcp') {
      return [
        {
          title: 'MCP 設定（手動）',
          command: `# 下載設定檔後，加入 ~/.codex/config.toml 的 [[mcp_servers]] 區塊\ncurl -fsSL ${rawUrl} -o ~/Downloads/${name}.json`,
          language: 'shell',
        },
      ]
    }
    // agent: Codex subagents use TOML format, incompatible with AgentKit's Markdown AGENT.md
    if (type === 'agent') {
      return [
        {
          title: '格式不相容（僅供參考）',
          command: [
            `# Codex subagent 使用 TOML 格式（.codex/agents/<name>.toml）`,
            `# AgentKit 的 AGENT.md 為 Markdown 格式，需手動轉換`,
            `# 原始檔案下載：`,
            `curl -fsSL ${rawUrl} -o ~/Downloads/${name}.md`,
          ].join('\n'),
          language: 'shell',
        },
      ]
    }
    return []
  }

  // ─── 通用下載 ─────────────────────────────────────────

  if (type === 'plugin') {
    const treeUrl = version
      ? `${repoUrl}/tree/${name}%40${version}/${name}`
      : `${repoUrl}/tree/main/${name}`
    return [
      {
        title: 'GitHub 原始碼',
        command: `# 開啟瀏覽器查看：\n# ${treeUrl}`,
        language: 'shell',
      },
    ]
  }

  const ext = type === 'mcp' ? 'json' : 'md'
  return [
    {
      title: version ? `下載 v${version} 到本機` : '下載到本機',
      command: `curl -fsSL ${rawUrl} -o ~/Downloads/${name}.${ext}`,
      language: 'shell',
    },
  ]
}

