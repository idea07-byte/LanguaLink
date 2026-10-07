import { Link } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
  {
    icon: '💬',
    title: 'Real-Time Chat',
    desc: 'Connect with native speakers via live WebSocket-powered conversations with translation assistance.',
    color: '#7C3AED',
  },
  {
    icon: '🤖',
    title: 'AI Language Tutor',
    desc: 'Get instant grammar corrections, vocabulary explanations, and personalized lessons powered by Gemini AI.',
    color: '#06B6D4',
  },
  {
    icon: '🃏',
    title: 'Smart Flashcards',
    desc: 'Spaced-repetition flashcard system that adapts to your learning pace and tracks your progress.',
    color: '#F59E0B',
  },
  {
    icon: '🌍',
    title: 'Partner Discovery',
    desc: 'Find the perfect language exchange partner matched by language goals, level, and availability.',
    color: '#10B981',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Detailed analytics on your learning journey, XP points, streaks, and vocabulary growth.',
    color: '#EF4444',
  },
  {
    icon: '🔊',
    title: 'Voice & Video',
    desc: 'Practice speaking confidence with integrated voice notes and video call sessions with partners.',
    color: '#8B5CF6',
  },
]

const LANGUAGES = ['🇪🇸 Spanish', '🇯🇵 Japanese', '🇫🇷 French', '🇩🇪 German', '🇰🇷 Korean', '🇮🇹 Italian', '🇵🇹 Portuguese', '🇨🇳 Mandarin', '🇧🇷 Brazilian', '🇷🇺 Russian', '🇸🇦 Arabic', '🇮🇳 Hindi']

