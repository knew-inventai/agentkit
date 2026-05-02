import type { PackageStats } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL

export async function exchangeOAuthCode(code: string): Promise<string> {
  const res = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('OAuth token exchange failed')
  const data = await res.json() as { access_token: string }
  return data.access_token
}

export async function fetchPackageStats(
  token: string,
  ids: string[],
): Promise<Record<string, PackageStats>> {
  if (ids.length === 0) return {}
  const params = new URLSearchParams({ ids: ids.join(',') })
  const res = await fetch(`${API_BASE}/packages/stats?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return {}
  return res.json() as Promise<Record<string, PackageStats>>
}

export async function toggleLike(
  token: string,
  type: string,
  name: string,
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/packages/${type}/${name}/like`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Like failed')
  const data = await res.json() as { liked: boolean }
  return data.liked
}

export async function recordDownload(
  token: string,
  type: string,
  name: string,
): Promise<void> {
  await fetch(`${API_BASE}/packages/${type}/${name}/download`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
}

// ─── Package listing (D1-backed) ──────────────────────────

export interface PackageListItem {
  id: string
  type: string
  name: string
  version: string
  description: string
  tags: string[]
  compatible: string[]
  author: string
  license: string
  updatedAt: string
  repoPath: string
  downloads: number
  likes: number
  liked_by_me: boolean
}

export interface PackagesApiResponse {
  packages: PackageListItem[]
  total: number
  offset: number
  limit: number
}

export async function fetchPackages(opts: {
  token?: string
  type?: string
  sort?: string
  q?: string
  offset?: number
  limit?: number
}): Promise<PackagesApiResponse> {
  const params = new URLSearchParams()
  if (opts.type)             params.set('type', opts.type)
  if (opts.sort)             params.set('sort', opts.sort)
  if (opts.q)                params.set('q', opts.q)
  if (opts.offset != null)   params.set('offset', String(opts.offset))
  if (opts.limit  != null)   params.set('limit',  String(opts.limit))

  const headers: Record<string, string> = {}
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`

  const res = await fetch(`${API_BASE}/packages?${params}`, { headers })
  if (!res.ok) throw new Error(`fetchPackages failed: ${res.status}`)
  return res.json() as Promise<PackagesApiResponse>
}
