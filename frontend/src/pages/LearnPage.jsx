import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './LearnPage.css'

const WORD_BANK = ['einen', 'Kaffee', 'bitte', 'Tee', 'haben', 'Ich', 'möchte', 'ein']

const VOCAB_HINTS = {
  'I': 'Ich (pronoun)',
  'would like': 'möchte (verb from möchten)',
  'coffee': 'Kaffee (der Kaffee, masculine noun)',
  'please': 'bitte (adverb / polite particle)',
}

export default function LearnPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  // Learning states
  const [selectedWords, setSelectedWords] = useState(['Ich', 'möchte'])
  const [availableWords, setAvailableWords] = useState(
    WORD_BANK.filter(w => !['Ich', 'möchte'].includes(w))
  )
  const [checked, setChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hintWord, setHintWord] = useState(null)
  const [activeStep, setActiveStep] = useState(3)

  // Speech synthesis for pronunciation
  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text || 'Ich möchte einen Kaffee bitte')
      utterance.lang = 'de-DE'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
      addToast('Playing German pronunciation 🔊', 'info')
    } else {
      addToast('Audio preview not supported in this browser', 'info')
    }
  }

  const addWord = (w) => {
    setSelectedWords(prev => [...prev, w])
    setAvailableWords(prev => prev.filter(item => item !== w))
    setChecked(false)
  }

  const removeWord = (w) => {
    setSelectedWords(prev => prev.filter(item => item !== w))
    setAvailableWords(prev => [...prev, w])
    setChecked(false)
  }

  const handleCheck = () => {
    const constructed = selectedWords.join(' ')
    // Accept valid variations
    const valid = constructed.toLowerCase().startsWith('ich möchte einen kaffee')
    setIsCorrect(valid)
    setChecked(true)
    if (valid) {
      addToast('Ausgezeichnet! +25 XP earned 🎉', 'success')
      setActiveStep(4)
    } else {
      addToast('Almost there! Check the word order.', 'error')
    }
  }

  const jumpToPartnerChat = () => {
    navigate('/chat', {
      state: {
        partnerId: 4, // Sofia / Lukas German partner
        initialPrompt: 'Guten Morgen! Wie war dein Tag?',
      },
    })
  }

  return (
    <div className="learn-page">
      {/* Top Banner & Stats */}
      <div className="learn-header-card">
        <div className="learn-header-left">
          <div className="learn-flag-badge">
            <span className="flag-icon">🇩🇪</span>
            <span className="lang-title">German for English Speakers</span>
          </div>
          <h1 className="display-sm mt-4">Daily Learning Path</h1>
          <p className="body-sm text-secondary">
            Unit 1: Greetings, Ordering & Small Talk
          </p>
        </div>

        <div className="learn-header-stats">
          <div className="learn-stat-item">
            <span className="stat-label">🔥 STREAK</span>
            <span className="stat-value" style={{ color: 'var(--gold)' }}>
              {user?.streak || 12} days
            </span>
          </div>
          <div className="learn-stat-item">
            <span className="stat-label">⏱️ TODAY</span>
            <span className="stat-value">8 / 15 min</span>
          </div>
          <div className="learn-stat-item">
            <span className="stat-label">⚡ XP</span>
            <span className="stat-value" style={{ color: 'var(--brand-secondary)' }}>
              {user?.xp?.toLocaleString() || '2,450'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Path on Left, Interactive Lesson on Right */}
      <div className="learn-grid mt-24">
        {/* Left Column: Vertical Stepper Path */}
        <div className="learn-path-card card">
          <h2 className="heading-sm mb-16">Unit 1 Progression</h2>

          <div className="stepper-track">
            {/* Step 1 */}
            <div className="step-node-row">
              <div className="step-node step-completed">✓</div>
              <div className="step-content">
                <div className="step-title">1. Essential Greetings</div>
                <div className="caption text-muted">Hallo, Guten Morgen, Auf Wiedersehen</div>
              </div>
            </div>
            <div className="step-line step-line-done" />

            {/* Step 2 */}
            <div className="step-node-row">
              <div className="step-node step-completed">✓</div>
              <div className="step-content">
                <div className="step-title">2. Numbers & Politeness</div>
                <div className="caption text-muted">Bitte, Danke, Eins bis Zehn</div>
              </div>
            </div>
            <div className="step-line step-line-done" />

            {/* Step 3 (Current) */}
            <div className="step-node-row">
              <div className="step-node step-current">3</div>
              <div className="step-content">
                <div className="step-title" style={{ color: 'var(--gold)', fontWeight: 700 }}>
                  3. Ordering at a Café (Active)
                </div>
                <div className="caption text-secondary">Translate sentence & say it out loud</div>
              </div>
            </div>
            <div className="step-line" />

            {/* Step 4 (Locked / Next) */}
            <div className="step-node-row">
              <div className={`step-node ${activeStep >= 4 ? 'step-completed' : 'step-locked'}`}>
                {activeStep >= 4 ? '✓' : '4'}
              </div>
              <div className="step-content">
                <div className="step-title">4. Small Talk with Partners</div>
                <div className="caption text-muted">Ask questions about hobbies and weekends</div>
              </div>
            </div>
          </div>

          {/* 1-Tap Lesson to Partner Link */}
          <div className="partner-callout-card mt-24">
            <div className="partner-callout-top">
              <div className="callout-avatar">L</div>
              <div>
                <div className="callout-heading">Try it with Lukas</div>
                <div className="caption text-secondary">Native German · Berlin</div>
              </div>
            </div>
            <p className="callout-prompt mt-8">
              "Ask <strong>'Wie war dein Tag?'</strong> to start real practice today."
            </p>
            <button className="btn btn-gold btn-full btn-sm mt-12" onClick={jumpToPartnerChat}>
              Say it to Lukas in Chat →
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Lesson Exercise */}
        <div className="learn-exercise-card card">
          <div className="exercise-header">
            <span className="exercise-badge">Exercise 3 of 5</span>
            <span className="exercise-type">Translate to German</span>
          </div>

          {/* English Prompt with Tap-to-Reveal Hints */}
          <div className="exercise-prompt-box mt-16">
            <div className="prompt-label">Translate this sentence:</div>
            <div className="prompt-phrase">
              {['I', 'would like', 'a', 'coffee,', 'please.'].map((word, i) => {
                const cleanWord = word.replace(/[,.]/g, '')
                const hint = VOCAB_HINTS[cleanWord]
                return (
                  <span
                    key={i}
                    className={`prompt-word ${hint ? 'has-hint' : ''}`}
                    onClick={() => setHintWord(hintWord === cleanWord ? null : cleanWord)}
                  >
                    {word}{' '}
                  </span>
                )
              })}
            </div>
            <div className="caption text-muted mt-6">
              💡 Tap any underlined word for its grammar hint
            </div>
            {hintWord && (
              <div className="hint-tooltip-banner mt-8">
                <strong>{hintWord}:</strong> {VOCAB_HINTS[hintWord]}
              </div>
            )}
          </div>

          {/* Built Sentence Workspace */}
          <div className="sentence-workspace-box mt-20">
            <div className="workspace-label">Your German sentence:</div>
            <div className="workspace-slots">
              {selectedWords.length === 0 ? (
                <span className="placeholder-text">Tap words from the bank below to build your answer…</span>
              ) : (
                selectedWords.map((w, idx) => (
                  <button
                    key={idx}
                    className="word-chip word-chip-selected"
                    onClick={() => removeWord(w)}
                    title="Tap to remove"
                  >
                    {w} ✕
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available Word Bank */}
          <div className="word-bank-container mt-20">
            <div className="word-bank-label">Word Bank:</div>
            <div className="word-bank-chips mt-8">
              {availableWords.map((w, idx) => (
                <button
                  key={idx}
                  className="word-chip word-chip-available"
                  onClick={() => addWord(w)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Result Feedback Banner */}
          {checked && (
            <div className={`exercise-feedback-banner mt-20 ${isCorrect ? 'fb-correct' : 'fb-wrong'}`}>
              <div className="fb-icon">{isCorrect ? '🎉' : '⚠️'}</div>
              <div>
                <div className="fb-title">
                  {isCorrect ? 'Ausgezeichnet! Perfect translation.' : 'Not quite. Try again!'}
                </div>
                <div className="fb-sub">
                  Correct German: <em>"Ich möchte einen Kaffee, bitte."</em>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="exercise-actions-row mt-24">
            <button
              className="btn btn-outline flex items-center gap-6"
              onClick={() => handleSpeak(selectedWords.join(' '))}
            >
              <span>🔊</span> Say it out loud
            </button>

            <button
              className={`btn btn-lg ${isCorrect ? 'btn-success' : 'btn-gold'}`}
              style={{ minWidth: 160 }}
              onClick={handleCheck}
            >
              {isCorrect ? 'Continue →' : 'Check Answer ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
