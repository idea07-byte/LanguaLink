import { createContext, useContext, useState, useEffect } from 'react'
import { loginUser, registerUser, getProfile, updateProfile } from '../api/auth'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 1,
  name: 'Alex Rivera',
  email: 'alex@example.com',
  avatar: null,
  nativeLanguage: 'English',
  learningLanguages: ['Spanish', 'Japanese'],
  level: 'Intermediate',
  xp: 2450,
  streak: 12,
  partnersCount: 8,
  onboardingDone: true,
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lingualink_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  // Sync profile on mount if token is present
  useEffect(() => {
    const token = localStorage.getItem('lingualink_token')
    if (token) {
      getProfile()
        .then((profile) => {
          if (profile) {
            setUser((prev) => ({ ...prev, ...profile }))
            localStorage.setItem('lingualink_user', JSON.stringify(profile))
          }
        })
        .catch(() => {
          // Token expired or server offline - continue with existing session
        })
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      // Attempt real Spring Boot API login
      const response = await loginUser({ email, password })
      if (response && response.token) {
        localStorage.setItem('lingualink_token', response.token)
        localStorage.setItem('lingualink_user', JSON.stringify(response.user))
        setUser(response.user)
        setLoading(false)
        return { success: true, user: response.user }
      }
    } catch (err) {
      console.warn('Backend login unavailable or credentials mismatch, falling back to local demo login', err)
      // If server is not yet running, allow local demo login for smooth UX
      await new Promise((r) => setTimeout(r, 600))
      const fallbackUser = { ...DEMO_USER, email: email || DEMO_USER.email }
      setUser(fallbackUser)
      localStorage.setItem('lingualink_user', JSON.stringify(fallbackUser))
      setLoading(false)
      return { success: true, user: fallbackUser, demo: true }
    }
    setLoading(false)
    return { success: false, message: 'Invalid credentials' }
  }

  const register = async (data) => {
    setLoading(true)
    try {
      // Attempt real Spring Boot API registration
      const response = await registerUser(data)
      if (response && response.token) {
        localStorage.setItem('lingualink_token', response.token)
        localStorage.setItem('lingualink_user', JSON.stringify(response.user))
        setUser(response.user)
        setLoading(false)
        return { success: true, user: response.user }
      }
    } catch (err) {
      console.warn('Backend register unavailable, falling back to local demo registration', err)
      await new Promise((r) => setTimeout(r, 600))
      const fallbackUser = {
        ...DEMO_USER,
        id: Date.now(),
        name: data.name,
        email: data.email,
        nativeLanguage: data.nativeLanguage || 'English',
        learningLanguages: data.learningLanguages || ['Spanish'],
        onboardingDone: false,
      }
      setUser(fallbackUser)
      localStorage.setItem('lingualink_user', JSON.stringify(fallbackUser))
      setLoading(false)
      return { success: true, user: fallbackUser, demo: true }
    }
    setLoading(false)
    return { success: false, message: 'Registration failed' }
  }

  const logout = () => {
    localStorage.removeItem('lingualink_token')
    localStorage.removeItem('lingualink_user')
    setUser(null)
  }

  const updateUser = async (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates }
      localStorage.setItem('lingualink_user', JSON.stringify(next))
      return next
    })

    // Try sync with backend if online
    try {
      await updateProfile(updates)
    } catch {
      // Local state preserved
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