const STATS = [
  { value: '50K+', label: 'Active Learners' },
  { value: '120+', label: 'Languages' },
  { value: '1M+', label: 'Messages Sent' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const TESTIMONIALS = [
  {
    name: 'Sofia M.',
    flag: '🇧🇷',
    lang: 'Learning English',
    text: 'LinguaLink connected me with amazing English speakers. My fluency improved dramatically in just 3 months!',
    avatar: 'SM',
  },
  {
    name: 'Takeshi K.',
    flag: '🇯🇵',
    lang: 'Learning Spanish',
    text: 'The AI tutor is incredible. It corrects my grammar in real time and explains why — better than any textbook.',
    avatar: 'TK',
  },
  {
    name: 'Emma L.',
    flag: '🇫🇷',
    lang: 'Learning Japanese',
    text: 'The flashcard system is addictive! I\'ve learned 500+ kanji without even feeling like studying.',
    avatar: 'EL',
  },
]

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <div className="landing-logo-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
              </svg>
            </div>
            <span className="landing-logo-text">LinguaLink</span>
          </Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#languages">Languages</a>
            <a href="#testimonials">Stories</a>
          </div>
          <div className="flex gap-8">
            <Link to="/login"    className="btn btn-outline btn-sm">Log in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="hero-content animate-fadeInUp">
          <div className="hero-badge">
            <span className="badge badge-primary">🌟 New: AI Grammar Coach</span>
          </div>
          <h1 className="display-xl">
            Learn Any Language<br />
            <span className="gradient-text">With Real People</span>
          </h1>
          <p className="hero-subtitle body-lg text-secondary">
            Connect with native speakers worldwide. Practice through real conversations,
            get AI-powered feedback, and master vocabulary with adaptive flashcards.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg" id="hero-cta-register">
              Start Learning Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" id="hero-cta-login">
              Sign In
            </Link>
          </div>
          <div className="hero-social-proof">
            <div className="hero-avatars">
              {['SM', 'TK', 'EL', 'JD', '+'].map((a, i) => (
                <div key={i} className="hero-avatar" style={{ background: `hsl(${i * 50 + 250}, 70%, 60%)` }}>{a}</div>
              ))}
            </div>
            <span className="caption text-muted">Join 50,000+ language learners</span>
          </div>
        </div>

        {/* Hero visual */}
        <div className="hero-visual animate-fadeInUp delay-200">
          <div className="hero-app-preview">
            <div className="preview-header">
              <div className="preview-dots">
                <span /><span /><span />
              </div>
              <span className="caption text-muted">LinguaLink Chat</span>
            </div>
            <div className="preview-chat">
              <div className="preview-msg preview-msg-left">
                <div className="preview-avatar">M</div>
                <div className="preview-bubble preview-bubble-left">
                  ¿Cómo fue tu día? 😊
                </div>
              </div>
              <div className="preview-msg preview-msg-right">
                <div className="preview-bubble preview-bubble-right">
                  ¡Muy bien! Aprendí nuevas palabras hoy
                </div>
                <div className="preview-avatar" style={{ background: 'var(--grad-brand)' }}>A</div>
              </div>
              <div className="preview-ai-hint">
                <span className="badge badge-cyan">🤖 AI Tip</span>
                <span className="caption">Great use of "nuevas"! Consider adding "gracias" to sound more natural.</span>
              </div>
              <div className="preview-msg preview-msg-left">
                <div className="preview-avatar">M</div>
                <div className="preview-bubble preview-bubble-left">
                  ¡Perfecto! Tu progreso es increíble 🎉
                </div>
              </div>
            </div>
            <div className="preview-footer">
              <div className="preview-input-bar">
                <input placeholder="Type a message…" readOnly />
                <button className="preview-send">➤</button>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="hero-float hero-float-1 animate-float">
            <span>🔥 12-day streak!</span>
          </div>
          <div className="hero-float hero-float-2 animate-float delay-200">
            <span>🃏 50 cards mastered</span>
          </div>
          <div className="hero-float hero-float-3 animate-float delay-400">
            <span>⭐ +120 XP today</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="display-md gradient-text">{s.value}</div>
              <div className="body-sm text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-header text-center">
          <span className="badge badge-primary mb-12">✨ Features</span>
          <h2 className="display-md">Everything You Need to Fluency</h2>
          <p className="body-lg text-secondary mt-12" style={{ maxWidth: 560, margin: '12px auto 0' }}>
            A complete language learning ecosystem powered by AI and real human connection.
          </p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card card card-hover animate-fadeInUp" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="feature-icon" style={{ background: `${f.color}22`, color: f.color }}>{f.icon}</div>
              <h3 className="heading-md mt-16">{f.title}</h3>
              <p className="body-sm text-secondary mt-8">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Languages */}
      <section className="section section-dark" id="languages">
        <div className="section-header text-center">
          <span className="badge badge-cyan mb-12">🌍 Languages</span>
          <h2 className="display-md">120+ Languages Available</h2>
          <p className="body-lg text-secondary mt-12">
            Find a partner for virtually any language in the world.
          </p>
        </div>
        <div className="lang-cloud">
          {LANGUAGES.map((l, i) => (
            <div key={i} className="chip">{l}</div>
          ))}
          <div className="chip">+ 108 more</div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" id="testimonials">
        <div className="section-header text-center">
          <span className="badge badge-success mb-12">💬 Stories</span>
          <h2 className="display-md">Loved by Learners Worldwide</h2>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card card animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testimonial-quote">"</div>
              <p className="body-md text-secondary">{t.text}</p>
              <div className="testimonial-author">
                <div className="avatar avatar-md avatar-gradient">{t.avatar}</div>
                <div>
                  <div className="body-sm" style={{ fontWeight: 600 }}>{t.name} {t.flag}</div>
                  <div className="caption text-muted">{t.lang}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-content text-center">
          <h2 className="display-md">Ready to Become Fluent?</h2>
          <p className="body-lg text-secondary mt-12">
            Join 50,000 learners already making progress. Free forever.
          </p>
          <div className="flex gap-16 justify-center mt-32">
            <Link to="/register" className="btn btn-primary btn-lg" id="cta-register">
              Create Free Account →
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg" id="cta-login">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <div className="landing-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
            </svg>
          </div>
          <span className="landing-logo-text">LinguaLink</span>
        </div>
        <p className="caption text-muted mt-12">© 2024 LinguaLink. All rights reserved. Built with ❤️ for language learners.</p>
      </footer>
    </div>
  )
}
