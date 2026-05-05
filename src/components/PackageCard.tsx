import { Link } from 'react-router-dom'
import type { Package, PackageStats } from '../types'

const TYPE_BADGE: Record<string, string> = {
  skill: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  agent: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  mcp: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  plugin: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
}

interface Props {
  pkg: Package
  stats?: PackageStats
}

export default function PackageCard({ pkg, stats }: Props) {
  return (
    <Link
      to={`/${pkg.type}/${pkg.name}`}
      className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[pkg.type]}`}>
              {pkg.type}
            </span>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{pkg.name}</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{pkg.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {pkg.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      {stats && (
        <div className="mt-3 flex items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-3 text-xs text-gray-400 dark:text-gray-500">
          <span>🔖 {stats.likes}</span>
          <span>👁 {stats.views}</span>
          <span className="ml-auto">v{pkg.version}</span>
        </div>
      )}
    </Link>
  )
}
