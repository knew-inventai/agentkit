import { useState } from 'react'
import type { InstallScope, InstallTool, PackageType } from '../types'
import { getInstallCommands } from '../utils/installCommands'

const TOOLS: { id: InstallTool; label: string }[] = [
  { id: 'copilot', label: 'GitHub Copilot' },
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'codex', label: 'OpenAI Codex' },
  { id: 'download', label: '通用下載' },
]

interface Props {
  type: PackageType
  name: string
  version?: string
  token?: string
}

export default function InstallPanel({ type, name, version, token: _token }: Props) {
  const [tool, setTool] = useState<InstallTool>('copilot')
  const [scope, setScope] = useState<InstallScope>('global')
  const [copied, setCopied] = useState<string | null>(null)

  const commands = getInstallCommands(tool, scope, type, name, version)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
      <h3 className="mb-3 font-medium text-gray-800 dark:text-gray-200">安裝方式</h3>

      {/* 工具選擇 */}
      <div className="mb-3 flex gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`rounded px-3 py-1 text-sm ${
              tool === t.id
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 範圍選擇 */}
      {tool !== 'download' && (
        <div className="mb-4 flex gap-2">
          {(['global', 'project'] as InstallScope[]).map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`rounded px-2 py-0.5 text-xs ${
                scope === s
                  ? 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
              }`}
            >
              {s === 'global' ? '全域' : '專案'}
            </button>
          ))}
        </div>
      )}

      {/* 主工具指令 */}
      {commands.map((cmd, i) => (
        <div key={i} className="mb-3">
          <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{cmd.title}</p>
          <div className="relative">
            <pre className="overflow-x-auto rounded bg-gray-900 dark:bg-gray-950 p-3 text-xs text-gray-100">
              <code>{cmd.command}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(cmd.command, `${i}`)}
              className="absolute right-2 top-2 rounded bg-gray-700 dark:bg-gray-600 px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-500"
            >
              {copied === `${i}` ? '已複製 ✓' : '複製'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
