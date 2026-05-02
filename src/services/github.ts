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

/** Fetch plugin.json from a specific git ref (tag format: "{name}@{version}") */
export async function fetchManifestAtRef(
  octokit: Octokit,
  type: PackageType,
  name: string,
  ref: string,
): Promise<PackageManifest> {
  const repo = REPOS[type]
  const { data } = await octokit.repos.getContent({
    owner: ORG,
    repo,
    path: `${name}/plugin.json`,
    ref,
  })
  if (!('content' in data)) throw new Error('not a file')
  return JSON.parse(decodeBase64(data.content)) as PackageManifest
}

/** Fetch README.md from a specific git ref */
export async function fetchReadmeAtRef(
  octokit: Octokit,
  type: PackageType,
  name: string,
  ref: string,
): Promise<string> {
  const repo = REPOS[type]
  try {
    const { data } = await octokit.repos.getContent({
      owner: ORG,
      repo,
      path: `${name}/README.md`,
      ref,
    })
    if (!('content' in data)) return ''
    return decodeBase64(data.content)
  } catch {
    return ''
  }
}

/** Get raw URL for the body file at a specific release tag.
 *  Tag format: "{name}@{version}" e.g. "code-reviewer@1.0.0"
 */
export function getRawFileUrlAtTag(type: PackageType, name: string, version: string): string {
  const repo = REPOS[type]
  const fileName: Record<PackageType, string> = {
    skill: 'SKILL.md',
    prompt: 'PROMPT.md',
    mcp: 'mcp-config.json',
    plugin: 'plugin.json',
  }
  const tag = `${name}@${version}`
  return `https://raw.githubusercontent.com/${ORG}/${repo}/${tag}/${name}/${fileName[type]}`
}

export interface UpdatePackagePayload {
  type: PackageType
  name: string
  oldVersion: string
  newVersion: string
  description: string
  tags: string[]
  compatible: string[]
  content: string
  readme: string
  authorName: string
  authorGithub?: string
  dependencies?: string[]   // plugin only — omit or [] means no dependencies
}

/** Fetch a file's blob SHA (needed for updating existing files via GitHub API) */
async function getFileSha(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  branch: string,
): Promise<string | undefined> {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path, ref: branch })
    if ('sha' in data) return data.sha
  } catch (e: unknown) {
    // only treat 404 as "file doesn't exist"; re-throw other errors
    if (e instanceof Error && 'status' in e && (e as { status: number }).status !== 404) {
      throw e
    }
  }
  return undefined
}

/** Create a PR that updates an existing package's files */
export async function updatePackageFiles(
  octokit: Octokit,
  payload: UpdatePackagePayload,
): Promise<string> {
  const org = ORG
  const repo = REPOS[payload.type]
  const branch = `update/${payload.name}-${Date.now()}`
  const mainFileName: Record<PackageType, string> = {
    skill: 'SKILL.md',
    prompt: 'PROMPT.md',
    mcp: 'mcp-config.json',
    plugin: 'plugin.json',
  }

  const { data: ref } = await octokit.git.getRef({ owner: org, repo, ref: 'heads/main' })
  const baseSha = ref.object.sha

  await octokit.git.createRef({
    owner: org,
    repo,
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  })

  const manifest = {
    name: payload.name,
    version: payload.newVersion,
    description: payload.description,
    author: { name: payload.authorName, ...(payload.authorGithub ? { github: payload.authorGithub } : {}) },
    license: 'MIT',
    _agentkit: {
      type: payload.type,
      tags: payload.tags,
      compatible: payload.compatible,
      ...(payload.type === 'plugin' && payload.dependencies && payload.dependencies.length > 0
        ? { dependencies: payload.dependencies }
        : {}),
    },
  }

  const filesToUpdate = [
    { path: `${payload.name}/plugin.json`, content: JSON.stringify(manifest, null, 2) },
    { path: `${payload.name}/${mainFileName[payload.type]}`, content: payload.content },
    ...(payload.readme
      ? [{ path: `${payload.name}/README.md`, content: payload.readme }]
      : []),
  ]

  for (const file of filesToUpdate) {
    const sha = await getFileSha(octokit, org, repo, file.path, branch)
    await octokit.repos.createOrUpdateFileContents({
      owner: org,
      repo,
      path: file.path,
      message: `fix: update ${payload.name} v${payload.oldVersion} → v${payload.newVersion}`,
      content: btoa(unescape(encodeURIComponent(file.content))),
      branch,
      ...(sha ? { sha } : {}),
    })
  }

  const { data: pr } = await octokit.pulls.create({
    owner: org,
    repo,
    title: `fix: update ${payload.name} v${payload.oldVersion} → v${payload.newVersion}`,
    head: branch,
    base: 'main',
    body: `## ${payload.name}\n\n${payload.description}\n\n**類型：** ${payload.type}\n**版本：** ${payload.oldVersion} → ${payload.newVersion}\n**標籤：** ${payload.tags.join(', ')}`,
  })

  return pr.html_url
}
