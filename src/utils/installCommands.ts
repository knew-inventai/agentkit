import type { InstallScope, InstallTool, PackageType } from '../types'
import { getRawFileUrl, getRawFileUrlAtTag } from '../services/github'

const ORG = import.meta.env.VITE_GITHUB_ORG

export interface InstallCommand {
  title: string
  command: string
  language: 'shell'
}

// ── Shared low-level helper ───────────────────────────────

function singleFileInstallCommands(
  rawUrl: string,
  repoUrl: string,
  name: string,
  destPath: string,
  srcFile: string,
  version?: string,
): InstallCommand[] {
  const cloneCmd = version
    ? `git clone --depth=1 --branch ${name}@${version} --filter=blob:none --sparse \\\n  ${repoUrl}.git $_tmp`
    : `git clone --depth=1 --filter=blob:none --sparse \\\n  ${repoUrl}.git $_tmp`
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
        `_tmp=$(mktemp -d)`,
        cloneCmd,
        `git -C $_tmp sparse-checkout set ${name}`,
        `mkdir -p $(dirname ${destPath})`,
        `cp $_tmp/${name}/${srcFile} ${destPath}`,
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

// ── Tool-specific config tables ───────────────────────────

const SKILL_DEST: Record<string, (scope: InstallScope, name: string) => string> = {
  copilot:       (scope, name) => scope === 'global' ? `~/.copilot/skills/${name}/SKILL.md` : `.github/skills/${name}/SKILL.md`,
  'claude-code': (scope, name) => scope === 'global' ? `~/.claude/skills/${name}/SKILL.md`  : `.claude/skills/${name}/SKILL.md`,
  codex:         (scope, name) => scope === 'global' ? `~/.agents/skills/${name}/SKILL.md`  : `.agents/skills/${name}/SKILL.md`,
}

const AGENT_DEST: Record<string, (scope: InstallScope, name: string) => string> = {
  copilot:       (scope, name) => scope === 'global' ? `~/.copilot/agents/${name}.md` : `.github/agents/${name}.md`,
  'claude-code': (scope, name) => scope === 'global' ? `~/.claude/agents/${name}.md`  : `.claude/agents/${name}.md`,
}

const MCP_HINT: Record<string, (rawUrl: string) => string> = {
  copilot: (rawUrl) => [
    `# 設定檔內容：`,
    `#   ${rawUrl}`,
    `#`,
    `# Copilot CLI：將 mcpServers 內容加入`,
    `#   ~/.copilot/mcp-config.json`,
    `#`,
    `# VS Code：Settings → Copilot → MCP Servers`,
  ].join('\n'),
  'claude-code': (rawUrl) => [
    `# 1. 開啟設定檔內容：`,
    `#    ${rawUrl}`,
    `# 2. 將 mcpServers 內容加入`,
    `#    ~/.claude/settings.json 的 "mcpServers" 欄位`,
  ].join('\n'),
  codex: (rawUrl) => [
    `# 1. 開啟設定檔內容：`,
    `#    ${rawUrl}`,
    `# 2. 將 mcpServers 內容加入`,
    `#    ~/.codex/config.toml 的 [[mcp_servers]] 區塊`,
  ].join('\n'),
  download: (rawUrl) => [
    `# 1. 開啟設定檔內容：`,
    `#    ${rawUrl}`,
    `# 2. 將 mcpServers 內容加入你的 MCP config`,
  ].join('\n'),
}

const PLUGIN_CLI: Record<string, string> = {
  copilot:       'copilot',
  'claude-code': 'claude',
  codex:         'codex',
}

// ── Per-type handlers ─────────────────────────────────────

function skillCommands(
  tool: InstallTool,
  scope: InstallScope,
  rawUrl: string,
  repoUrl: string,
  name: string,
  version: string | undefined,
  repo: string,
  scopeFlag: string,
): InstallCommand[] {
  if (tool === 'download') {
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
  const destPath = SKILL_DEST[tool](scope, name)
  return singleFileInstallCommands(rawUrl, repoUrl, name, destPath, 'SKILL.md', version)
}

function agentCommands(
  tool: InstallTool,
  scope: InstallScope,
  rawUrl: string,
  repoUrl: string,
  name: string,
  version: string | undefined,
): InstallCommand[] {
  if (tool === 'codex') {
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
  const destPath = tool === 'download'
    ? `~/Downloads/${name}.md`
    : AGENT_DEST[tool](scope, name)
  return singleFileInstallCommands(rawUrl, repoUrl, name, destPath, 'AGENT.md', version)
}

function mcpCommands(tool: InstallTool, rawUrl: string): InstallCommand[] {
  return [{ title: '設定', command: MCP_HINT[tool](rawUrl), language: 'shell' }]
}

function pluginCommands(
  tool: InstallTool,
  repoUrl: string,
  repo: string,
  name: string,
  version: string | undefined,
): InstallCommand[] {
  if (tool === 'download') {
    const sparseDir = version ? `${name}@${version}` : name
    return [
      {
        title: 'git sparse-checkout',
        command: [
          `_tmp=$(mktemp -d)`,
          `git clone --depth=1 --filter=blob:none --sparse \\`,
          `  ${repoUrl}.git $_tmp`,
          `git -C $_tmp sparse-checkout set ${sparseDir}`,
        ].join('\n'),
        language: 'shell',
      },
    ]
  }
  const cli = PLUGIN_CLI[tool]
  return [
    {
      title: 'plugin install',
      command: [
        `${cli} plugin marketplace add ${ORG}/${repo}`,
        `${cli} plugin install ${name}@agentkit-plugins`,
      ].join('\n'),
      language: 'shell',
    },
  ]
}

// ── Main dispatcher ───────────────────────────────────────

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

  switch (type) {
    case 'skill':  return skillCommands(tool, scope, rawUrl, repoUrl, name, version, repo, scopeFlag)
    case 'agent':  return agentCommands(tool, scope, rawUrl, repoUrl, name, version)
    case 'mcp':    return mcpCommands(tool, rawUrl)
    case 'plugin': return pluginCommands(tool, repoUrl, repo, name, version)
  }
}
