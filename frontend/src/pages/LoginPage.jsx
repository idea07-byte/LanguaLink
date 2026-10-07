import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

export default function LoginPage() {
  const { login, loading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email)    e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await login(form.email, form.password)
    if (result.success) {
      addToast('Welcome back! 🎉', 'success')
      navigate('/dashboard')
    } else {
      addToast('Invalid credentials', 'error')
    }
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // Demo quick login
  const demoLogin = async () => {
    setForm({ email: 'alex@example.com', password: 'demo1234' })
    const result = await login('alex@example.com', 'demo1234')
    if (result.success) {
      addToast('Demo login successful! 🚀', 'success')
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-page">
      <h1 className="display-md">Welcome back</h1>
      <p className="body-sm text-secondary mt-8 mb-32">
        Sign in to continue your language journey
      </p>

      <button
        className="btn btn-outline btn-full demo-btn"
        onClick={demoLogin}
        id="demo-login-btn"
        type="button"
      >
        <span>⚡</span> Quick Demo Login
      </button>

      <div className="divider-text mt-24 mb-24">or sign in with email</div>

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        <div className="form-group">
          <label className="form-label">Email address</label>
          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange('email')}
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group mt-16">
          <div className="flex justify-between">
            <label className="form-label">Password</label>
            <a href="#" className="caption" style={{ color: 'var(--brand-primary-light)' }}>Forgot password?</a>
          </div>
          <div className="input-group input-group-right">
            <span className="input-icon">🔒</span>
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange('password')}
              autoComplete="current-password"
            />
            <span className="input-icon-right" onClick={() => setShowPass(!showPass)}>
              {showPass ? '🙈' : '👁️'}
            </span>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <button
          id="login-submit"
          type="submit"
          className="btn btn-primary btn-full btn-lg mt-24"
          disabled={loading}
        >
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} />  Signing in…</> : 'Sign In →'}
        </button>
      </form>

      <p className="text-center body-sm text-secondary mt-24">
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--brand-primary-light)', fontWeight: 600 }}>
          Create one free
        </Link>
      </p>

      {/* Social logins placeholder */}
      <div className="divider-text mt-24 mb-16">or continue with</div>
      <div className="social-buttons">
        <button className="btn btn-outline social-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Google
        </button>
        <button className="btn btn-outline social-btn" type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>
      </div>
    </div>
  )
}
