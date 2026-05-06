import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePackages } from '../hooks/usePackages'
import Layout from '../components/Layout'
import PackageCard from '../components/PackageCard'

export default function HomePage() {
  const { auth } = useAuth()
  const { packages, stats, isLoading } = usePackages(auth.token ?? undefined)

  const sorted = [...packages].sort(
    (a, b) => (stats[b.id]?.views ?? 0) - (stats[a.id]?.views ?? 0),
  )

  return (
    <Layout>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AgentKit</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Inventai AI 工具資源平台</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link to="/browse" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
            瀏覽所有工具
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">熱門工具</h2>
        {isLoading ? (
          <p className="text-gray-400 dark:text-gray-500">載入中...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.slice(0, 6).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} stats={stats[pkg.id]} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
