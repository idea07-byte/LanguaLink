/* ============================================================
   LandingPage — HelloTalk Inspired Visual Showcase
   ============================================================ */
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'
import './LandingPage.css'

const FEATURES = [
  {
    icon: '👋',
    title: 'Partner Discovery',
    desc: 'Match with native speakers worldwide by target language, level, and shared hobbies with 1-click waving.',
    color: '#7C5CFC',
  },
  {
    icon: '💬',
    title: 'Real-Time Chat & Translation',
    desc: 'Chat via WebSockets with inline translation badges (文A) and instant AI grammar hints.',
    color: '#1B84FF',
  },
  {
    icon: '🤖',
    title: 'AI Language Tutor',
    desc: 'Practice 24/7 with our AI tutor powered by Gemini. Real-time feedback, sentence corrections, and roleplay.',
    color: '#00D287',
  },
  {
    icon: '🃏',
    title: 'Smart Flashcards',
    desc: 'Spaced repetition system (SM-2) automatically saves your chat corrections into personalized decks.',
    color: '#FFB800',
  },
  {
    icon: '📞',
    title: 'Fair-Time Voice Sessions',
    desc: 'Practice speaking with integrated split-timer sessions that guarantee equal practice in both languages.',
    color: '#FF4B72',
  },
  {
    icon: '📊',
    title: 'Progress & Streaks',
    desc: 'Track XP, streaks, level progressions, and earned badges as you unlock fluency milestones.',
    color: '#1B84FF',
  },
]

const LANGUAGES = [
  '🇸🇪 Swedish', '🇹🇷 Turkish', '🇷🇺 Russian', '🇩🇪 German',
  '🇪🇸 Spanish', '🇧🇷 Portuguese', '🇫🇷 French', '🇯🇵 Japanese',
  '🇮🇹 Italian', '🇰🇷 Korean', '🇨🇳 Mandarin', '🇺🇸 English'
]

