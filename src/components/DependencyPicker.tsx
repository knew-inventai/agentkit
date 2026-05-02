import { useState, useEffect, useRef } from 'react'
import { fetchPackages } from '../services/api'
import type { PackageListItem } from '../services/api'
import { parseDependency } from '../types'

interface Props {
  value: string[]                        // ["skill/code-reviewer@1.0.0", ...]
  onChange: (deps: string[]) => void
  token?: string
}

export default function DependencyPicker({ value, onChange, token }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PackageListItem[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchPackages({ q: query, limit: 10, token })
        setResults(res.packages)
        setOpen(true)
      } catch {
        setResults([])
      }
    }, 300)
  }, [query, token])

  const select = (pkg: PackageListItem) => {
    const dep = `${pkg.type}/${pkg.name}@${pkg.version}`
    if (!value.includes(dep)) onChange([...value, dep])
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const remove = (dep: string) => onChange(value.filter((d) => d !== dep))

  const TYPE_COLORS: Record<string, string> = {
    skill: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    prompt: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    mcp: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    plugin: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        依賴工具
        <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">（僅 Plugin 可設定）</span>
      </label>

      {/* Selected tags */}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {value.map((dep) => {
            const parsed = parseDependency(dep)
            return (
              <span
                key={dep}
                className="flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300"
              >
                {parsed ? (
                  <>
                    <span className={`rounded px-1 text-[10px] font-medium ${TYPE_COLORS[parsed.type] ?? ''}`}>
                      {parsed.type}
                    </span>
                    {parsed.name}@{parsed.version}
                  </>
                ) : dep}
                <button
                  type="button"
                  onClick={() => remove(dep)}
                  className="ml-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋工具名稱..."
          className="w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />

        {/* Dropdown */}
        {open && results.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            {results.map((pkg) => {
              const dep = `${pkg.type}/${pkg.name}@${pkg.version}`
              const alreadyAdded = value.includes(dep)
              return (
                <li key={pkg.id}>
                  <button
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => select(pkg)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 ${
                      alreadyAdded ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TYPE_COLORS[pkg.type] ?? ''}`}>
                      {pkg.type}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{pkg.name}</span>
                    <span className="text-gray-400 dark:text-gray-500">v{pkg.version}</span>
                    {alreadyAdded && <span className="ml-auto text-gray-400 text-xs">已加入</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
