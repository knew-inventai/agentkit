export type PackageType = 'skill' | 'agent' | 'mcp' | 'plugin'

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

export type InstallTool = 'copilot' | 'claude-code' | 'codex' | 'download'
export type InstallScope = 'global' | 'project'

export interface AuthState {
  token: string | null
  username: string | null
  isLoading: boolean
}

export type SortKey = 'downloads' | 'likes' | 'updated'
