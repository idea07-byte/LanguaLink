/* ============================================================
   OnboardingPage — Dynamic Language Selection from PostgreSQL
   ============================================================ */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { fetchLanguages } from '../api/languages'
import { updateProfile } from '../api/auth'
import BrandLogo from '../components/BrandLogo'
import './OnboardingPage.css'

const PROFICIENCY_LEVELS = [
  { id: 'Beginner', label: 'Beginner (A1)', desc: 'Just starting out, knows basics' },
  { id: 'Elementary', label: 'Elementary (A2)', desc: 'Can handle simple everyday phrases' },
  { id: 'Intermediate', label: 'Intermediate (B1)', desc: 'Can have casual conversations' },
  { id: 'Upper-Intermediate', label: 'Upper-Intermediate (B2)', desc: 'Speaks fluently on various topics' },
  { id: 'Advanced', label: 'Advanced (C1)', desc: 'Near native proficiency and nuance' },
  { id: 'Mastery', label: 'Mastery / Fluent (C2)', desc: 'Complete mastery of the language' },
]

const INTEREST_CHOICES = [
  'Movies 🎬', 'Music 🎵', 'Travel ✈️', 'Technology 💻',
  'Food & Cooking 🍳', 'Sports ⚽', 'Anime 🎌', 'Literature 📚',
  'Gaming 🎮', 'Photography 📸', 'Art & Design 🎨', 'Science 🔬'
]

