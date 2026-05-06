import type { InstallScope, InstallTool, PackageType } from '../types'
import { getRawFileUrl, getRawFileUrlAtTag } from '../services/github'

const ORG = import.meta.env.VITE_GITHUB_ORG

export interface InstallCommand {
  title: string
  command: string
  language: 'shell'
}

/**
 * Shared: curl > git sparse-checkout > browser
 * Used for skill (SKILL.md), agent (AGENT.md), mcp (mcp-config.json)
 */
function singleFileInstallCommands(
  rawUrl: string,
  repoUrl: string,
  repo: string,
  name: string,
  destPath: string,   // full local destination path
  srcFile: string,    // filename inside the repo dir (e.g. SKILL.md)
  version?: string,
): InstallCommand[] {
  const cloneCmd = version
    ? `git clone --depth=1 --branch ${name}@${version} --filter=blob:none --sparse \\\n  ${repoUrl}.git /tmp/${repo}`
    : `git clone --depth=1 --filter=blob:none --sparse \\\n  ${repoUrl}.git /tmp/${repo}`
  const browseUrl = version
    ? `${repoUrl}/blob/${name}%40${version}/${name}/${srcFile}`
    : `${repoUrl}/blob/main/${name}/${srcFile}`
  return [
    {
      title: version ? `curl 安裝 v${version}` : '方式一：curl 安裝',
      command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${destPath}`,
      language: 'shell',
    },
    {
      title: version ? `git sparse-checkout v${version}` : '方式二：git sparse-checkout',
      command: [
        cloneCmd,
        `cd /tmp/${repo} && git sparse-checkout set ${name}`,
        `mkdir -p $(dirname ${destPath})`,
        `cp /tmp/${repo}/${name}/${srcFile} ${destPath}`,
      ].join('\n'),
      language: 'shell',
    },
    {
      title: '方式三：瀏覽器',
      command: `# 開啟後手動另存新檔至：\n# ${destPath}\n# ${browseUrl}`,
      language: 'shell',
    },
  ]
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
      const destPath = scope === 'global'
        ? `~/.copilot/skills/${name}/SKILL.md`
        : `.github/skills/${name}/SKILL.md`
      return singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'SKILL.md', version)
    }
    if (type === 'agent') {
      const destPath = scope === 'global'
        ? `~/.copilot/agents/${name}.md`
        : `.github/agents/${name}.md`
      return singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'AGENT.md', version)
    }
    if (type === 'mcp') {
      const destPath = `~/Downloads/${name}.json`
      return [
        ...singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'mcp-config.json', version),
        {
          title: '設定整合',
          command: `# 下載後，將 ${name}.json 的內容\n# 加入 VS Code Copilot 的 MCP 設定`,
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
    return []
  }

  // ─── Claude Code ──────────────────────────────────────

  if (tool === 'claude-code') {
    if (type === 'skill') {
      const destPath = scope === 'global'
        ? `~/.claude/skills/${name}/SKILL.md`
        : `.claude/skills/${name}/SKILL.md`
      return singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'SKILL.md', version)
    }
    if (type === 'agent') {
      const destPath = scope === 'global'
        ? `~/.claude/agents/${name}.md`
        : `.claude/agents/${name}.md`
      return singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'AGENT.md', version)
    }
    if (type === 'mcp') {
      const configDir = scope === 'global' ? `~/.claude/mcp-configs` : `.claude/mcp-configs`
      const destPath = `${configDir}/${name}.json`
      return [
        ...singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'mcp-config.json', version),
        {
          title: '設定整合',
          command: `# 將 ${destPath} 的內容\n# 合併至 ~/.claude/settings.json 的 "mcpServers" 欄位`,
          language: 'shell',
        },
      ]
    }
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
    return []
  }

  // ─── OpenAI Codex ─────────────────────────────────────

  if (tool === 'codex') {
    if (type === 'skill') {
      const destPath = scope === 'global'
        ? `~/.agents/skills/${name}/SKILL.md`
        : `.agents/skills/${name}/SKILL.md`
      return singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'SKILL.md', version)
    }
    if (type === 'agent') {
      // Codex subagents use TOML format — incompatible with AgentKit AGENT.md
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
    if (type === 'mcp') {
      const destPath = `~/Downloads/${name}.json`
      return [
        ...singleFileInstallCommands(rawUrl, repoUrl, repo, name, destPath, 'mcp-config.json', version),
        {
          title: '設定整合',
          command: `# 下載後，將 ${name}.json 的內容\n# 加入 ~/.codex/config.toml 的 [[mcp_servers]] 區塊`,
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

  if (type === 'agent') {
    return singleFileInstallCommands(
      rawUrl, repoUrl, repo, name,
      `~/Downloads/${name}.md`, 'AGENT.md', version,
    )
  }

  if (type === 'mcp') {
    return singleFileInstallCommands(
      rawUrl, repoUrl, repo, name,
      `~/Downloads/${name}.json`, 'mcp-config.json', version,
    )
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

  return []
}
