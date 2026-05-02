export type PackageType = 'skill' | 'prompt' | 'mcp' | 'plugin'

export interface PackageManifest {
  name: string
  version: string
  description: string
  author: { name: string; email?: string; github?: string }
  license: string
  _agentkit: {
    type: PackageType
    tags: string[]
    compatible: string[]
    dependencies?: string[]
  }
}

export interface Package {
  id: string              // "{type}/{name}"
  name: string
  type: PackageType
  version: string
  description: string
  author: string
  tags: string[]
  compatible: string[]
  license: string
  updatedAt: string       // ISO date string
  repoPath: string        // GitHub raw URL base
  dependencies?: string[]   // ["skill/code-reviewer@1.0.0", ...]
}

export interface PackageStats {
  downloads: number
  likes: number
  liked_by_me: boolean
}

export interface PackageRelease {
  version: string
  publishedAt: string
  notes: string
}

export type InstallTool = 'claude-code' | 'cursor' | 'download'
export type InstallScope = 'global' | 'project'

export interface AuthState {
  token: string | null
  username: string | null
  isLoading: boolean
}

export type SortKey = 'downloads' | 'likes' | 'updated'

export interface ParsedDependency {
  type: PackageType
  name: string
  version: string
  id: string   // "{type}/{name}"
}

/**
 * Parse "skill/code-reviewer@1.0.0" → ParsedDependency.
 * Returns null if the string is malformed.
 */
export function parseDependency(dep: string): ParsedDependency | null {
  const m = dep.match(/^(skill|prompt|mcp|plugin)\/([a-z0-9-]+)@(\d+\.\d+\.\d+)$/)
  if (!m) return null
  return { type: m[1] as PackageType, name: m[2], version: m[3], id: `${m[1]}/${m[2]}` }
}
