import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePackageDetail } from '../hooks/usePackageDetail'
import { useAuth } from '../hooks/useAuth'
import { toggleLike, recordDownload } from '../services/api'
import { getRawFileUrl } from '../services/github'
import Layout from '../components/Layout'
import UpdatePackageModal from '../components/UpdatePackageModal'
import MarkdownRenderer from '../components/MarkdownRenderer'
import InstallPanel from '../components/InstallPanel'
import type { PackageType } from '../types'

export default function DetailPage() {
  const { type, name } = useParams<{ type: string; name: string }>()
  const { auth } = useAuth()
  const {
    manifest,
    readme,
    releases,
    selectedVersion,
    setSelectedVersion,
    stats,
    setStats,
    isLoading,
    error,
  } = usePackageDetail(type as PackageType, name!, auth.token ?? undefined)

  const [updatePrUrl, setUpdatePrUrl] = useState<string | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [bodyContent, setBodyContent] = useState<string | null>(null)

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

  const handleOpenUpdate = async () => {
    if (!bodyContent) {
      const url = getRawFileUrl(type as PackageType, name!)
      const text = await fetch(url).then((r) => r.text())
      setBodyContent(text)
    }
    setShowUpdateModal(true)
  }

  if (isLoading) return <Layout><p className="text-gray-400 dark:text-gray-500">載入中...</p></Layout>
  if (error || !manifest) return <Layout><p className="text-red-500">載入失敗：{error}</p></Layout>

  const isAuthor =
    auth.username != null &&
    (auth.username === manifest.author.name || auth.username === manifest.author.github)

  const githubHandle = manifest.author.github ?? manifest.author.name

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {name}
              {selectedVersion && (
                <span className="ml-2 rounded bg-yellow-100 dark:bg-yellow-900/40 px-2 py-0.5 text-xs text-yellow-700 dark:text-yellow-300 align-middle">
                  v{selectedVersion}（歷史版本）
                </span>
              )}
            </h1>
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

          <InstallPanel
            type={type as PackageType}
            name={name!}
            version={selectedVersion ?? undefined}
          />

          <button
            onClick={handleDownload}
            className="w-full rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700"
          >
            下載主體檔案
          </button>

          {isAuthor && (
            <button
              onClick={handleOpenUpdate}
              className="w-full rounded-md border border-blue-600 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              更新此工具
            </button>
          )}

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
                {releases.map((r) => {
                  const isSelected = selectedVersion === r.version
                  const isLatest = selectedVersion === null && r === releases[0]
                  const active = isSelected || isLatest
                  return (
                    <li key={r.version}>
                      <button
                        onClick={() =>
                          setSelectedVersion(isSelected || isLatest ? null : r.version)
                        }
                        className={`w-full flex items-center justify-between rounded px-2 py-1 text-sm transition-colors ${
                          active
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="font-mono">{r.version}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(r.publishedAt).toLocaleDateString('zh-TW')}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {selectedVersion && (
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="mt-2 w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ← 切回最新版本
                </button>
              )}
            </div>
          )}

          <div className="rounded-lg border bg-white p-4 text-sm space-y-2 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>版本</span><span>{manifest.version}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
              <span>作者</span>
              <a
                href={`https://github.com/${githubHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-blue-500 dark:hover:text-blue-400"
              >
                <img
                  src={`https://github.com/${githubHandle}.png?size=20`}
                  alt={githubHandle}
                  className="h-5 w-5 rounded-full"
                />
                <span>{manifest.author.name}</span>
              </a>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>授權</span><span>{manifest.license}</span>
            </div>
          </div>

          {updatePrUrl && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-300">
              PR 已建立！{' '}
              <a href={updatePrUrl} target="_blank" rel="noopener noreferrer" className="underline">
                在 GitHub 查看 →
              </a>
            </div>
          )}
        </div>
      </div>
      {showUpdateModal && manifest && bodyContent !== null && (
        <UpdatePackageModal
          type={type as PackageType}
          name={name!}
          manifest={manifest}
          currentContent={bodyContent}
          currentReadme={readme}
          token={auth.token!}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={(url) => {
            setUpdatePrUrl(url)
            setShowUpdateModal(false)
          }}
        />
      )}
    </Layout>
  )
}
