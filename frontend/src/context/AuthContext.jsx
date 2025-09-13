import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ct_token') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('ct_user')
    return raw ? JSON.parse(raw) : null
  })

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      let msg = 'Ошибка входа'
      try {
        const err = await res.json()
        if (typeof err?.detail === 'string') msg = err.detail
        else if (Array.isArray(err?.detail)) msg = err.detail.map(d => d.msg).join(', ')
      } catch {}
      throw new Error(msg)
    }
    const data = await res.json()
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('ct_token', data.access_token)
    localStorage.setItem('ct_user', JSON.stringify(data.user))
  }

  const register = async (payload) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      let msg = 'Ошибка регистрации'
      try {
        const err = await res.json()
        if (typeof err?.detail === 'string') msg = err.detail
        else if (Array.isArray(err?.detail)) msg = err.detail.map(d => `${d.loc?.slice(-1)[0]}: ${d.msg}`).join('\n')
      } catch {}
      throw new Error(msg)
    }
    // After registration, auto login
    await login(payload.username, payload.password)
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('ct_token')
    localStorage.removeItem('ct_user')
  }

  const value = useMemo(() => ({ token, user, login, logout, register }), [token, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
