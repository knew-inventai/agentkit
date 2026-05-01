import { useState, useEffect } from 'react'
import { createGitHubClient, fetchManifest, fetchReadme, fetchReleases } from '../services/github'
import { fetchPackageStats } from '../services/api'
import type { PackageManifest, PackageRelease, PackageStats, PackageType } from '../types'

export function usePackageDetail(type: PackageType, name: string, token?: string) {
  const [manifest, setManifest] = useState<PackageManifest | null>(null)
  const [readme, setReadme] = useState('')
  const [releases, setReleases] = useState<PackageRelease[]>([])
  const [stats, setStats] = useState<PackageStats>({ downloads: 0, likes: 0, liked_by_me: false })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    const octokit = createGitHubClient(token)
    const packageId = `${type}/${name}`

    Promise.all([
      fetchManifest(octokit, type, name),
      fetchReadme(octokit, type, name),
      fetchReleases(octokit, type, name),
      token ? fetchPackageStats(token, [packageId]) : Promise.resolve({} as Record<string, PackageStats>),
    ])
      .then(([m, r, rel, s]) => {
        setManifest(m)
        setReadme(r)
        setReleases(rel)
        setStats(s[packageId] ?? { downloads: 0, likes: 0, liked_by_me: false })
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setIsLoading(false))
  }, [type, name, token])

  return { manifest, readme, releases, stats, setStats, isLoading, error }
}
