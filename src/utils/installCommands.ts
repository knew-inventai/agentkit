import type { InstallScope, InstallTool, PackageType } from '../types'
import { getRawFileUrl, getRawFileUrlAtTag } from '../services/github'

const ORG = import.meta.env.VITE_GITHUB_ORG

function getInstallPath(tool: InstallTool, scope: InstallScope, name: string, type: PackageType): string {
  if (tool === 'claude-code') {
    return scope === 'global'
      ? `~/.claude/skills/${name}/SKILL.md`
      : `.claude/skills/${name}/SKILL.md`
  }
  if (tool === 'cursor') {
    return scope === 'global'
      ? `~/.cursor/rules/${name}.mdc`
      : `.cursor/rules/${name}.mdc`
  }
  const ext = type === 'mcp' ? 'json' : 'md'
  return `~/Downloads/${name}.${ext}`
}

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
  const rawUrl = version
    ? getRawFileUrlAtTag(type, name, version)
    : getRawFileUrl(type, name)

  if (tool === 'claude-code') {
    const marketplaceRepo = `${ORG}/agentkit-${type}s`
    const commands: InstallCommand[] = []
    if (!version) {
      commands.push({
        title: '方式一：Claude Code Marketplace（推薦）',
        command: `/plugin marketplace add ${marketplaceRepo}\n/plugin install ${name}@agentkit-${type}s`,
        language: 'shell',
      })
    }
    commands.push({
      title: version ? `curl 安裝 v${version}` : '方式二：curl 手動安裝',
      command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${getInstallPath('claude-code', scope, name, type)}`,
      language: 'shell',
    })
    return commands
  }

  if (tool === 'cursor') {
    return [
      {
        title: version ? `curl 安裝 v${version}` : 'curl 安裝',
        command: `curl -fsSL ${rawUrl} \\\n  --create-dirs -o ${getInstallPath('cursor', scope, name, type)}`,
        language: 'shell',
      },
    ]
  }

  const commands: InstallCommand[] = [
    {
      title: version ? `下載 v${version} 到本機` : '下載到本機',
      command: `curl -fsSL ${rawUrl} -o ~/Downloads/${name}.md`,
      language: 'shell',
    },
  ]

  if (type === 'prompt') {
    commands.push({
      title: '複製到剪貼板（macOS）',
      command: `curl -fsSL ${rawUrl} | pbcopy`,
      language: 'shell',
    })
    commands.push({
      title: '複製到剪貼板（Linux）',
      command: `curl -fsSL ${rawUrl} | xclip -selection clipboard`,
      language: 'shell',
    })
  }

  return commands
}
