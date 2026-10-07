import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPages.css'

const LANGUAGES = ['English','Spanish','French','German','Japanese','Korean','Mandarin','Italian','Portuguese','Arabic','Hindi','Russian']

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    nativeLanguage: '', learningLanguage: '', agreeTerms: false
  })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim())       e.name    = 'Full name is required'
    if (!form.email)             e.email   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password)          e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.nativeLanguage)    e.nativeLanguage   = 'Select your native language'
    if (!form.learningLanguage)  e.learningLanguage = 'Select a language to learn'
    if (!form.agreeTerms)        e.agreeTerms       = 'You must agree to the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    const result = await register({
      name: form.name,
      email: form.email,
      nativeLanguage: form.nativeLanguage,
      learningLanguages: [form.learningLanguage],
    })
    if (result.success) {
      addToast('Account created! Let\'s get you set up 🚀', 'success')
      navigate('/onboarding')
    } else {
      addToast('Registration failed. Please try again.', 'error')
    }
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'var(--brand-danger)', 'var(--brand-warning)', 'var(--brand-secondary)', 'var(--brand-success)'][strength]

  return (
    <div className="auth-page">
      <h1 className="display-md">Create account</h1>
      <p className="body-sm text-secondary mt-8 mb-28">
        Join 50,000+ learners. Free forever.
      </p>

      <form onSubmit={handleSubmit} noValidate className="auth-form">
        {/* Name */}
        <div className="form-group">
          <label className="form-label">Full name</label>
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input id="reg-name" type="text" className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Alex Rivera" value={form.name} onChange={handleChange('name')} />
          </div>
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="form-group mt-14">
          <label className="form-label">Email address</label>
          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input id="reg-email" type="email" className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com" value={form.email} onChange={handleChange('email')} />
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* Languages */}
        <div className="grid-2 mt-14">
          <div className="form-group">
            <label className="form-label">Native language</label>
            <select id="reg-native" className={`form-input ${errors.nativeLanguage ? 'input-error' : ''}`}
              value={form.nativeLanguage} onChange={handleChange('nativeLanguage')} style={{ cursor: 'pointer' }}>
              <option value="">Select…</option>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.nativeLanguage && <span className="form-error">{errors.nativeLanguage}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Learning language</label>
            <select id="reg-learning" className={`form-input ${errors.learningLanguage ? 'input-error' : ''}`}
              value={form.learningLanguage} onChange={handleChange('learningLanguage')} style={{ cursor: 'pointer' }}>
              <option value="">Select…</option>
              {LANGUAGES.filter(l => l !== form.nativeLanguage).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {errors.learningLanguage && <span className="form-error">{errors.learningLanguage}</span>}
          </div>
        </div>

        {/* Password */}
        <div className="form-group mt-14">
          <label className="form-label">Password</label>
          <div className="input-group input-group-right">
            <span className="input-icon">🔒</span>
            <input id="reg-password" type={showPass ? 'text' : 'password'} className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="At least 8 characters" value={form.password} onChange={handleChange('password')} />
            <span className="input-icon-right" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</span>
          </div>
          {form.password && (
            <div className="mt-8">
              <div className="password-strength-bar">
                {[1,2,3,4].map(i => (
                  <div key={i} className="strength-segment" style={{
                    background: i <= strength ? strengthColor : 'var(--bg-elevated)'
                  }} />
                ))}
              </div>
              <span className="caption" style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        {/* Confirm password */}
        <div className="form-group mt-14">
          <label className="form-label">Confirm password</label>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input id="reg-confirm" type="password" className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
          </div>
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>

        {/* Terms */}
        <label className="terms-check mt-14">
          <input type="checkbox" id="reg-terms" checked={form.agreeTerms} onChange={handleChange('agreeTerms')} />
          <span className="caption text-secondary">
            I agree to the <a href="#" style={{ color: 'var(--brand-primary-light)' }}>Terms of Service</a> and{' '}
            <a href="#" style={{ color: 'var(--brand-primary-light)' }}>Privacy Policy</a>
          </span>
        </label>
        {errors.agreeTerms && <span className="form-error">{errors.agreeTerms}</span>}

        <button id="reg-submit" type="submit" className="btn btn-primary btn-full btn-lg mt-24" disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</> : 'Create Free Account →'}
        </button>
      </form>

      <p className="text-center body-sm text-secondary mt-20">
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--brand-primary-light)', fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  )
}