export default function LandingPage() {
  const [activeScreenTab, setActiveScreenTab] = useState('all') // 'all' | 'splash' | 'partners' | 'chat'

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <BrandLogo size="md" showTagline={true} />

          <div className="landing-nav-links">
            <a href="#mockups">UI Showcase</a>
            <a href="#features">Features</a>
            <a href="#languages">Languages</a>
          </div>

          <div className="flex gap-10">
            <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-streak-pill">
              <span>🔥</span> 150+ Languages & Millions of Learners
            </span>
          </div>

          <h1 className="hero-title">
            The Friendly Way to<br />
            <span className="hero-title-highlight">Learn Any Language</span>
          </h1>

          <p className="hero-subtitle">
            Say goodbye to boring drills. Connect with real native partners, chat in real time with instant translation badges, and speak with confidence.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn btn-primary btn-lg" id="hero-get-started-btn">
              ⚡ Try Demo App Now
            </Link>
            <Link to="/partners" className="btn btn-outline btn-lg" id="hero-browse-partners-btn">
              Explore Partners 👋
            </Link>
          </div>

          <div className="hero-stats-row">
            <div className="stat-item">
              <span className="stat-num">50M+</span>
              <span className="stat-label">Learners</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-num">150+</span>
              <span className="stat-label">Languages</span>
            </div>
            <div className="stat-sep" />
            <div className="stat-item">
              <span className="stat-num">98%</span>
              <span className="stat-label">Success Rate</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive 3-Phone Showcase (Behance HelloTalk Cover Design) */}
        <div className="hero-phones-showcase" id="mockups">
          {/* Phone 1: Welcome & Auth Splash */}
          <div className={`phone-mockup phone-mockup-splash ${activeScreenTab === 'splash' ? 'phone-focused' : ''}`}>
            <div className="phone-screen-inner">
              <div className="phone-card-header">
                <BrandLogo size="sm" />
              </div>
              <div className="phone-splash-graphic">
                <div className="mini-blob blob-blue" />
                <div className="mini-blob blob-yellow" />
                <div className="mini-blob blob-coral" />
                <div className="mini-blob blob-green" />

                <div className="mini-bubble bubble-1"><span>🇺🇸</span> Hello!</div>
                <div className="mini-bubble bubble-2"><span>🇸🇪</span> Hej!</div>
                <div className="mini-bubble bubble-3"><span>🇹🇷</span> Merhaba!</div>
                <div className="mini-bubble bubble-4"><span>🇩🇪</span> Hallo!</div>
                <div className="mini-bubble bubble-5"><span>🇪🇸</span> ¡Hola!</div>
              </div>
              <div className="phone-splash-actions">
                <Link to="/login" className="mini-google-btn">
                  <span>G</span> Sign in with Google
                </Link>
                <div className="mini-social-row">
                  <span className="mini-social-btn fb-color">Facebook</span>
                  <span className="mini-social-btn email-color">Email</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 2: Partner Discovery (Middle Screen) */}
          <div className={`phone-mockup phone-mockup-partners ${activeScreenTab === 'partners' ? 'phone-focused' : ''}`}>
            <div className="phone-screen-inner">
              <div className="mini-partner-top">
                <span className="mini-vip-pill">VIP</span>
                <span className="mini-partner-title">Find Partners</span>
                <span className="mini-gear-icon">⚙️</span>
              </div>
              <div className="mini-chips-row">
                <span className="mini-chip-active">All</span>
                <span className="mini-chip">Serious</span>
                <span className="mini-chip">Nearby</span>
              </div>
              <div className="mini-partner-cards">
                <div className="mini-partner-item">
                  <div className="mini-avatar-wrap">
                    <div className="mini-avatar-circle">BY</div>
                    <span className="mini-flag">🇸🇪</span>
                  </div>
                  <div className="mini-partner-info">
                    <div className="mini-name-row">
                      <strong>Bilal Yusuf</strong>
                      <span className="mini-swap-tag">SWE ⇄ ENG</span>
                    </div>
                    <p className="mini-bio">Hi! I'm Bilal from Sweden...</p>
                    <div className="mini-tags">
                      <span>Sport</span>
                      <span>Tech</span>
                    </div>
                  </div>
                  <Link to="/chat" className="mini-wave-btn">👋</Link>
                </div>

                <div className="mini-partner-item">
                  <div className="mini-avatar-wrap">
                    <div className="mini-avatar-circle" style={{ background: '#FF4B72' }}>FK</div>
                    <span className="mini-flag">🇷🇺</span>
                  </div>
                  <div className="mini-partner-info">
                    <div className="mini-name-row">
                      <strong>Furkan</strong>
                      <span className="mini-swap-tag">RU ⇄ ES</span>
                    </div>
                    <p className="mini-bio">Learning Spanish for college...</p>
                    <div className="mini-tags">
                      <span>Dance</span>
                      <span>Music</span>
                    </div>
                  </div>
                  <Link to="/chat" className="mini-wave-btn">👋</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Phone 3: Chat Screen (Right Screen) */}
          <div className={`phone-mockup phone-mockup-chat ${activeScreenTab === 'chat' ? 'phone-focused' : ''}`}>
            <div className="phone-screen-inner">
              <div className="mini-chat-nav">
                <span>←</span>
                <strong>Chat</strong>
                <span>📞</span>
              </div>
              <div className="mini-chat-profile">
                <div className="mini-avatar-circle" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>BY</div>
                <div>
                  <div className="flex items-center gap-4">
                    <strong style={{ fontSize: '0.8rem' }}>Bilal Yusuf</strong>
                    <span className="mini-gender-tag">♂ 18</span>
                  </div>
                  <span className="caption" style={{ fontSize: '0.68rem', color: '#64748B' }}>Sport · Software</span>
                </div>
              </div>
              <div className="mini-chat-canvas">
                <div className="mini-date-divider">07/01 15:33</div>
                <div className="mini-bubble-outgoing">
                  Hey, hi Bilal, how's it going?
                  <span className="mini-bubble-time">23:05</span>
                </div>
                <div className="mini-bubble-incoming">
                  <span className="mini-trans-badge">文A</span>
                  Hi buddy, you seem to be doing well. Where do you live?
                  <span className="mini-bubble-time" style={{ color: '#94A3B8' }}>23:05</span>
                </div>
                <div className="mini-bubble-outgoing">
                  USA, I think you are in Sweden
                  <span className="mini-bubble-time">23:06</span>
                </div>
              </div>
              <div className="mini-composer-bar">
                <span>😊</span>
                <span className="mini-composer-ph">Message…</span>
                <span>🎙️</span>
                <span className="mini-send-dot">➤</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Carousel */}
      <section className="languages-strip" id="languages">
        <h2 className="section-title text-center">Supported Languages</h2>
        <p className="text-secondary text-center caption mb-24">Practice any language with native speakers who want to learn yours</p>
        <div className="lang-pills-row">
          {LANGUAGES.map(l => (
            <div key={l} className="lang-pill-item">
              {l}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section" id="features">
        <div className="text-center mb-40">
          <h2 className="section-title">Designed for Joyful Language Exchange</h2>
          <p className="text-secondary body-md mt-8">Everything you need to go from beginner to fluent conversation</p>
        </div>

        <div className="features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card card card-hover">
              <div className="feature-icon-bubble" style={{ background: `${f.color}15`, color: f.color }}>
                {f.icon}
              </div>
              <h3 className="heading-sm mt-16">{f.title}</h3>
              <p className="body-sm text-secondary mt-8">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta-banner">
        <h2 className="display-md text-primary">Start Speaking Today</h2>
        <p className="body-md text-secondary mt-8 mb-24">Join over 50 million language learners. Completely free.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Create Free Account →
        </Link>
      </section>
    </div>
  )
}
