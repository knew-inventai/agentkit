import { Octokit } from '@octokit/rest'
import type { Package, PackageManifest, PackageRelease, PackageType } from '../types'

const ORG = import.meta.env.VITE_GITHUB_ORG

/** 正確解碼 GitHub API 回傳的 base64（支援 UTF-8 多位元組字元） */
function decodeBase64(b64: string): string {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}
const REPOS: Record<PackageType, string> = {
  skill: import.meta.env.VITE_REPO_SKILLS,
  prompt: import.meta.env.VITE_REPO_PROMPTS,
  mcp: import.meta.env.VITE_REPO_MCP,
  plugin: import.meta.env.VITE_REPO_PLUGINS,
}

export function createGitHubClient(token?: string) {
  return new Octokit({ auth: token })
}

/** 取得特定 package 的 plugin.json */
export async function fetchManifest(
  octokit: Octokit,
  type: PackageType,
  name: string,
): Promise<PackageManifest> {
  const repo = REPOS[type]
  const { data } = await octokit.repos.getContent({
    owner: ORG,
    repo,
    path: `${name}/plugin.json`,
  })
  if (!('content' in data)) throw new Error('not a file')
  const json = decodeBase64(data.content)
  return JSON.parse(json) as PackageManifest
}

/** 取得 category repo 所有 packages 清單 */
export async function fetchPackageList(
  octokit: Octokit,
  type: PackageType,
): Promise<Package[]> {
  const repo = REPOS[type]
  const { data } = await octokit.repos.getContent({
    owner: ORG,
    repo,
    path: '',
  })

  if (!Array.isArray(data)) return []

  const dirs = data.filter(
    (item) => item.type === 'dir' && !item.name.startsWith('.') && !item.name.startsWith('_'),
  )

  const packages = await Promise.allSettled(
    dirs.map(async (dir) => {
      const manifest = await fetchManifest(octokit, type, dir.name)
      const pkg: Package = {
        id: `${type}/${dir.name}`,
        name: dir.name,
        type,
        version: manifest.version,
        description: manifest.description,
        author: manifest.author.name,
        tags: manifest._agentkit?.tags ?? [],
        compatible: manifest._agentkit?.compatible ?? [],
        license: manifest.license,
        updatedAt: new Date().toISOString(),
        repoPath: `https://raw.githubusercontent.com/${ORG}/${repo}/main/${dir.name}`,
      }
      return pkg
    }),
  )

  return packages
    .filter((r): r is PromiseFulfilledResult<Package> => r.status === 'fulfilled')
    .map((r) => r.value)
}

/** 取得所有 category 的 packages */
export async function fetchAllPackages(octokit: Octokit): Promise<Package[]> {
  const types: PackageType[] = ['skill', 'prompt', 'mcp', 'plugin']
  const results = await Promise.allSettled(
    types.map((type) => fetchPackageList(octokit, type)),
  )
  return results
    .filter((r): r is PromiseFulfilledResult<Package[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value)
}

/** 取得 package 的 README.md 內容 */
export async function fetchReadme(
  octokit: Octokit,
  type: PackageType,
  name: string,
): Promise<string> {
  const repo = REPOS[type]
  try {
    const { data } = await octokit.repos.getContent({
      owner: ORG,
      repo,
      path: `${name}/README.md`,
    })
    if (!('content' in data)) return ''
    return decodeBase64(data.content)
  } catch {
    return '此 package 尚無說明文件。'
  }
}

/** 取得 package 的所有 GitHub Releases */
export async function fetchReleases(
  octokit: Octokit,
  type: PackageType,
  name: string,
): Promise<PackageRelease[]> {
  const repo = REPOS[type]
  const prefix = `${name}@`
  try {
    const { data } = await octokit.repos.listReleases({ owner: ORG, repo, per_page: 20 })
    return data
      .filter((r) => r.tag_name.startsWith(prefix))
      .map((r) => ({
        version: r.tag_name.replace(prefix, ''),
        publishedAt: r.published_at ?? r.created_at,
        notes: r.body ?? '',
      }))
  } catch {
    return []
  }
}

/** 取得 package 主體檔案的 raw URL */
export function getRawFileUrl(type: PackageType, name: string): string {
  const repo = REPOS[type]
  const fileName: Record<PackageType, string> = {
    skill: 'SKILL.md',
    prompt: 'PROMPT.md',
    mcp: 'mcp-config.json',
    plugin: 'plugin.json',
  }
  return `https://raw.githubusercontent.com/${ORG}/${repo}/main/${name}/${fileName[type]}`
}
