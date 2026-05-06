import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePackages } from '../hooks/usePackages'
import Layout from '../components/Layout'
import PackageCard from '../components/PackageCard'
import type { PackageType } from '../types'

const TYPES: { id: PackageType | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'skill', label: 'Skill' },
  { id: 'agent', label: 'Agent' },
  { id: 'mcp', label: 'MCP' },
  { id: 'plugin', label: 'Plugin' },
]

export default function BrowsePage() {
  const { auth } = useAuth()
  const {
    packages, stats, total, isLoading, error,
    hasMore, loadMore,
    type, setType,
    sort, setSort,
    query, setQuery,
  } = usePackages(auth.token ?? undefined)

  // Debounced search: local input state, push to hook after 300ms idle
  const [searchInput, setSearchInput] = useState(query)
  useEffect(() => {
    const t = setTimeout(() => setQuery(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout>
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="搜尋工具名稱、描述、標籤..."
          autoFocus
          className="w-full rounded-lg border px-4 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Filters + sort */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`rounded px-3 py-1 text-sm ${
                type === t.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="ml-auto rounded border px-2 py-1 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          <option value="views">依瀏覽數排序</option>
          <option value="likes">依 🔖 排序</option>
          <option value="updated">依更新時間排序</option>
        </select>
      </div>

      {/* Error state */}
      {error && (
        <p className="mb-4 rounded bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm text-red-600 dark:text-red-300">
          載入失敗：{error}
        </p>
      )}

      {/* Package grid */}
      {isLoading && packages.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">載入中...</p>
      ) : packages.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500">找不到符合的工具</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} stats={stats[pkg.id]} />
            ))}
          </div>

          {/* Load More */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              顯示 {packages.length} / 共 {total} 個工具
            </p>
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="rounded-lg border px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                {isLoading ? '載入中...' : '載入更多'}
              </button>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}
