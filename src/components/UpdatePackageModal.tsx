import { useState } from 'react'
import { createGitHubClient, updatePackageFiles } from '../services/github'
import type { PackageManifest, PackageType } from '../types'
import VersionInput from './VersionInput'
import DependencyPicker from './DependencyPicker'

interface Props {
  type: PackageType
  name: string
  manifest: PackageManifest
  currentContent: string
  currentReadme: string
  token: string
  onClose: () => void
  onSuccess: (prUrl: string) => void
}

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300'
const inputClass =
  'mt-1 w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'

export default function UpdatePackageModal({
  type,
  name,
  manifest,
  currentContent,
  currentReadme,
  token,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    version: manifest.version,
    description: manifest.description,
    tags: manifest._agentkit?.tags.join(', ') ?? '',
    compatible: manifest._agentkit?.compatible.join(', ') ?? '',
    content: currentContent,
    readme: currentReadme,
    dependencies: (manifest._agentkit as Record<string, unknown> & { dependencies?: string[] })?.dependencies ?? [] as string[],
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')
    try {
      const octokit = createGitHubClient(token)
      const prUrl = await updatePackageFiles(octokit, {
        type,
        name,
        oldVersion: manifest.version,
        newVersion: form.version,
        description: form.description,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        compatible: form.compatible.split(',').map((c) => c.trim()).filter(Boolean),
        content: form.content,
        readme: form.readme,
        authorName: manifest.author.name,
        authorGithub: manifest.author.github,
        dependencies: form.dependencies,
      })
      onSuccess(prUrl)
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : '更新失敗')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            更新 {name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          {status === 'error' && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>名稱（不可修改）</label>
              <input value={name} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelClass}>新版本</label>
              <div className="mt-1">
                <VersionInput
                  value={form.version}
                  onChange={(v) => setForm({ ...form, version: v })}
                  min={manifest.version}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>描述</label>
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
              <label className={labelClass}>標籤（逗號分隔）</label>
              <input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>相容工具（逗號分隔）</label>
              <input
                value={form.compatible}
                onChange={(e) => setForm({ ...form, compatible: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {type === 'plugin' && (
            <DependencyPicker
              value={form.dependencies}
              onChange={(deps) => setForm((f) => ({ ...f, dependencies: deps }))}
              token={token}
            />
          )}

          <div>
            <label className={labelClass}>主體內容</label>
            <textarea
              required
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelClass}>README.md（選填）</label>
            <textarea
              rows={5}
              value={form.readme}
              onChange={(e) => setForm({ ...form, readme: e.target.value })}
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border py-2 text-sm text-gray-700 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={status === 'submitting' || form.version === manifest.version}
              className="flex-1 rounded-md bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {status === 'submitting' ? '建立 PR 中...' : '送出更新（建立 Pull Request）'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
