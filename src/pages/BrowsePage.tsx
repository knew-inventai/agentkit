import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePackages } from '../hooks/usePackages'
import Layout from '../components/Layout'
import PackageCard from '../components/PackageCard'
import type { PackageType } from '../types'

type SortKey = 'likes' | 'downloads' | 'updated'
const TYPES: { id: PackageType | 'all'; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'skill', label: 'Skill' },
  { id: 'prompt', label: 'Prompt' },
  { id: 'mcp', label: 'MCP' },
  { id: 'plugin', label: 'Plugin' },
]

export default function BrowsePage() {
  const { auth } = useAuth()
  const [typeFilter, setTypeFilter] = useState<PackageType | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('likes')
  const { packages, stats, isLoading } = usePackages(
    auth.token ?? undefined,
    typeFilter === 'all' ? undefined : typeFilter,
  )

  const sorted = [...packages].sort((a, b) => {
    if (sortKey === 'likes') return (stats[b.id]?.likes ?? 0) - (stats[a.id]?.likes ?? 0)
    if (sortKey === 'downloads') return (stats[b.id]?.downloads ?? 0) - (stats[a.id]?.downloads ?? 0)
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

  return (
    <Layout>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`rounded px-3 py-1 text-sm ${
                typeFilter === t.id ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="ml-auto rounded border px-2 py-1 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          <option value="likes">依 👍 排序</option>
          <option value="downloads">依下載數排序</option>
          <option value="updated">依更新時間排序</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-400 dark:text-gray-500">載入中...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} stats={stats[pkg.id]} />
          ))}
        </div>
      )}
    </Layout>
  )
}
