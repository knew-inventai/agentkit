import { useState, useEffect } from 'react'
import {
  createGitHubClient,
  fetchManifest,
  fetchManifestAtRef,
  fetchReadme,
  fetchReadmeAtRef,
  fetchReleases,
} from '../services/github'
import { fetchPackageStats } from '../services/api'
import type { PackageManifest, PackageRelease, PackageStats, PackageType } from '../types'

export function usePackageDetail(type: PackageType, name: string, token?: string) {
  const [manifest, setManifest] = useState<PackageManifest | null>(null)
  const [readme, setReadme] = useState('')
  const [releases, setReleases] = useState<PackageRelease[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [stats, setStats] = useState<PackageStats>({ downloads: 0, likes: 0, liked_by_me: false })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial load: fetch latest manifest + readme + releases + stats
  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setSelectedVersion(null)
    const octokit = createGitHubClient(token)
    const packageId = `${type}/${name}`

    Promise.all([
      fetchManifest(octokit, type, name),
      fetchReadme(octokit, type, name),
      fetchReleases(octokit, type, name),
      token
        ? fetchPackageStats(token, [packageId])
        : Promise.resolve({} as Record<string, PackageStats>),
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

  // Version switch: re-fetch manifest + readme at the selected tag
  useEffect(() => {
    if (selectedVersion === null) return
    let cancelled = false
    const octokit = createGitHubClient(token)
    const ref = `${name}@${selectedVersion}`
    setIsLoading(true)
    Promise.all([
      fetchManifestAtRef(octokit, type, name, ref),
      fetchReadmeAtRef(octokit, type, name, ref),
    ])
      .then(([m, r]) => {
        if (!cancelled) {
          setManifest(m)
          setReadme(r)
        }
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [selectedVersion, type, name, token]) // proper deps; token/name/type changes reset selectedVersion via first effect

  return { manifest, readme, releases, selectedVersion, setSelectedVersion, stats, setStats, isLoading, error }
}
