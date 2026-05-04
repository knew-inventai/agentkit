import { useState, useCallback } from 'react'
import { createGitHubClient } from '../services/github'
import { exchangeOAuthCode } from '../services/api'
import type { AuthState } from '../types'

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const TOKEN_KEY = 'agentkit_token'
const USERNAME_KEY = 'agentkit_username'

// ─── Dev mode ────────────────────────────────────────────
// 僅在 `npm run dev` 時生效（import.meta.env.DEV = true）
// 自動以 'dev-user' 身分登入，跳過 GitHub OAuth。
// 在 production build 中此區塊會被 tree-shaken 移除。
const IS_DEV = import.meta.env.DEV
const DEV_AUTH: AuthState = { token: null, username: 'dev-user', isLoading: false }

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    if (IS_DEV) return DEV_AUTH
    return {
      token: sessionStorage.getItem(TOKEN_KEY),
      username: sessionStorage.getItem(USERNAME_KEY),
      isLoading: false,
    }
  })

  const login = useCallback(() => {
    if (IS_DEV) return
    const callbackUrl = `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: callbackUrl,
      scope: 'repo read:org',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }, [])

  const logout = useCallback(() => {
    if (IS_DEV) return
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USERNAME_KEY)
    setAuth({ token: null, username: null, isLoading: false })
  }, [])

  const handleCallback = useCallback(async (code: string) => {
    if (IS_DEV) return true
    setAuth((prev) => ({ ...prev, isLoading: true }))
    try {
      const token = await exchangeOAuthCode(code)
      const octokit = createGitHubClient(token)
      const { data: user } = await octokit.users.getAuthenticated()
      sessionStorage.setItem(TOKEN_KEY, token)
      sessionStorage.setItem(USERNAME_KEY, user.login)
      setAuth({ token, username: user.login, isLoading: false })
      return true
    } catch {
      setAuth({ token: null, username: null, isLoading: false })
      return false
    }
  }, [])

  return { auth, login, logout, handleCallback }
}
