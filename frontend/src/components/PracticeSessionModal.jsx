import { useState, useEffect } from 'react'
import './PracticeSessionModal.css'

const TOPICS = [
  {
    title: 'Describe your perfect weekend',
    prompt: 'What do you love doing when you have completely free time?',
    useful: 'am Wochenende, ich würde gern…, normalerweise, in meiner Freizeit',
    usefulTrans: 'on the weekend, I would like to…, normally, in my free time',
  },
  {
    title: 'Favorite street food & local dishes',
    prompt: 'Tell your partner about a dish from your home city they must try.',
    useful: 'das schmeckt lecker, Zutaten, traditionelles Gericht, scharf oder süß',
    usefulTrans: 'that tastes delicious, ingredients, traditional dish, spicy or sweet',
  },
  {
    title: 'Travel dreams & memorable journeys',
    prompt: 'Where was the most unforgettable trip you have taken?',
    useful: 'ich bin nach… gereist, die Landschaft war wunderschön, unvergesslich',
    usefulTrans: 'I traveled to…, the landscape was beautiful, unforgettable',
  },
  {
    title: 'Daily habits & favorite times of day',
    prompt: 'Are you a morning person or a night owl? Walk through your morning routine.',
    useful: 'jeden Morgen, ich stehe um… auf, Kaffee trinken, Zeitplan',
    usefulTrans: 'every morning, I wake up at…, drink coffee, schedule',
  },
]

