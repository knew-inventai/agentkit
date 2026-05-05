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
    // mcp: manual config
    if (type === 'mcp') {
      return [
        {
          title: 'MCP 設定（手動）',
          command: `# 下載設定檔後，加入 VS Code Copilot MCP 設定\ncurl -fsSL ${rawUrl} -o ~/Downloads/${name}.json`,
          language: 'shell',
        },
      ]
    }
    // agent / plugin: not natively supported
    return [
      {
        title: '不支援直接安裝',
        command: `# ${type} 類型目前不支援 GitHub Copilot 直接安裝\n# 請改用 Claude Code`,
        language: 'shell',
      },
    ]
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
    if (type === 'mcp') {
      return [
        {
          title: 'MCP 設定（手動）',
          command: `# 下載設定檔後，加入 ~/.codex/config.toml 的 [[mcp_servers]] 區塊\ncurl -fsSL ${rawUrl} -o ~/Downloads/${name}.json`,
          language: 'shell',
        },
      ]
    }
    return [
      {
        title: '不支援直接安裝',
        command: `# ${type} 類型目前不支援 OpenAI Codex 直接安裝\n# 請改用 Claude Code`,
        language: 'shell',
      },
    ]
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

