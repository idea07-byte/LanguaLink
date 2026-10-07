import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboardData } from '../api/dashboard'
import { sendConnectionRequest } from '../api/connections'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectingId, setConnectingId] = useState(null)
  const [connectSuccess, setConnectSuccess] = useState({})

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await getDashboardData()
      setData(res)
    } catch (err) {
      console.warn('Dashboard live load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (partnerId) => {
    setConnectingId(partnerId)
    try {
      await sendConnectionRequest(partnerId)
      setConnectSuccess(prev => ({ ...prev, [partnerId]: true }))
    } catch (err) {
      alert(err.response?.data?.message || 'Could not send connection request')
    } finally {
      setConnectingId(null)
    }
  }

  const displayName = data?.profile?.name || user?.name || 'Language Learner'
  const streak = data?.streak ?? user?.streak ?? 1
  const xp = data?.xp ?? user?.xp ?? 100
  const progressPercent = data?.learningProgressPercent ?? 75
  const correctionsToday = data?.correctionsToday ?? 0
  const flashcardsDue = data?.flashcardsDueCount ?? 0
  const totalCards = data?.totalFlashcardsCount ?? 0
  const partners = data?.recommendedPartners || []
  const recentChats = data?.recentConversations || []

  return (
    <div className="dashboard">
      {/* Welcome banner */}
      <div className="dashboard-banner">
        <div className="banner-glow" />
        <div className="banner-content">
          <div>
            <p className="body-sm text-muted">{greeting}, {displayName.split(' ')[0]} 👋</p>
            <h1 className="display-md mt-4">
              Welcome to <span className="gradient-text">LinguaLink!</span>
            </h1>
            <p className="body-sm text-secondary mt-8">
              You're on a <strong style={{ color: 'var(--brand-accent)' }}>🔥 {streak}-day streak</strong>. Practice daily to master fluency!
            </p>
          </div>
          <div className="banner-avatar">
            <div className="avatar avatar-xl avatar-gradient">
              {displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="xp-badge">⚡ {xp.toLocaleString()} XP</div>
          </div>
        </div>

        {/* Phase 15: Learning Progress Bar */}
        <div className="daily-progress">
          <div className="flex justify-between items-center caption text-muted mb-8">
            <span>Overall Learning Progress: <strong>{progressPercent}%</strong></span>
            <Link to="/learn" className="btn btn-gold btn-sm" style={{ padding: '4px 12px', fontSize: 11 }}>
              Continue Learning Path →
            </Link>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Metric Cards (Phase 15: AI Learning & Flashcards status) */}
      <div className="stats-row mt-24">
        <div className="stat-card card">
          <div className="stat-card-icon" style={{ background: 'rgba(124,58,237,0.15)', color: '#7C3AED' }}>🤖</div>
          <div>
            <div className="heading-lg">{correctionsToday}</div>
            <div className="caption text-muted">AI Corrections Today</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>⚡</div>
          <div>
            <div className="heading-lg">{flashcardsDue}</div>
            <div className="caption text-muted">Flashcards Due for Review</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-card-icon" style={{ background: 'rgba(6,182,212,0.15)', color: '#06B6D4' }}>🃏</div>
          <div>
            <div className="heading-lg">{totalCards}</div>
            <div className="caption text-muted">Total Flashcards in Deck</div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>🔔</div>
          <div>
            <div className="heading-lg">{data?.unreadNotificationsCount || 0}</div>
            <div className="caption text-muted">Unread Notifications</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid mt-24">

        {/* Left Column: Recommended Partners & Practice Modules */}
        <div className="dashboard-left">
          {/* Phase 15: Recommended Partners with Matching */}
          <div className="card">
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="heading-md">Recommended Partners</h2>
                <span className="caption text-muted">50-20-20-10 Smart Compatibility Algorithm</span>
              </div>
              <Link to="/partners" className="btn btn-ghost btn-sm text-accent">Browse all →</Link>
            </div>

            {partners.length === 0 ? (
              <div className="text-center p-20 caption text-muted">
                Looking for compatible language partners... Explore the Partners directory!
              </div>
            ) : (
              <div className="partners-list">
                {partners.map((p) => (
                  <div key={p.id} className="partner-item" style={{ alignItems: 'center' }}>
                    <div className="avatar avatar-md avatar-gradient">
                      {p.name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-8">
                        <span className="body-sm font-600 truncate">{p.name}</span>
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          {p.compatibilityScore || 85}% Match
                        </span>
                      </div>
                      <div className="caption text-muted truncate">
                        Native: {p.nativeLanguage || 'English'} ➔ Learning: {p.learningLanguages?.[0] || 'Spanish'}
                      </div>
                    </div>
                    {connectSuccess[p.id] ? (
                      <span className="badge badge-warning">Pending</span>
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        disabled={connectingId === p.id}
                        onClick={() => handleConnect(p.id)}
                      >
                        {connectingId === p.id ? '...' : '+ Connect'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick study modules */}
          <div className="card mt-20">
            <h2 className="heading-md mb-16">Active Learning Modules</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: 16 }}>
                <div className="flex items-center gap-8 mb-8">
                  <span style={{ fontSize: '1.4rem' }}>📝</span>
                  <strong className="body-sm">AI Grammar Tutor</strong>
                </div>
                <p className="caption text-muted mb-12">Submit phrases and get instant corrections with rule explanations.</p>
                <Link to="/ai-tutor" className="btn btn-primary btn-sm btn-full">
                  Check Grammar →
                </Link>
              </div>

              <div className="card" style={{ background: 'rgba(255,255,255,0.02)', padding: 16 }}>
                <div className="flex items-center gap-8 mb-8">
                  <span style={{ fontSize: '1.4rem' }}>⚡</span>
                  <strong className="body-sm">SM-2 Spaced Repetition</strong>
                </div>
                <p className="caption text-muted mb-12">{flashcardsDue} cards due for retention review today.</p>
                <Link to="/flashcards" className="btn btn-gold btn-sm btn-full">
                  Review Flashcards →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Conversations & Quick Links */}
        <div className="dashboard-right">
          {/* Phase 15: Recent Conversations */}
          <div className="card">
            <div className="flex justify-between items-center mb-16">
              <h2 className="heading-md">Recent Conversations</h2>
              <Link to="/chat" className="btn btn-ghost btn-sm text-accent">Open Chat →</Link>
            </div>

            {recentChats.length === 0 ? (
              <div className="text-center p-24 caption text-muted">
                No conversations yet. Connect with a language partner or practice with AI Tutor!
              </div>
            ) : (
              <div className="partners-list">
                {recentChats.map((c) => (
                  <div key={c.id} className="partner-item">
                    <div className="avatar avatar-md avatar-gradient">
                      {c.partnerName?.slice(0, 2).toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="body-sm truncate font-600">{c.partnerName}</div>
                      <div className="caption text-muted truncate">{c.lastMessage || 'Start conversing...'}</div>
                    </div>
                    <Link to={`/chat?conversation=${c.id}`} className="btn btn-primary btn-sm">
                      Chat
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="card mt-20">
            <h2 className="heading-md mb-16">Quick Actions</h2>
            <div className="quick-actions">
              <Link to="/learn" className="quick-action-btn" id="qa-learn">
                <span className="quick-action-icon">📖</span>
                <span className="body-sm">Learn Path</span>
              </Link>
              <Link to="/partners" className="quick-action-btn" id="qa-partner">
                <span className="quick-action-icon">👥</span>
                <span className="body-sm">Find Partner</span>
              </Link>
              <Link to="/chat" className="quick-action-btn" id="qa-chat">
                <span className="quick-action-icon">💬</span>
                <span className="body-sm">Messages</span>
              </Link>
              <Link to="/flashcards" className="quick-action-btn" id="qa-flash">
                <span className="quick-action-icon">🃏</span>
                <span className="body-sm">Flashcards</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
