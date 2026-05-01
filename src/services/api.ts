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
