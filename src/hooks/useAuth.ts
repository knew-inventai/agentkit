import { useState, useCallback } from 'react'
import { createGitHubClient } from '../services/github'
import { exchangeOAuthCode } from '../services/api'
import type { AuthState } from '../types'

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const TOKEN_KEY = 'agentkit_token'
const USERNAME_KEY = 'agentkit_username'

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: sessionStorage.getItem(TOKEN_KEY),
    username: sessionStorage.getItem(USERNAME_KEY),
    isLoading: false,
  }))

  const login = useCallback(() => {
    const callbackUrl = `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: callbackUrl,
      scope: 'read:org',
    })
    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USERNAME_KEY)
    setAuth({ token: null, username: null, isLoading: false })
  }, [])

  const handleCallback = useCallback(async (code: string) => {
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
