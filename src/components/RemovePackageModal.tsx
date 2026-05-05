import { useState } from 'react'
import { createGitHubClient, checkBranchExists, removePackageFiles } from '../services/github'
import type { PackageType } from '../types'

interface Props {
  type: PackageType
  name: string
  token: string
  requesterLogin: string
  onClose: () => void
  onSuccess: (prUrl: string) => void
}

const REASONS: { label: string; placeholder: string }[] = [
  { label: '內容有誤 / 功能失效',       placeholder: '請描述問題（例如：指令錯誤、連結失效）' },
  { label: '包含惡意程式碼',             placeholder: '請說明可疑的指令或行為' },
  { label: '竊取使用者資料 / 隱私問題', placeholder: '請說明可疑的資料蒐集行為' },
  { label: '執行未宣告的系統操作',       placeholder: '請說明發現的異常操作' },
  { label: '重複套件',                   placeholder: '請填入重複的套件名稱' },
  { label: '使用未授權的第三方程式碼',   placeholder: '請說明來源與疑慮' },
  { label: '其他',                       placeholder: '請詳細說明' },
]

const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300'
const inputClass =
  'mt-1 w-full rounded border px-3 py-2 text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500'

export default function RemovePackageModal({
  type,
  name,
  token,
  requesterLogin,
  onClose,
  onSuccess,
}: Props) {
  const [selectedReason, setSelectedReason] = useState<number | null>(null)
  const [details, setDetails] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const currentPlaceholder =
    selectedReason !== null ? REASONS[selectedReason].placeholder : '請先選擇理由'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedReason === null) {
      setErrorMsg('請選擇下架理由')
      setStatus('error')
      return
    }
    if (!details.trim()) {
      setErrorMsg('請填寫補充說明')
      setStatus('error')
      return
    }
    setStatus('submitting')
    setErrorMsg('')
    try {
      const octokit = createGitHubClient(token)

      const alreadyExists = await checkBranchExists(octokit, type, name)
      if (alreadyExists) {
        setErrorMsg('已有待審的下架請求，請等待 maintainer 處理')
        setStatus('error')
        return
      }

      const prUrl = await removePackageFiles(octokit, {
        type,
        name,
        reason: REASONS[selectedReason].label,
        details: details.trim(),
        requesterLogin,
      })
      onSuccess(prUrl)
    } catch (e: unknown) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : '送出失敗，請稍後再試')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            請求下架：{name}
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

          <div>
            <label className={labelClass}>請選擇下架理由</label>
            <div className="mt-2 space-y-2">
              {REASONS.map((r, i) => (
                <label key={i} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={i}
                    checked={selectedReason === i}
                    onChange={() => { setSelectedReason(i); setDetails('') }}
                    className="accent-red-600"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className={labelClass}>補充說明（必填）</label>
            <textarea
              rows={3}
              required
              placeholder={currentPlaceholder}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className={inputClass}
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
              disabled={status === 'submitting'}
              className="flex-1 rounded-md bg-red-600 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {status === 'submitting' ? '送出中...' : '送出下架請求'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