export default function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [languages, setLanguages] = useState([])
  const [loadingLangs, setLoadingLangs] = useState(true)

  const [form, setForm] = useState({
    nativeLanguage: user?.nativeLanguage || '',
    learningLanguage: user?.learningLanguages?.[0] || '',
    level: user?.level || 'Intermediate',
    interests: user?.interests || ['Technology 💻', 'Music 🎵', 'Travel ✈️'],
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Fetch languages dynamically from PostgreSQL via Spring Boot API: GET /api/languages
  useEffect(() => {
    async function loadLanguages() {
      try {
        setLoadingLangs(true)
        const list = await fetchLanguages()
        setLanguages(list)
        // Default suggestions if empty
        if (!form.nativeLanguage && list.length > 0) {
          const defaultNative = list.find(l => l.name === 'Tamil') || list[0]
          const defaultLearn = list.find(l => l.name === 'English') || list[1] || list[0]
          setForm(prev => ({
            ...prev,
            nativeLanguage: prev.nativeLanguage || defaultNative.name,
            learningLanguage: prev.learningLanguage || defaultLearn.name,
          }))
        }
      } catch (err) {
        console.error('Failed to load languages from database:', err)
      } finally {
        setLoadingLangs(false)
      }
    }
    loadLanguages()
  }, [])

  const toggleInterest = (item) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter(i => i !== item)
        : [...prev.interests, item]
    }))
  }

  const validate = () => {
    const e = {}
    if (!form.nativeLanguage) e.nativeLanguage = 'Please choose your native language'
    if (!form.learningLanguage) e.learningLanguage = 'Please select a language you want to learn'
    if (form.nativeLanguage === form.learningLanguage) {
      e.learningLanguage = 'Target language must be different from native language'
    }
    if (!form.level) e.level = 'Please specify your current proficiency level'
    if (form.interests.length === 0) e.interests = 'Please pick at least one topic of interest'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      // 1. Update backend profile via PUT /api/profile
      await updateProfile({
        nativeLanguage: form.nativeLanguage,
        learningLanguages: [form.learningLanguage],
        bio: `Native ${form.nativeLanguage} speaker practicing ${form.learningLanguage}. Interested in ${form.interests.slice(0, 3).join(', ')}.`,
      })

      // 2. Update local context state
      updateUser({
        ...user,
        nativeLanguage: form.nativeLanguage,
        learningLanguages: [form.learningLanguage],
        level: form.level,
        interests: form.interests,
        onboardingDone: true,
      })

      addToast('Profile setup complete! Welcome to LinguaLink 🌍', 'success')
      navigate('/dashboard')
    } catch (err) {
      // Even if backend fails, optimistic update ensures learner gets into app
      updateUser({
        ...user,
        nativeLanguage: form.nativeLanguage,
        learningLanguages: [form.learningLanguage],
        level: form.level,
        interests: form.interests,
        onboardingDone: true,
      })
      addToast('Profile updated locally! Enjoy LinguaLink 🎉', 'info')
      navigate('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedNativeObj = languages.find(l => l.name === form.nativeLanguage)
  const selectedLearnObj = languages.find(l => l.name === form.learningLanguage)

  return (
    <div className="onboarding-page-bg">
      {/* Decorative ambient gradients */}
      <div className="onboarding-ambient-glow glow-1" />
      <div className="onboarding-ambient-glow glow-2" />

      <div className="onboarding-container-card">
        {/* Top Logo */}
        <div className="onboarding-logo-center">
          <BrandLogo size="md" showTagline={true} />
        </div>

        {/* Card Header */}
        <div className="onboarding-header-area">
          <span className="onboarding-badge-pill">
            <span>🌍</span> Language Selection & Profile Setup
          </span>
          <h1 className="onboarding-title">Let’s Find Your Ideal Language Partner</h1>
          <p className="onboarding-subtitle">
            Tell us which languages you speak, what you want to master, and what you enjoy discussing.
          </p>
        </div>

        {/* Main Onboarding Form */}
        <form onSubmit={handleSubmit} noValidate className="onboarding-form">
          {/* Section 1: Native Language Selection */}
          <div className="onboarding-field-group">
            <label className="onboarding-label" htmlFor="native-language-select">
              <span className="label-icon">🗣️</span> What is your native language?
            </label>
            <div className="custom-select-wrapper">
              <select
                id="native-language-select"
                className={`onboarding-select ${errors.nativeLanguage ? 'input-error' : ''}`}
                value={form.nativeLanguage}
                onChange={e => {
                  setForm(prev => ({ ...prev, nativeLanguage: e.target.value }))
                  if (errors.nativeLanguage) setErrors(prev => ({ ...prev, nativeLanguage: '' }))
                }}
                disabled={loadingLangs}
              >
                <option value="">[ Select your native language ▼ ]</option>
                {languages.map(l => (
                  <option key={l.code || l.id} value={l.name}>
                    {l.flag ? `${l.flag} ` : ''}{l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>
            {errors.nativeLanguage && (
              <span className="field-error-msg">{errors.nativeLanguage}</span>
            )}
          </div>

          {/* Section 2: Target Learning Language Selection */}
          <div className="onboarding-field-group mt-20">
            <label className="onboarding-label" htmlFor="learning-language-select">
              <span className="label-icon">🎯</span> Which language do you want to learn?
            </label>
            <div className="custom-select-wrapper">
              <select
                id="learning-language-select"
                className={`onboarding-select ${errors.learningLanguage ? 'input-error' : ''}`}
                value={form.learningLanguage}
                onChange={e => {
                  setForm(prev => ({ ...prev, learningLanguage: e.target.value }))
                  if (errors.learningLanguage) setErrors(prev => ({ ...prev, learningLanguage: '' }))
                }}
                disabled={loadingLangs}
              >
                <option value="">[ Select a language ▼ ]</option>
                {languages
                  .filter(l => l.name !== form.nativeLanguage)
                  .map(l => (
                    <option key={l.code || l.id} value={l.name}>
                      {l.flag ? `${l.flag} ` : ''}{l.name} ({l.code})
                    </option>
                  ))}
              </select>
            </div>
            {errors.learningLanguage && (
              <span className="field-error-msg">{errors.learningLanguage}</span>
            )}
          </div>

          {/* Dynamic Language Swap Preview Banner */}
          {form.nativeLanguage && form.learningLanguage && (
            <div className="language-swap-preview-card mt-16">
              <div className="swap-preview-col native-col">
                <span className="swap-preview-tag">You teach</span>
                <span className="swap-preview-val">
                  {selectedNativeObj?.flag} {form.nativeLanguage}
                </span>
              </div>
              <div className="swap-preview-arrows">⇄</div>
              <div className="swap-preview-col learn-col">
                <span className="swap-preview-tag">You learn</span>
                <span className="swap-preview-val">
                  {selectedLearnObj?.flag} {form.learningLanguage}
                </span>
              </div>
            </div>
          )}

          {/* Section 3: Proficiency Level */}
          <div className="onboarding-field-group mt-24">
            <label className="onboarding-label" htmlFor="proficiency-level-select">
              <span className="label-icon">📊</span> Your current level in {form.learningLanguage || 'your target language'}
            </label>
            <div className="custom-select-wrapper">
              <select
                id="proficiency-level-select"
                className={`onboarding-select ${errors.level ? 'input-error' : ''}`}
                value={form.level}
                onChange={e => setForm(prev => ({ ...prev, level: e.target.value }))}
              >
                {PROFICIENCY_LEVELS.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label} — {lvl.desc}
                  </option>
                ))}
              </select>
            </div>
            {errors.level && <span className="field-error-msg">{errors.level}</span>}
          </div>

          {/* Section 4: Your Interests */}
          <div className="onboarding-field-group mt-24">
            <label className="onboarding-label">
              <span className="label-icon">✨</span> Your interests (pick topics you love discussing)
            </label>
            <div className="interests-pill-cloud mt-10">
              {INTEREST_CHOICES.map(item => {
                const selected = form.interests.includes(item)
                return (
                  <button
                    type="button"
                    key={item}
                    className={`interest-select-pill ${selected ? 'pill-selected' : ''}`}
                    onClick={() => toggleInterest(item)}
                  >
                    <span>{item}</span>
                    {selected && <span className="pill-check-icon">✓</span>}
                  </button>
                )
              })}
            </div>
            {errors.interests && <span className="field-error-msg">{errors.interests}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="onboarding-continue-btn"
            className="btn btn-primary btn-full btn-lg mt-32"
            disabled={submitting}
          >
            {submitting ? 'Saving Profile…' : 'Continue to Dashboard →'}
          </button>
        </form>

        {/* Database Attribution Microcopy */}
        <p className="onboarding-db-note">
          ⚡ Language list loaded dynamically from PostgreSQL (<code>languages</code> table) via Spring Boot REST API.
        </p>
      </div>
    </div>
  )
}
