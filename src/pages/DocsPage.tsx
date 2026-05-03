import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import MarkdownRenderer from '../components/MarkdownRenderer'

const DOCS_PAGES = [
  { id: 'getting-started', label: '快速開始',  file: 'docs/getting-started.md' },
  { id: 'types/skill',     label: 'Skill',      file: 'docs/types/skill.md' },
  { id: 'types/agent',     label: 'Agent',      file: 'docs/types/agent.md' },
  { id: 'types/mcp',       label: 'MCP Server', file: 'docs/types/mcp.md' },
  { id: 'types/plugin',    label: 'Plugin',     file: 'docs/types/plugin.md' },
  { id: 'publishing',      label: '發布套件',    file: 'docs/publishing.md' },
  { id: 'install',         label: '安裝套件',    file: 'docs/install.md' },
  { id: 'contributing',    label: '貢獻指南',    file: 'docs/contributing.md' },
  { id: 'glossary',        label: '名詞解釋',    file: 'docs/glossary.md' },
  { id: 'references',      label: '參考文獻',    file: 'docs/references.md' },
]

export default function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageId = searchParams.get('page') ?? 'getting-started'
  const page = DOCS_PAGES.find(p => p.id === pageId) ?? DOCS_PAGES[0]

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    fetch(`${import.meta.env.BASE_URL}${page.file}`)
      .then(r => {
        if (!r.ok) throw new Error('not found')
        return r.text()
      })
      .then(text => { setContent(text); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [page.file])

  return (
    <Layout>
      <div className="mx-auto max-w-6xl">
        <div className="flex gap-8">
          {/* Sidebar — desktop */}
          <nav className="hidden w-48 shrink-0 md:block">
            <ul className="space-y-1">
              {DOCS_PAGES.map(p => (
                <li key={p.id}>
                  <button
                    onClick={() => setSearchParams({ page: p.id })}
                    className={`w-full rounded px-3 py-2 text-left text-sm transition-colors ${
                      p.id === pageId
                        ? 'bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                  >
                    {p.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Tabs — mobile */}
          <div className="mb-4 flex flex-wrap gap-2 md:hidden w-full">
            {DOCS_PAGES.map(p => (
              <button
                key={p.id}
                onClick={() => setSearchParams({ page: p.id })}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  p.id === pageId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <main className="min-w-0 flex-1">
            {loading && (
              <p className="text-gray-500 dark:text-gray-400">載入中...</p>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                找不到文件：{page.file}
              </div>
            )}
            {!loading && !error && <MarkdownRenderer content={content} />}
          </main>
        </div>
      </div>
    </Layout>
  )
}
