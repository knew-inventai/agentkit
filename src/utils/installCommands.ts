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
  const scopeFlag = scope === 'global' ? '--scope user' : '--scope project'

  // ─── GitHub Copilot ───────────────────────────────────

  if (tool === 'copilot') {
    if (type === 'skill') {
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
            `curl -fsSL ${rawUrl} \\`,
            `  --create-dirs -o ${scope === 'global' ? '~/.copilot' : '.github'}/skills/${name}/SKILL.md`,
          ].join('\n'),
          language: 'shell',
        },
      ]
    }
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
    return []
  }

  // ─── Claude Code ──────────────────────────────────────

  if (tool === 'claude-code') {
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
    // skill
    const skillPath = scope === 'global'
      ? `~/.claude/skills/${name}/SKILL.md`
      : `.claude/skills/${name}/SKILL.md`
    return [
      {
        title: version ? `curl 安裝 v${version}` : 'curl 安裝',
        command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${skillPath}`,
        language: 'shell',
      },
    ]
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

  if (type === 'skill') {
    const target = version ? `${name}@${version}` : name
    return [
      {
        title: 'gh skill install（支援 40+ agents）',
        command: `gh skill install ${ORG}/${repo} ${target} ${scopeFlag}\n# 省略 --agent 時以互動模式選擇目標 agent`,
        language: 'shell',
      },
      {
        title: 'curl 下載',
        command: `curl -fsSL ${rawUrl} -o ~/Downloads/${name}.md`,
        language: 'shell',
      },
      {
        title: 'wget 下載',
        command: `wget -q ${rawUrl} -O ~/Downloads/${name}.md`,
        language: 'shell',
      },
    ]
  }

  if (type === 'plugin') {
    const ref = version ? `${name}@${version}` : 'main'
    const sparseDir = version ? `${name}@${version}` : name
    return [
      {
        title: 'git sparse-checkout（推薦）',
        command: [
          `git clone --depth=1 --filter=blob:none --sparse \\`,
          `  ${repoUrl}.git ~/Downloads/${repo}`,
          `cd ~/Downloads/${repo} && git sparse-checkout set ${sparseDir}`,
        ].join('\n'),
        language: 'shell',
      },
      {
        title: '瀏覽器（手動下載）',
        command: `# 開啟後逐一下載所需檔案：\n# ${repoUrl}/tree/${ref}/${name}`,
        language: 'shell',
      },
    ]
  }

  const ext = type === 'mcp' ? 'json' : 'md'
  return [
    {
      title: version ? `curl 下載 v${version}` : 'curl 下載',
      command: `curl -fsSL ${rawUrl} -o ~/Downloads/${name}.${ext}`,
      language: 'shell',
    },
    {
      title: version ? `wget 下載 v${version}` : 'wget 下載',
      command: `wget -q ${rawUrl} -O ~/Downloads/${name}.${ext}`,
      language: 'shell',
    },
  ]
}
