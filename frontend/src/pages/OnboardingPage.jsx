import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './OnboardingPage.css'

const LEVELS   = ['Complete Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'Native-like']
const GOALS    = ['Travel & Tourism', 'Business & Career', 'Make Friends', 'Media (TV/Music)', 'Academic Study', 'Heritage Language', 'Challenge Myself']
const SCHEDULE = ['15 min / day', '30 min / day', '1 hour / day', '2+ hours / day']
const INTERESTS= ['Music 🎵', 'Movies 🎬', 'Sports ⚽', 'Food & Cooking 🍳', 'Technology 💻', 'Travel ✈️', 'Art & Design 🎨', 'Literature 📚', 'Gaming 🎮', 'Photography 📸', 'Science 🔬', 'Fashion 👗']

const STEPS = [
  { id: 'level',     title: 'Your Level',      desc: 'How would you rate your current proficiency?' },
  { id: 'goals',     title: 'Learning Goals',  desc: 'What do you want to achieve? (pick all that apply)' },
  { id: 'schedule',  title: 'Daily Schedule',  desc: 'How much time can you dedicate each day?' },
  { id: 'interests', title: 'Your Interests',  desc: 'Choose topics you\'d love to discuss with partners.' },
]

export default function OnboardingPage() {
  const { updateUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    level: '', goals: [], schedule: '', interests: []
  })

  const current = STEPS[step]
  const progress = ((step) / STEPS.length) * 100

  const toggleArray = (field, value) => {
    setData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  const canProceed = () => {
    const s = STEPS[step]
    if (s.id === 'level')    return !!data.level
    if (s.id === 'goals')    return data.goals.length > 0
    if (s.id === 'schedule') return !!data.schedule
    if (s.id === 'interests')return data.interests.length > 0
    return true
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
    } else {
      // Complete onboarding
      updateUser({ ...data, onboardingDone: true })
      addToast('Profile set up! Welcome to LinguaLink 🌍', 'success')
      navigate('/dashboard')
    }
  }

  return (
    <div className="onboarding-layout">
      <div className="onboarding-glow onboarding-glow-1" />
      <div className="onboarding-glow onboarding-glow-2" />

      <div className="onboarding-container">
        {/* Progress */}
        <div className="onboarding-progress">
          <div className="flex justify-between caption text-muted mb-8">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(((step + 1) / STEPS.length) * 100)}% complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <div className="onboarding-step-dots">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`step-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}
                title={s.title}
              >
                {i < step ? '✓' : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="onboarding-card card animate-fadeInUp" key={step}>
          <div className="onboarding-card-header">
            <span className="onboarding-step-num">Step {step + 1}</span>
            <h2 className="display-md mt-8">{current.title}</h2>
            <p className="body-sm text-secondary mt-8">{current.desc}</p>
          </div>

          {/* Step content */}
          <div className="onboarding-options">
            {current.id === 'level' && (
              LEVELS.map(l => (
                <button
                  key={l}
                  className={`option-btn ${data.level === l ? 'option-selected' : ''}`}
                  onClick={() => setData(prev => ({ ...prev, level: l }))}
                >
                  {l}
                  {data.level === l && <span className="option-check">✓</span>}
                </button>
              ))
            )}
            {current.id === 'goals' && (
              GOALS.map(g => (
                <button
                  key={g}
                  className={`option-btn ${data.goals.includes(g) ? 'option-selected' : ''}`}
                  onClick={() => toggleArray('goals', g)}
                >
                  {g}
                  {data.goals.includes(g) && <span className="option-check">✓</span>}
                </button>
              ))
            )}
            {current.id === 'schedule' && (
              SCHEDULE.map(s => (
                <button
                  key={s}
                  className={`option-btn ${data.schedule === s ? 'option-selected' : ''}`}
                  onClick={() => setData(prev => ({ ...prev, schedule: s }))}
                >
                  ⏱️ {s}
                  {data.schedule === s && <span className="option-check">✓</span>}
                </button>
              ))
            )}
            {current.id === 'interests' && (
              <div className="interests-grid">
                {INTERESTS.map(i => (
                  <button
                    key={i}
                    className={`chip ${data.interests.includes(i) ? 'selected' : ''}`}
                    onClick={() => toggleArray('interests', i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="onboarding-nav">
            {step > 0 && (
              <button className="btn btn-outline" onClick={() => setStep(s => s - 1)}>
                ← Back
              </button>
            )}
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!canProceed()}
              style={{ marginLeft: 'auto' }}
              id={`onboarding-next-${step}`}
            >
              {step === STEPS.length - 1 ? '🚀 Start Learning!' : 'Continue →'}
            </button>
          </div>
        </div>

        {/* Skip */}
        <button
          className="btn btn-ghost btn-sm mt-16 text-muted"
          onClick={() => { updateUser({ onboardingDone: true }); navigate('/dashboard') }}
        >
          Skip setup for now
        </button>
      </div>
    </div>
  )
}
