import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchLikedPackages } from '../services/api'
import type { PackageListItem } from '../services/api'
import Layout from '../components/Layout'
import PackageCard from '../components/PackageCard'
import type { PackageStats, PackageType } from '../types'

export default function LikedPage() {
  const { auth } = useAuth()
  const [packages, setPackages] = useState<PackageListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth.token) return
    setIsLoading(true)
    fetchLikedPackages(auth.token)
      .then(setPackages)
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [auth.token])

  if (!auth.token) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 mb-4">請先登入以查看你的收藏</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🔖 我的收藏</h1>

      {isLoading && <p className="text-gray-400 dark:text-gray-500">載入中...</p>}

      {error && (
        <p className="rounded bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm text-red-600 dark:text-red-300">
          載入失敗：{error}
        </p>
      )}

      {!isLoading && !error && packages.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-gray-500 mb-4">還沒有收藏任何工具</p>
          <Link
            to="/browse"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            去逛逛 →
          </Link>
        </div>
      )}

      {!isLoading && packages.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const stats: PackageStats = {
              views: pkg.views,
              likes: pkg.likes,
              liked_by_me: pkg.liked_by_me,
            }
            return (
              <PackageCard
                key={pkg.id}
                pkg={{
                  id: pkg.id,
                  name: pkg.name,
                  type: pkg.type as PackageType,
                  version: pkg.version,
                  description: pkg.description,
                  author: pkg.author,
                  tags: pkg.tags,
                  compatible: pkg.compatible,
                  license: pkg.license,
                  updatedAt: pkg.updatedAt,
                  repoPath: pkg.repoPath,
                }}
                stats={stats}
              />
            )
          })}
        </div>
      )}
    </Layout>
  )
}
