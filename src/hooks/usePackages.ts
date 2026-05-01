import { useState, useEffect } from 'react'
import { createGitHubClient, fetchAllPackages, fetchPackageList } from '../services/github'
import { fetchPackageStats } from '../services/api'
import type { Package, PackageStats, PackageType } from '../types'

export function usePackages(token?: string, filterType?: PackageType) {
  const [packages, setPackages] = useState<Package[]>([])
  const [stats, setStats] = useState<Record<string, PackageStats>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    const octokit = createGitHubClient(token)
    const fetcher = filterType
      ? fetchPackageList(octokit, filterType)
      : fetchAllPackages(octokit)

    fetcher
      .then(async (pkgs) => {
        setPackages(pkgs)
        if (token && pkgs.length > 0) {
          const statsData = await fetchPackageStats(token, pkgs.map((p) => p.id))
          setStats(statsData)
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [token, filterType])

  return { packages, stats, isLoading, error }
}
