import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { handleCallback } = useAuth()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const code = new URLSearchParams(window.location.search).get('code')
    if (!code) {
      navigate('/')
      return
    }

    handleCallback(code).then((ok) => {
      navigate(ok ? '/browse' : '/?error=auth_failed')
    })
  }, [handleCallback, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">正在登入中...</p>
    </div>
  )
}
