import { useParams } from 'react-router-dom'
import { usePackageDetail } from '../hooks/usePackageDetail'
import { useAuth } from '../hooks/useAuth'
import { toggleLike, recordDownload } from '../services/api'
import { getRawFileUrl } from '../services/github'
import Layout from '../components/Layout'
import MarkdownRenderer from '../components/MarkdownRenderer'
import InstallPanel from '../components/InstallPanel'
import type { PackageType } from '../types'

export default function DetailPage() {
  const { type, name } = useParams<{ type: string; name: string }>()
  const { auth } = useAuth()
  const { manifest, readme, releases, stats, setStats, isLoading, error } =
    usePackageDetail(type as PackageType, name!, auth.token ?? undefined)

  const handleLike = async () => {
    if (!auth.token || !type || !name) return
    try {
      const liked = await toggleLike(auth.token, type, name)
      setStats((prev) => ({
        ...prev,
        likes: liked ? prev.likes + 1 : prev.likes - 1,
        liked_by_me: liked,
      }))
    } catch { /* ignore */ }
  }

  const handleDownload = async () => {
    if (!auth.token || !type || !name) return
    await recordDownload(auth.token, type, name)
    setStats((prev) => ({ ...prev, downloads: prev.downloads + 1 }))
    window.open(getRawFileUrl(type as PackageType, name), '_blank')
  }

  if (isLoading) return <Layout><p className="text-gray-400 dark:text-gray-500">載入中...</p></Layout>
  if (error || !manifest) return <Layout><p className="text-red-500">載入失敗：{error}</p></Layout>

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{name}</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{manifest.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {manifest._agentkit?.tags.map((tag) => (
                <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <MarkdownRenderer content={readme} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={handleLike}
              disabled={!auth.token}
              className={`flex items-center gap-1 rounded px-3 py-1.5 text-sm ${
                stats.liked_by_me
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              } disabled:cursor-not-allowed`}
            >
              👍 {stats.likes}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">⬇ {stats.downloads} 次下載</span>
          </div>

          <InstallPanel type={type as PackageType} name={name!} />

          <button
            onClick={handleDownload}
            className="w-full rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700"
          >
            下載主體檔案
          </button>

          <a
            href={`https://github.com/${import.meta.env.VITE_GITHUB_ORG}/agentkit-${type}s/tree/main/${name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            在 GitHub 檢視 →
          </a>

          {releases.length > 0 && (
            <div className="rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">版本歷史</h3>
              <ul className="space-y-1">
                {releases.map((r) => (
                  <li key={r.version} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-gray-700 dark:text-gray-300">{r.version}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(r.publishedAt).toLocaleDateString('zh-TW')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-lg border bg-white p-4 text-sm space-y-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>版本</span><span>{manifest.version}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>作者</span><span>{manifest.author.name}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>授權</span><span>{manifest.license}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
