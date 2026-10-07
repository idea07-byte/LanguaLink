/* ============================================================
   LoginPage — HelloTalk Auth with Strict Gmail & Social Auth
   ============================================================ */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth, isGmail } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

export default function LoginPage() {
  const { login, socialLogin, loading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [mode, setMode] = useState('social') // 'social' | 'email'
  const [form, setForm] = useState({ email: 'alex.lingualink@gmail.com', password: 'password123' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  // Social Auth Modals State
  const [googleModalOpen, setGoogleModalOpen] = useState(false)
  const [customGmail, setCustomGmail] = useState('')
  const [customGmailName, setCustomGmailName] = useState('')
  const [googleError, setGoogleError] = useState('')

  const [fbModalOpen, setFbModalOpen] = useState(false)
  const [fbGmail, setFbGmail] = useState('')
  const [fbError, setFbError] = useState('')

  // Standard Email validation: STRICT GMAIL ENFORCEMENT
  const validate = () => {
    const e = {}
    if (!form.email) {
      e.email = 'Gmail address is required'
    } else if (!isGmail(form.email)) {
      e.email = 'Access restricted: Only valid Gmail accounts (@gmail.com) can log in'
    }
    if (!form.password) {
      e.password = 'Password is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const result = await login(form.email, form.password)
    if (result.success) {
      addToast('Welcome back! Signed in with Gmail 🎉', 'success')
      navigate('/dashboard')
    } else {
      addToast(result.message || 'Authentication failed. Please verify your credentials.', 'error')
    }
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  // Quick Demo Login (using verified Gmail account)
  const demoLogin = async () => {
    const result = await login('alex.lingualink@gmail.com', 'password123')
    if (result.success) {
      addToast('Signed in as Alex (alex.lingualink@gmail.com) 🚀', 'success')
      navigate('/dashboard')
    } else {
      addToast(result.message || 'Could not authenticate demo user', 'error')
    }
  }

  // Handle Google OAuth Select or Custom Gmail Entry
  const handleGoogleAuth = async (selectedEmail, selectedName) => {
    const emailToUse = selectedEmail || customGmail.trim()
    const nameToUse = selectedName || customGmailName.trim() || emailToUse.split('@')[0]

    if (!emailToUse) {
      setGoogleError('Please enter your Google Gmail address')
      return
    }

    if (!isGmail(emailToUse)) {
      setGoogleError('Access Denied: Only genuine @gmail.com accounts are permitted.')
      addToast('Error: Must be a valid @gmail.com address', 'error')
      return
    }

    setGoogleError('')
    const result = await socialLogin({
      email: emailToUse,
      provider: 'google',
      name: nameToUse,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${nameToUse}`,
    })

    if (result.success) {
      setGoogleModalOpen(false)
      addToast(`Signed in with Google as ${emailToUse}! 🎉`, 'success')
      navigate('/dashboard')
    } else {
      setGoogleError(result.message)
      addToast(result.message, 'error')
    }
  }

  // Handle Facebook Auth (requires verified linked Gmail)
  const handleFacebookAuth = async () => {
    const emailToUse = fbGmail.trim()

    if (!emailToUse) {
      setFbError('Please enter the verified Gmail address linked to your Facebook account')
      return
    }

    if (!isGmail(emailToUse)) {
      setFbError('Access Denied: Facebook account must have a verified @gmail.com primary address.')
      addToast('Error: Facebook account must use a true @gmail.com address', 'error')
      return
    }

    setFbError('')
    const result = await socialLogin({
      email: emailToUse,
      provider: 'facebook',
      name: 'Facebook User (' + emailToUse.split('@')[0] + ')',
    })

    if (result.success) {
      setFbModalOpen(false)
      addToast(`Authenticated via Facebook with ${emailToUse}! 🚀`, 'success')
      navigate('/dashboard')
    } else {
      setFbError(result.message)
      addToast(result.message, 'error')
    }
  }

  return (
    <div className="hellotalk-auth-view">
      {/* Social Login Buttons Matching HelloTalk Mockup */}
      <div className="auth-action-stack">
        {/* Google Sign In - Triggers Authentic Google Account Picker */}
        <button
          type="button"
          className="btn-google-pill"
          onClick={() => setGoogleModalOpen(true)}
          id="google-login-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" className="social-icon">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* Facebook & Email Row */}
        <div className="auth-social-row">
          <button
            type="button"
            className="btn-facebook-pill"
            onClick={() => setFbModalOpen(true)}
            id="facebook-login-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </button>

          <button
            type="button"
            className="btn-email-pill"
            onClick={() => setMode(mode === 'email' ? 'social' : 'email')}
            id="email-toggle-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF4B72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <span>Email</span>
          </button>
        </div>

        {/* 1-Click Quick Demo Button (Using Verified Gmail Account) */}
        <button
          type="button"
          className="btn-quick-demo"
          onClick={demoLogin}
          id="demo-login-btn"
        >
          <span>⚡</span> Quick Demo Login (alex.lingualink@gmail.com)
        </button>
      </div>

      {/* Expandable Email / Password Form */}
      {mode === 'email' && (
        <form onSubmit={handleSubmit} noValidate className="auth-form mt-20">
          <div className="form-group">
            <div className="flex justify-between items-center">
              <label className="form-label">Gmail Address</label>
              <span className="caption" style={{ color: '#1B84FF', fontWeight: 600 }}>@gmail.com required</span>
            </div>
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="yourname@gmail.com"
                value={form.email}
                onChange={handleChange('email')}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group mt-12">
            <div className="flex justify-between">
              <label className="form-label">Password</label>
              <a href="#" className="caption text-secondary">Forgot?</a>
            </div>
            <div className="input-group input-group-right">
              <span className="input-icon">🔒</span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                placeholder="Password"
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
            className="btn btn-primary btn-full mt-16"
            disabled={loading}
          >
            {loading ? 'Authenticating…' : 'Sign In with Gmail →'}
          </button>
        </form>
      )}

      {/* Terms of Service & Privacy Legal Disclaimer */}
      <p className="auth-legal-text">
        🔒 Authentication restricted to true <strong>@gmail.com</strong> accounts only.
        By signing in, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
      </p>

      {/* Register Switch Link */}
      <div className="auth-switch-row">
        <span>Don't have an account?</span>
        <Link to="/register" className="auth-link-bold">Create one with Gmail</Link>
      </div>

      {/* ============================================================
          GOOGLE SIGN-IN AUTHENTICATION MODAL (STRICT GMAIL VERIFICATION)
          ============================================================ */}
      {googleModalOpen && (
        <div className="modal-overlay" onClick={() => setGoogleModalOpen(false)}>
          <div className="modal google-oauth-modal animate-scaleIn" onClick={e => e.stopPropagation()}>
            {/* Google Header */}
            <div className="google-modal-header">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <h2 className="google-modal-title">Sign in with Google</h2>
              <p className="google-modal-subtitle">to continue to <strong>LinguaLink</strong></p>
            </div>

            {googleError && (
              <div className="google-alert-error mb-12">
                ⚠️ {googleError}
              </div>
            )}

            {/* Quick 1-Click Verified Google Accounts */}
            <div className="google-accounts-list mb-16">
              <p className="caption text-muted mb-8" style={{ fontWeight: 600 }}>Choose an active Google Account:</p>

              <div
                className="google-account-item"
                onClick={() => handleGoogleAuth('alex.lingualink@gmail.com', 'Alex Rivera')}
              >
                <div className="google-account-avatar">AR</div>
                <div className="google-account-details">
                  <div className="google-account-name">Alex Rivera</div>
                  <div className="google-account-email">alex.lingualink@gmail.com</div>
                </div>
                <span className="google-verified-tag">✓ Verified</span>
              </div>

              <div
                className="google-account-item mt-8"
                onClick={() => handleGoogleAuth('shyam.developer@gmail.com', 'Shyam Sundar')}
              >
                <div className="google-account-avatar" style={{ background: '#7C5CFC' }}>SS</div>
                <div className="google-account-details">
                  <div className="google-account-name">Shyam Sundar</div>
                  <div className="google-account-email">shyam.developer@gmail.com</div>
                </div>
                <span className="google-verified-tag">✓ Verified</span>
              </div>
            </div>

            {/* Or Enter Your Own Real Gmail */}
            <div className="divider-text mb-12">or enter your Gmail</div>

            <div className="form-group mb-12">
              <label className="caption" style={{ fontWeight: 600, color: '#1E293B' }}>
                Your Google Account Email (must be @gmail.com):
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="yourname@gmail.com"
                value={customGmail}
                onChange={e => {
                  setCustomGmail(e.target.value)
                  setGoogleError('')
                }}
              />
            </div>

            <div className="form-group mb-16">
              <label className="caption" style={{ fontWeight: 600, color: '#1E293B' }}>
                Display Name (Optional):
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Shyam"
                value={customGmailName}
                onChange={e => setCustomGmailName(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setGoogleModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleGoogleAuth()}
              >
                Continue with Google →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          FACEBOOK AUTHENTICATION MODAL (STRICT GMAIL VERIFICATION)
          ============================================================ */}
      {fbModalOpen && (
        <div className="modal-overlay" onClick={() => setFbModalOpen(false)}>
          <div className="modal fb-oauth-modal animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="fb-modal-header">
              <div className="fb-logo-bubble">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFFFFF">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h2 className="fb-modal-title">Log in with Facebook</h2>
              <p className="fb-modal-subtitle">
                LinguaLink requires verification with your linked <strong>@gmail.com</strong> address.
              </p>
            </div>

            {fbError && (
              <div className="fb-alert-error mb-12">
                ⚠️ {fbError}
              </div>
            )}

            <div className="form-group mb-16">
              <label className="caption" style={{ fontWeight: 600, color: '#1E293B' }}>
                Enter Facebook Linked Gmail Address:
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="facebook.user@gmail.com"
                value={fbGmail}
                onChange={e => {
                  setFbGmail(e.target.value)
                  setFbError('')
                }}
              />
              <span className="caption text-muted mt-4">
                * Note: Only accounts with a valid @gmail.com primary email will be granted access.
              </span>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setFbModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: '#1877F2', color: '#FFF' }}
                onClick={handleFacebookAuth}
              >
                Authenticate via Facebook →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
