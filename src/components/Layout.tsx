import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useDarkMode } from '../hooks/useDarkMode'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { auth, login, logout } = useAuth()
  const navigate = useNavigate()
  const { isDark, toggle } = useDarkMode()

  // 未登入時顯示登入頁面
  if (!auth.token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-10 shadow-sm text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">AgentKit</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Inventai AI 工具資源平台</p>
          <button
            onClick={login}
            className="w-full rounded-md bg-gray-900 dark:bg-gray-100 px-4 py-2.5 text-sm text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-300"
          >
            GitHub 登入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-xl font-bold text-gray-900 dark:text-gray-100">AgentKit</Link>
          <nav className="flex items-center gap-6">
            <Link to="/browse" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">瀏覽</Link>
            <Link to="/search" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">搜尋</Link>
            <Link to="/docs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">使用手冊</Link>
            <div className="flex items-center gap-3">
              {/* 暗黑模式切換 */}
              <button
                onClick={toggle}
                className="rounded-md border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isDark ? '切換為亮色模式' : '切換為暗色模式'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => navigate('/publish')}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                發布工具
              </button>
              <button onClick={logout} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                登出 ({auth.username})
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        AgentKit — Inventai AI 工具資源平台
      </footer>
    </div>
  )
}
