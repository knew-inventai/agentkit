import { useState, useEffect } from 'react'
import { fetchPackages } from '../services/api'
import type { Package, PackageStats, PackageType, SortKey } from '../types'

interface FetchState {
  type: PackageType | 'all'
  sort: SortKey
  q: string
  offset: number
}

export interface UsePackagesResult {
  packages: Package[]
  stats: Record<string, PackageStats>
  total: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => void
  type: PackageType | 'all'
  setType: (t: PackageType | 'all') => void
  sort: SortKey
  setSort: (s: SortKey) => void
  query: string
  setQuery: (q: string) => void
}

export function usePackages(token: string | undefined): UsePackagesResult {
  const [packages, setPackages] = useState<Package[]>([])
  const [stats, setStats] = useState<Record<string, PackageStats>>({})
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchState, setFetchState] = useState<FetchState>({
    type: 'all',
    sort: 'downloads',
    q: '',
    offset: 0,
  })

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const isInitial = fetchState.offset === 0

    fetchPackages({
      token,
      type: fetchState.type === 'all' ? undefined : fetchState.type,
      sort: fetchState.sort,
      q: fetchState.q || undefined,
      offset: fetchState.offset,
      limit: 20,
    })
      .then((res) => {
        if (cancelled) return

        const newPkgs: Package[] = res.packages.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type as PackageType,
          version: item.version,
          description: item.description,
          author: item.author,
          tags: item.tags,
          compatible: item.compatible,
          license: item.license,
          updatedAt: item.updatedAt,
          repoPath: item.repoPath,
        }))

        const newStats: Record<string, PackageStats> = Object.fromEntries(
          res.packages.map((item) => [
            item.id,
            { downloads: item.downloads, likes: item.likes, liked_by_me: item.liked_by_me },
          ]),
        )

        if (isInitial) {
          setPackages(newPkgs)
          setStats(newStats)
        } else {
          setPackages((prev) => [...prev, ...newPkgs])
          setStats((prev) => ({ ...prev, ...newStats }))
        }
        setTotal(res.total)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, fetchState])

  return {
    packages,
    stats,
    total,
    isLoading,
    error,
    hasMore: packages.length < total,
    loadMore: () =>
      setFetchState((prev) => ({ ...prev, offset: prev.offset + 20 })),
    type: fetchState.type,
    setType: (t) => setFetchState((prev) => ({ ...prev, type: t, offset: 0 })),
    sort: fetchState.sort,
    setSort: (s) => setFetchState((prev) => ({ ...prev, sort: s, offset: 0 })),
    query: fetchState.q,
    setQuery: (q) => setFetchState((prev) => ({ ...prev, q, offset: 0 })),
  }
}
