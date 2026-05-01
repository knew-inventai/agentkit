import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { usePackages } from '../hooks/usePackages'
import Layout from '../components/Layout'
import PackageCard from '../components/PackageCard'

export default function SearchPage() {
  const { auth } = useAuth()
  const { packages, stats, isLoading } = usePackages(auth.token ?? undefined)
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(q) ||
        pkg.description.toLowerCase().includes(q) ||
        pkg.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [packages, query])

  return (
    <Layout>
      <div className="mb-6">
        <input
          type="search"
          placeholder="搜尋工具名稱、描述、標籤..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>

      {isLoading && <p className="text-gray-400">載入中...</p>}
      {!isLoading && query && results.length === 0 && (
        <p className="text-gray-400">找不到符合「{query}」的工具</p>
      )}
      {results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} stats={stats[pkg.id]} />
          ))}
        </div>
      )}
    </Layout>
  )
}
