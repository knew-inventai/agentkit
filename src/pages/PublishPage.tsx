import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { createGitHubClient } from '../services/github'
import Layout from '../components/Layout'
import VersionInput from '../components/VersionInput'
import type { PackageType } from '../types'

const TYPES: PackageType[] = ['skill', 'agent', 'mcp', 'plugin']

// FILE_NAMES: plugin has no single body file, use Partial
const FILE_NAMES: Partial<Record<PackageType, string>> = {
  skill: 'SKILL.md',
  agent: 'AGENT.md',
  mcp: 'mcp-config.json',
}
const REPOS: Record<PackageType, string> = {
  skill: import.meta.env.VITE_REPO_SKILLS,
  agent: import.meta.env.VITE_REPO_AGENTS,
  mcp: import.meta.env.VITE_REPO_MCP,
  plugin: import.meta.env.VITE_REPO_PLUGINS,
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300'
const inputClass = 'mt-1 w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'

const KEBAB_RE = /^[a-z][a-z0-9-]+$/
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/

function validateForm(form: {
  type: PackageType; name: string; version: string; tags: string; content: string
}): string[] {
  const errors: string[] = []
  if (!KEBAB_RE.test(form.name))
    errors.push('名稱必須是 kebab-case（小寫字母開頭，僅含小寫字母、數字、連字號）')
  if (!SEMVER_RE.test(form.version))
    errors.push('版本必須符合 SemVer 格式，例：1.0.0')
  if (form.tags.split(',').map(t => t.trim()).filter(Boolean).length === 0)
    errors.push('至少需要填寫一個標籤')
  if (form.type !== 'plugin' && !form.content.trim())
    errors.push(`${FILE_NAMES[form.type]} 內容不能為空`)
  if (form.type === 'mcp') {
    try { JSON.parse(form.content) } catch { errors.push('mcp-config.json 必須是合法的 JSON') }
  }
  return errors
}

export default function PublishPage() {
  const { auth, login } = useAuth()
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
  const [prUrl, setPrUrl] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])

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
    setErrorMsg('')

    if (form.type === 'plugin') return  // plugin uses GitHub PR flow

    const errors = validateForm(form)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }
    setValidationErrors([])
    setStatus('submitting')

    try {      const octokit = createGitHubClient(auth.token!)
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

      const { data: pr } = await octokit.pulls.create({
        owner: org, repo,
        title: `feat: add ${form.name} v${form.version}`,
        head: branch,
        base: 'main',
        body: `## ${form.name}\n\n${form.description}\n\n**類型：** ${form.type}\n**版本：** ${form.version}\n**標籤：** ${form.tags}`,
      })

      setPrUrl(pr.html_url)
      setStatus('success')
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : '發布失敗')
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">發布工具</h1>
        {validationErrors.length > 0 && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="mb-2 text-sm font-medium text-red-700 dark:text-red-400">請修正以下問題後再提交：</p>
            <ul className="list-disc pl-5 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-sm text-red-600 dark:text-red-400">{err}</li>
              ))}
            </ul>
          </div>
        )}
        {status === 'success' && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            PR 已建立，等待 maintainer review 後正式上線。{' '}
            <a href={prUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">
              查看 PR
            </a>
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
              <div className="mt-1">
                <VersionInput
                  value={form.version}
                  onChange={(v) => setForm({ ...form, version: v })}
                />
              </div>
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
          {form.type === 'plugin' ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="mb-3 text-sm font-medium text-amber-800 dark:text-amber-300">
                Plugin 需透過 GitHub Pull Request 發布
              </p>
              <p className="mb-3 text-xs text-amber-700 dark:text-amber-400">
                Plugin 包含多個檔案（commands/、hooks/、.mcp.json 等），需要在本機建立並測試後再提交。
              </p>
              <pre className="mb-3 rounded bg-amber-100 p-3 text-xs text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 overflow-x-auto">
{`your-plugin-name/
├── plugin.json                 # AgentKit manifest
├── .claude-plugin/
│   └── plugin.json             # Claude Code native manifest
├── commands/
│   └── my-command.md           # slash commands
└── README.md`}
              </pre>
              <a
                href={`https://github.com/${import.meta.env.VITE_GITHUB_ORG}/agentkit-plugins/fork`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
              >
                前往 GitHub Fork &amp; 建立 PR →
              </a>
            </div>
          ) : (
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
          )}
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
