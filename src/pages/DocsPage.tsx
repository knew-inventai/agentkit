import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import MarkdownRenderer from '../components/MarkdownRenderer'

const DOCS_URL = `https://raw.githubusercontent.com/${import.meta.env.VITE_GITHUB_ORG}/agentkit/main/docs/MANUAL.md`

export default function DocsPage() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch(DOCS_URL)
      .then((r) => r.text())
      .then((text) => setContent(text))
      .catch(() => setContent('# 使用手冊\n\n暫無內容，請稍後再試。'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Layout>
      {isLoading ? (
        <p className="text-gray-400">載入中...</p>
      ) : (
        <MarkdownRenderer content={content} />
      )}
    </Layout>
  )
}
