import { useState, useEffect } from 'react'
import type { InstallScope, InstallTool, PackageType } from '../types'
import { parseDependency } from '../types'
import { getInstallCommands } from '../utils/installCommands'
import { fetchPackageById } from '../services/api'
import type { PackageListItem } from '../services/api'

const TOOLS: { id: InstallTool; label: string }[] = [
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'download', label: '通用下載' },
]

interface Props {
  type: PackageType
  name: string
  version?: string
  dependencies?: string[]   // ["skill/code-reviewer@1.0.0", ...] — plugin only
  token?: string
}

export default function InstallPanel({ type, name, version, dependencies = [], token }: Props) {
  const [tool, setTool] = useState<InstallTool>('claude-code')
  const [scope, setScope] = useState<InstallScope>('global')
  const [copied, setCopied] = useState<string | null>(null)
  const [depPkgs, setDepPkgs] = useState<PackageListItem[]>([])
  const [depsLoading, setDepsLoading] = useState(false)

  const commands = getInstallCommands(tool, scope, type, name, version)

  useEffect(() => {
    if (dependencies.length === 0) return
    setDepsLoading(true)
    const parsed = dependencies.map(parseDependency).filter(Boolean) as NonNullable<ReturnType<typeof parseDependency>>[]
    Promise.allSettled(parsed.map((d) => fetchPackageById(d.type, d.name, token)))
      .then((results) => {
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<PackageListItem> => r.status === 'fulfilled')
          .map((r) => r.value)
        setDepPkgs(loaded)
      })
      .finally(() => setDepsLoading(false))
  }, [dependencies, token]) // eslint-disable-line react-hooks/exhaustive-deps

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

      {/* 依賴工具安裝指令 */}
      {dependencies.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            步驟 1 — 先安裝依賴工具
          </p>
          {depsLoading ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">載入依賴資訊...</p>
          ) : (
            depPkgs.map((dep) => {
              const depCmds = getInstallCommands(tool, scope, dep.type as PackageType, dep.name, dep.version)
              return (
                <div key={dep.id} className="mb-3">
                  <p className="mb-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
                    {dep.type}/{dep.name}
                  </p>
                  {depCmds.map((cmd, i) => (
                    <div key={i} className="mb-2">
                      <p className="mb-0.5 text-xs text-gray-400 dark:text-gray-500">{cmd.title}</p>
                      <div className="relative">
                        <pre className="overflow-x-auto rounded bg-gray-900 dark:bg-gray-950 p-3 text-xs text-gray-100">
                          <code>{cmd.command}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(cmd.command, `dep-${dep.id}-${i}`)}
                          className="absolute right-2 top-2 rounded bg-gray-700 dark:bg-gray-600 px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-600 dark:hover:bg-gray-500"
                        >
                          {copied === `dep-${dep.id}-${i}` ? '已複製 ✓' : '複製'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })
          )}
          <p className="mb-2 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            步驟 2 — 再安裝此工具
          </p>
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
