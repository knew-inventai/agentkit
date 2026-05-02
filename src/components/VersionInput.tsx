import { useState } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  min?: string   // if set, stepper buttons that would result in version <= min are disabled
}

const PRERELEASE_RE = /^[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*$/

function parseBase(v: string): [number, number, number] {
  const base = v.includes('-') ? v.slice(0, v.indexOf('-')) : v
  const parts = base.split('.').map(Number)
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

function parsePrerelease(v: string): string {
  const idx = v.indexOf('-')
  return idx >= 0 ? v.slice(idx + 1) : ''
}

/** Returns negative / 0 / positive like Array.sort comparator */
function cmp(a: [number, number, number], b: [number, number, number]): number {
  if (a[0] !== b[0]) return a[0] - b[0]
  if (a[1] !== b[1]) return a[1] - b[1]
  return a[2] - b[2]
}

export default function VersionInput({ value, onChange, min }: Props) {
  const [ma, mi, pa] = parseBase(value)
  const [major, setMajor] = useState(ma)
  const [minor, setMinor] = useState(mi)
  const [patch, setPatch] = useState(pa)
  const [prerelease, setPrerelease] = useState(parsePrerelease(value))
  const [showPrerelease, setShowPrerelease] = useState(parsePrerelease(value) !== '')

  const minBase = min ? parseBase(min) : null

  const emit = (a: number, b: number, c: number, pre: string) =>
    onChange(`${a}.${b}.${c}${pre ? `-${pre}` : ''}`)

  /** True if candidate [a,b,c] would be <= min */
  const leMin = (a: number, b: number, c: number) =>
    minBase !== null && cmp([a, b, c], minBase) <= 0

  // ── Stepper handlers ─────────────────────────────────────────────
  const incMajor = () => { const a = major + 1; setMajor(a); setMinor(0); setPatch(0); emit(a, 0, 0, prerelease) }
  const decMajor = () => { const a = major - 1; setMajor(a); emit(a, minor, patch, prerelease) }
  const incMinor = () => { const b = minor + 1; setMinor(b); setPatch(0); emit(major, b, 0, prerelease) }
  const decMinor = () => { const b = minor - 1; setMinor(b); emit(major, b, patch, prerelease) }
  const incPatch = () => { const c = patch + 1; setPatch(c); emit(major, minor, c, prerelease) }
  const decPatch = () => { const c = patch - 1; setPatch(c); emit(major, minor, c, prerelease) }

  // ── Pre-release handlers ──────────────────────────────────────────
  const handlePrereleaseChange = (v: string) => { setPrerelease(v); emit(major, minor, patch, v) }
  const openPrerelease = () => setShowPrerelease(true)
  const closePrerelease = () => { setShowPrerelease(false); setPrerelease(''); emit(major, minor, patch, '') }

  const prereleaseInvalid = prerelease !== '' && !PRERELEASE_RE.test(prerelease)

  // ── Styles ────────────────────────────────────────────────────────
  const btn = (disabled: boolean) =>
    `w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${
      disabled
        ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'
        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 cursor-pointer'
    }`

  interface StepperProps {
    label: string
    val: number
    onInc: () => void
    onDec: () => void
    decDisabled: boolean
  }

  const Stepper = ({ label, val, onInc, onDec, decDisabled }: StepperProps) => {
    const isDecDisabled = decDisabled || val === 0
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onDec} disabled={isDecDisabled} className={btn(isDecDisabled)}>
            −
          </button>
          <span className="w-8 text-center text-sm font-mono text-gray-900 dark:text-white select-none">
            {val}
          </span>
          <button type="button" onClick={onInc} className={btn(false)}>
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Stepper row */}
      <div className="flex items-end gap-1.5">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 pb-2">v</span>
        <Stepper
          label="major"
          val={major}
          onInc={incMajor}
          onDec={decMajor}
          decDisabled={leMin(major - 1, 0, 0)}
        />
        <span className="text-gray-400 dark:text-gray-500 pb-2">.</span>
        <Stepper
          label="minor"
          val={minor}
          onInc={incMinor}
          onDec={decMinor}
          decDisabled={leMin(major, minor - 1, 0)}
        />
        <span className="text-gray-400 dark:text-gray-500 pb-2">.</span>
        <Stepper
          label="patch"
          val={patch}
          onInc={incPatch}
          onDec={decPatch}
          decDisabled={leMin(major, minor, patch - 1)}
        />
      </div>

      {/* Pre-release section */}
      {showPrerelease ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
          <input
            type="text"
            value={prerelease}
            onChange={(e) => handlePrereleaseChange(e.target.value)}
            placeholder="alpha.1"
            className={`w-36 rounded border px-2 py-1 text-sm font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 ${
              prereleaseInvalid
                ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-400'
            }`}
          />
          <button
            type="button"
            onClick={closePrerelease}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 leading-none text-base"
            aria-label="移除預發布標籤"
          >
            ✕
          </button>
          {prereleaseInvalid && (
            <span className="text-xs text-red-500 w-full">
              格式：字母、數字、連字號，以 . 分隔（例：alpha、rc.1）
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={openPrerelease}
          className="mt-2 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          ＋ 預發布標籤
        </button>
      )}
    </div>
  )
}
