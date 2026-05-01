import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createGitHubClient } from '../services/github'
import Layout from '../components/Layout'
import type { PackageType } from '../types'

const TYPES: PackageType[] = ['skill', 'prompt', 'mcp', 'plugin']
const FILE_NAMES: Record<PackageType, string> = {
  skill: 'SKILL.md',
  prompt: 'PROMPT.md',
  mcp: 'mcp-config.json',
  plugin: 'plugin.json',
}
const REPOS: Record<PackageType, string> = {
  skill: import.meta.env.VITE_REPO_SKILLS,
  prompt: import.meta.env.VITE_REPO_PROMPTS,
  mcp: import.meta.env.VITE_REPO_MCP,
  plugin: import.meta.env.VITE_REPO_PLUGINS,
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300'
const inputClass = 'mt-1 w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'

export default function PublishPage() {
  const { auth, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    type: 'skill' as PackageType,
    name: '',
    version: '1.0.0',
    description: '',
    tags: '',
    compatible: 'claude',
    content: '',
    readme: '',
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  if (!auth.token) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="mb-4 text-gray-500 dark:text-gray-400">發布工具需要先登入</p>
          <button onClick={login} className="rounded-md bg-gray-900 px-4 py-2 text-sm text-white dark:bg-gray-700">
            GitHub 登入
          </button>
        </div>
      </Layout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const octokit = createGitHubClient(auth.token!)
      const org = import.meta.env.VITE_GITHUB_ORG
      const repo = REPOS[form.type]
      const branch = `add/${form.name}-${Date.now()}`
      const mainFileName = FILE_NAMES[form.type]

      const { data: ref } = await octokit.git.getRef({ owner: org, repo, ref: 'heads/main' })
      const baseSha = ref.object.sha

      await octokit.git.createRef({
        owner: org, repo,
        ref: `refs/heads/${branch}`,
        sha: baseSha,
      })

      const manifest = {
        name: form.name,
        version: form.version,
        description: form.description,
        author: { name: auth.username! },
        license: 'MIT',
        _agentkit: {
          type: form.type,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          compatible: form.compatible.split(',').map((c) => c.trim()).filter(Boolean),
        },
      }

      const files = [
        { path: `${form.name}/plugin.json`, content: JSON.stringify(manifest, null, 2) },
        { path: `${form.name}/${mainFileName}`, content: form.content },
        ...(form.readme ? [{ path: `${form.name}/README.md`, content: form.readme }] : []),
      ]

      for (const file of files) {
        await octokit.repos.createOrUpdateFileContents({
          owner: org, repo,
          path: file.path,
          message: `feat: add ${form.name} v${form.version}`,
          content: btoa(unescape(encodeURIComponent(file.content))),
          branch,
        })
      }

      await octokit.pulls.create({
        owner: org, repo,
        title: `feat: add ${form.name} v${form.version}`,
        head: branch,
        base: 'main',
        body: `## ${form.name}\n\n${form.description}\n\n**類型：** ${form.type}\n**版本：** ${form.version}\n**標籤：** ${form.tags}`,
      })

      setStatus('success')
      setTimeout(() => navigate(`/${form.type}/${form.name}`), 2000)
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : '發布失敗')
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">發布工具</h1>
        {status === 'success' && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            PR 已建立，等待 maintainer review 後正式上線。即將跳轉...
          </div>
        )}
        {status === 'error' && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-300">{errorMsg}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>類型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PackageType })}
                className={inputClass}
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>名稱（kebab-case）</label>
              <input
                required
                pattern="[a-z0-9-]+"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="my-awesome-skill"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>描述（100 字以內）</label>
            <input
              required
              maxLength={100}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>版本</label>
              <input
                required
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>標籤（逗號分隔）</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className={inputClass}
                placeholder="review, typescript"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>
              主體內容（{FILE_NAMES[form.type]}）
            </label>
            <textarea
              required
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${inputClass} font-mono`}
              placeholder={`在此貼上 ${FILE_NAMES[form.type]} 內容...`}
            />
          </div>
          <div>
            <label className={labelClass}>README.md（選填）</label>
            <textarea
              rows={6}
              value={form.readme}
              onChange={(e) => setForm({ ...form, readme: e.target.value })}
              className={`${inputClass} font-mono`}
              placeholder="說明文件（Markdown 格式）..."
            />
          </div>
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-md bg-blue-600 py-2.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {status === 'submitting' ? '建立 PR 中...' : '發布（建立 Pull Request）'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
