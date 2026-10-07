import { useState, useEffect } from 'react'
import {
  getFlashcards,
  getDueFlashcards,
  getFlashcardStats,
  createFlashcard,
  reviewFlashcard,
  deleteFlashcard,
} from '../api/flashcards'
import './FlashcardsPage.css'

const DIFFICULTIES = [
  { label: 'Again', icon: '🔴', value: 'AGAIN', desc: 'Repeat card today' },
  { label: 'Hard',  icon: '🟠', value: 'HARD',  desc: 'Difficult recall' },
  { label: 'Good',  icon: '🟢', value: 'GOOD',  desc: 'Normal interval' },
  { label: 'Easy',  icon: '🔵', value: 'EASY',  desc: 'Fast interval (Mastered)' },
]

export default function FlashcardsPage() {
  const [view, setView] = useState('decks') // decks | review | create | done
  const [cards, setCards] = useState([])
  const [stats, setStats] = useState({ totalCards: 0, dueToday: 0, mastered: 0, learning: 0, retentionRate: 0 })
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionStats, setSessionStats] = useState({ easy: 0, good: 0, hard: 0, again: 0 })
  const [newCard, setNewCard] = useState({ front: '', back: '', example: '', language: 'English' })
  const [loading, setLoading] = useState(false)
  const [filterMode, setFilterMode] = useState('all') // all | due | mastered

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [allCards, cardStats] = await Promise.all([
        getFlashcards(),
        getFlashcardStats(),
      ])
      setCards(allCards)
      setStats(cardStats)
    } catch (err) {
      console.error('Failed to load flashcards:', err)
    } finally {
      setLoading(false)
    }
  }

  const startReviewSession = async (onlyDue = false) => {
    try {
      const reviewSet = onlyDue ? await getDueFlashcards() : cards
      if (!reviewSet || reviewSet.length === 0) {
        alert(onlyDue ? 'No flashcards are due for review right now! Great job!' : 'No cards available. Create some first!')
        return
      }
      setCards(reviewSet)
      setCardIdx(0)
      setFlipped(false)
      setSessionStats({ easy: 0, good: 0, hard: 0, again: 0 })
      setView('review')
    } catch (err) {
      console.error(err)
    }
  }

  const currentCard = cards[cardIdx]

  const handleRate = async (ratingVal) => {
    if (!currentCard) return
    setFlipped(false)

    // Update local session stats
    const key = ratingVal.toLowerCase()
    setSessionStats(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))

    try {
      // Call SM-2 spaced repetition backend endpoint
      await reviewFlashcard(currentCard.id, ratingVal)
    } catch (err) {
      console.error('Review sync failed:', err)
    }

    if (cardIdx + 1 >= cards.length) {
      setView('done')
      loadData()
    } else {
      setTimeout(() => setCardIdx(i => i + 1), 200)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newCard.front.trim() || !newCard.back.trim()) return

    try {
      await createFlashcard(newCard)
      setNewCard({ front: '', back: '', example: '', language: 'English' })
      setView('decks')
      await loadData()
    } catch (err) {
      alert('Error creating flashcard: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flashcard?')) return
    try {
      await deleteFlashcard(id)
      setCards(cards.filter(c => c.id !== id))
      loadData()
    } catch (err) {
      console.error(err)
    }
  }

  const progress = cards.length ? ((cardIdx / cards.length) * 100) : 0

  const filteredCards = cards.filter(c => {
    if (filterMode === 'due') return c.isDue
    if (filterMode === 'mastered') return c.mastered
    return true
  })

  return (
    <div className="flashcards-page">
      {/* Header */}
      <div className="page-header mb-20">
        <div>
          <h1 className="display-md">Flashcard Learning System</h1>
          <p className="body-sm text-secondary mt-8">Spaced-Repetition SM-2 vocabulary memory engine</p>
        </div>
        <div className="flex gap-8">
          <button className="btn btn-outline" onClick={() => setView('create')} id="create-card-btn">
            + New Card
          </button>
          <button className="btn btn-primary" onClick={() => startReviewSession(true)} id="review-due-btn">
            ⚡ Review Due ({stats.dueToday})
          </button>
        </div>
      </div>

      {/* Main Deck / Cards View */}
      {view === 'decks' && (
        <>
          {/* Stats bar */}
          <div className="flashcard-stats-row">
            <div className="flashcard-stat card">
              <span className="heading-lg gradient-text">{stats.totalCards}</span>
              <span className="caption text-muted">Total cards</span>
            </div>
            <div className="flashcard-stat card">
              <span className="heading-lg" style={{ color: 'var(--brand-success)' }}>{stats.mastered}</span>
              <span className="caption text-muted">Mastered</span>
            </div>
            <div className="flashcard-stat card">
              <span className="heading-lg" style={{ color: 'var(--brand-danger)' }}>{stats.dueToday}</span>
              <span className="caption text-muted">Due today</span>
            </div>
            <div className="flashcard-stat card">
              <span className="heading-lg" style={{ color: 'var(--brand-warning)' }}>{stats.retentionRate}%</span>
              <span className="caption text-muted">Retention Rate</span>
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className="flex justify-between items-center mt-24 mb-16">
            <div className="flex gap-8">
              <button
                className={`btn btn-sm ${filterMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterMode('all')}
              >
                All Cards ({cards.length})
              </button>
              <button
                className={`btn btn-sm ${filterMode === 'due' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterMode('due')}
              >
                Due for Review ({stats.dueToday})
              </button>
              <button
                className={`btn btn-sm ${filterMode === 'mastered' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilterMode('mastered')}
              >
                Mastered ({stats.mastered})
              </button>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => startReviewSession(false)}>
              Practice All Cards ▶
            </button>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="flex justify-center p-32">
              <span className="spinner" />
            </div>
          ) : filteredCards.length === 0 ? (
            <div className="card text-center p-40">
              <span style={{ fontSize: '3rem' }}>🎴</span>
              <h3 className="heading-md mt-12">No Flashcards Found</h3>
              <p className="body-sm text-secondary mt-8 mb-20">
                Generate cards automatically using AI Tutor, or create your first custom card!
              </p>
              <div className="flex justify-center gap-12">
                <button className="btn btn-primary" onClick={() => setView('create')}>
                  Create Custom Card
                </button>
                <a href="/ai-tutor" className="btn btn-outline">
                  Generate with AI →
                </a>
              </div>
            </div>
          ) : (
            <div className="flashcard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filteredCards.map((c) => (
                <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <span className="badge badge-primary">{c.language || 'English'}</span>
                      {c.mastered ? (
                        <span className="badge badge-success">✓ Mastered</span>
                      ) : c.isDue ? (
                        <span className="badge badge-danger">⚡ Due</span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>Interval: {c.intervalDays}d</span>
                      )}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>{c.front}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 8 }}>{c.back}</div>
                    {c.example && (
                      <div className="caption italic text-muted">"{c.example}"</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-16 pt-12" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <span className="caption text-muted">Reps: {c.repetitions || 0}</span>
                    <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleDelete(c.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Review View (SM-2 Study Session) */}
      {view === 'review' && currentCard && (
        <div className="review-container">
          <div className="flex justify-between items-center mb-16">
            <button className="btn btn-ghost btn-sm" onClick={() => { setView('decks'); loadData(); }}>
              ← Exit Review
            </button>
            <div className="caption text-muted">
              Card {cardIdx + 1} of {cards.length}
            </div>
          </div>

          <div className="progress-bar mb-24">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* 3D Flip Card */}
          <div className="flashcard-3d-wrapper" onClick={() => setFlipped(!flipped)}>
            <div className={`flashcard-3d ${flipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="flashcard-face flashcard-front card">
                <span className="caption text-muted">PROMPT</span>
                <div className="flashcard-word">{currentCard.front}</div>
                <div className="caption text-muted mt-12">Click to flip card 👆</div>
              </div>

              {/* Back */}
              <div className="flashcard-face flashcard-back card">
                <span className="caption text-muted">ANSWER</span>
                <div className="flashcard-meaning">{currentCard.back}</div>
                {currentCard.example && (
                  <div className="flashcard-example">"{currentCard.example}"</div>
                )}
              </div>
            </div>
          </div>

          {/* Spaced repetition rating buttons */}
          {flipped ? (
            <div className="review-buttons mt-24">
              {DIFFICULTIES.map(d => (
                <button
                  key={d.value}
                  className="review-btn card"
                  onClick={() => handleRate(d.value)}
                >
                  <span className="review-btn-icon">{d.icon}</span>
                  <span className="review-btn-label font-600">{d.label}</span>
                  <span className="caption text-muted">{d.desc}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center mt-20">
              <button className="btn btn-primary btn-lg" onClick={() => setFlipped(true)}>
                Reveal Answer ↷
              </button>
            </div>
          )}
        </div>
      )}

      {/* Done View */}
      {view === 'done' && (
        <div className="card text-center review-done">
          <span className="done-emoji">🎉</span>
          <h2 className="heading-lg mt-16">Session Complete!</h2>
          <p className="body-sm text-secondary mt-8 mb-24">
            You reviewed {cards.length} flashcards with SM-2 spaced repetition.
          </p>
          <div className="done-stats mb-24">
            <div className="done-stat">
              <span className="heading-md text-success">{sessionStats.easy + sessionStats.good}</span>
              <span className="caption text-muted">Retained</span>
            </div>
            <div className="done-stat">
              <span className="heading-md text-warning">{sessionStats.hard}</span>
              <span className="caption text-muted">Hard</span>
            </div>
            <div className="done-stat">
              <span className="heading-md text-danger">{sessionStats.again}</span>
              <span className="caption text-muted">Again</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setView('decks')}>
            Back to Flashcard Decks
          </button>
        </div>
      )}

      {/* Create Card View */}
      {view === 'create' && (
        <div className="card" style={{ maxWidth: 540, margin: '20px auto' }}>
          <div className="flex justify-between items-center mb-16">
            <h2 className="heading-md">Add New Flashcard</h2>
            <button className="btn btn-ghost btn-sm" onClick={() => setView('decks')}>✕ Cancel</button>
          </div>
          <form onSubmit={handleCreate} className="create-card-form">
            <div className="form-group">
              <label className="form-label">Front (Word / Phrase / Question)</label>
              <input
                className="form-input"
                required
                placeholder="e.g. Embora"
                value={newCard.front}
                onChange={e => setNewCard({ ...newCard, front: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Back (Meaning / Translation)</label>
              <textarea
                className="form-input"
                required
                rows={2}
                placeholder="e.g. Although / Even though"
                value={newCard.back}
                onChange={e => setNewCard({ ...newCard, back: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Example Sentence (Optional)</label>
              <input
                className="form-input"
                placeholder="e.g. Embora chova, vamos sair."
                value={newCard.example}
                onChange={e => setNewCard({ ...newCard, example: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                className="form-input"
                value={newCard.language}
                onChange={e => setNewCard({ ...newCard, language: e.target.value })}
              >
                {['English', 'Spanish', 'French', 'German', 'Japanese', 'Tamil', 'Korean'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-12 mt-16">
              <button type="button" className="btn btn-ghost" onClick={() => setView('decks')}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Flashcard</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