export default function PracticeSessionModal({ partner, onClose, onSaveVocab }) {
  const [topicIdx, setTopicIdx] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [activeLang, setActiveLang] = useState('German') // 'German' or 'English'
  
  // Timer states (in seconds)
  const [germanSeconds, setGermanSeconds] = useState(522) // 8m 42s
  const [englishSeconds, setEnglishSeconds] = useState(720) // 12m 00s
  const [isRunning, setIsRunning] = useState(true)
  const [sessionFinished, setSessionFinished] = useState(false)

  // Countdown timer
  useEffect(() => {
    if (!isRunning || sessionFinished) return
    const timer = setInterval(() => {
      if (activeLang === 'German') {
        setGermanSeconds(prev => (prev > 0 ? prev - 1 : 0))
      } else {
        setEnglishSeconds(prev => (prev > 0 ? prev - 1 : 0))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, activeLang, sessionFinished])

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const currentTopic = TOPICS[topicIdx]

  const nextTopic = () => {
    setTopicIdx((prev) => (prev + 1) % TOPICS.length)
  }

  const switchLanguage = () => {
    setActiveLang(prev => (prev === 'German' ? 'English' : 'German'))
  }

  const handleEnd = () => {
    setIsRunning(false)
    setSessionFinished(true)
  }

  return (
    <div className="call-modal-overlay">
      <div className="call-modal">
        {/* Header Status */}
        <div className="call-header">
          <div className="call-badge">
            <span className="live-dot" /> LIVE 50/50 PRACTICE
          </div>
          <span className="call-total-time">
            Total Session: {formatTime(1200 - (germanSeconds + englishSeconds > 1200 ? 0 : 1200 - (germanSeconds + englishSeconds)))}
          </span>
          <button className="call-close-btn" onClick={onClose} title="Close view">✕</button>
        </div>

        {/* Partner Info */}
        <div className="call-partner-info">
          <div className="call-avatar">{partner?.avatar || 'L'}</div>
          <div>
            <h2 className="call-partner-name">{partner?.name || 'Lukas'}</h2>
            <div className="call-sub-status">
              <span className="conn-dot" /> Connected · Berlin (CET)
            </div>
          </div>
        </div>

        {/* 50/50 Fair-Time Timer */}
        <div className="timer-split-container">
          <div className={`timer-box lang-learning-box ${activeLang === 'German' ? 'timer-box-active' : ''}`}>
            <div className="timer-box-top">
              <span className="timer-role-badge">
                {activeLang === 'German' ? '🗣️ Speaking now' : 'Next up'}
              </span>
              <span className="timer-lang-label">German (Lilac)</span>
            </div>
            <div className="timer-digits">{formatTime(germanSeconds)}</div>
            <div className="timer-caption">Target language practice</div>
          </div>

          <div className="timer-switch-col">
            <button className="btn-switch-turn" onClick={switchLanguage} title="Switch active language">
              ⇄ Switch Turn
            </button>
          </div>

          <div className={`timer-box lang-native-box ${activeLang === 'English' ? 'timer-box-active' : ''}`}>
            <div className="timer-box-top">
              <span className="timer-role-badge">
                {activeLang === 'English' ? '🗣️ Speaking now' : 'Next up'}
              </span>
              <span className="timer-lang-label">English (Mint)</span>
            </div>
            <div className="timer-digits">{formatTime(englishSeconds)}</div>
            <div className="timer-caption">Exchange partner practice</div>
          </div>
        </div>

        {/* Topic Card */}
        <div className="call-topic-card">
          <div className="topic-card-header">
            <span className="topic-badge">💡 Topic Card (Prevents Silence)</span>
            <button className="btn-next-topic" onClick={nextTopic}>
              🎲 Shuffle Topic
            </button>
          </div>
          <h3 className="topic-title">{currentTopic.title}</h3>
          <p className="topic-prompt">{currentTopic.prompt}</p>
          <div className="topic-useful-phrases">
            <span className="useful-label">Useful: </span>
            <span className="useful-text">{currentTopic.useful}</span>
          </div>
          <div className="useful-trans">({currentTopic.usefulTrans})</div>
        </div>

        {/* Animated Waveform */}
        <div className="call-waveform-row">
          <span className="wave-icon">🎙️</span>
          <div className="waveform-bars">
            {[40, 75, 50, 95, 60, 30, 85, 45, 70, 35, 90, 55, 65, 80, 40].map((h, i) => (
              <span
                key={i}
                className="wave-bar"
                style={{
                  height: isMuted ? '6px' : `${h}%`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
          <span className="wave-status">{isMuted ? 'Muted' : 'Speaking: Lukas'}</span>
        </div>

        {/* Notes scratchpad toggle */}
        {notesOpen && (
          <div className="call-notes-drawer">
            <div className="notes-header">
              <span>📝 Session Vocab & Corrections</span>
              <button className="btn-ghost btn-sm" onClick={() => setNotesOpen(false)}>✕</button>
            </div>
            <textarea
              className="notes-textarea"
              placeholder="Jot down new words or grammar notes to save to flashcards later…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            {noteText && (
              <button
                className="btn btn-sm btn-gold mt-6"
                onClick={() => {
                  if (onSaveVocab) onSaveVocab(noteText)
                  setNoteText('')
                  setNotesOpen(false)
                }}
              >
                + Save as Flashcard
              </button>
            )}
          </div>
        )}

        {/* Controls Footer */}
        <div className="call-controls-row">
          <button
            className={`ctrl-btn ${isMuted ? 'ctrl-btn-active' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
          >
            <span className="ctrl-icon">{isMuted ? '🔇' : '🎙️'}</span>
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            className={`ctrl-btn ${notesOpen ? 'ctrl-btn-active' : ''}`}
            onClick={() => setNotesOpen(!notesOpen)}
          >
            <span className="ctrl-icon">📝</span>
            <span>Notes</span>
          </button>

          <button
            className="ctrl-btn"
            onClick={() => setIsRunning(!isRunning)}
          >
            <span className="ctrl-icon">{isRunning ? '⏸️' : '▶️'}</span>
            <span>{isRunning ? 'Pause' : 'Resume'}</span>
          </button>

          <button className="ctrl-btn ctrl-btn-end" onClick={handleEnd}>
            <span className="ctrl-icon">📞</span>
            <span>End Call</span>
          </button>
        </div>

        {/* Session Finished Recap Modal */}
        {sessionFinished && (
          <div className="session-recap-overlay">
            <div className="session-recap-card">
              <div className="recap-badge">🎉 Practice Session Complete!</div>
              <h2 className="display-sm mt-8">Great exchange with {partner?.name || 'Lukas'}</h2>
              <p className="body-sm text-secondary mt-4">
                You practiced for 24 minutes and split the speaking time evenly!
              </p>

              <div className="recap-stats-grid mt-16">
                <div className="recap-stat">
                  <div className="recap-stat-val">24 min</div>
                  <div className="recap-stat-lbl">Time Spoken</div>
                </div>
                <div className="recap-stat">
                  <div className="recap-stat-val" style={{ color: 'var(--gold)' }}>🔥 13</div>
                  <div className="recap-stat-lbl">Streak Days</div>
                </div>
                <div className="recap-stat">
                  <div className="recap-stat-val" style={{ color: 'var(--brand-secondary)' }}>+120</div>
                  <div className="recap-stat-lbl">XP Earned</div>
                </div>
              </div>

              <div className="recap-actions mt-20">
                <button className="btn btn-gold btn-full btn-lg" onClick={onClose}>
                  Done & Back to Chat →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
