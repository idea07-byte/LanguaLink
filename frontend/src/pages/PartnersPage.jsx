import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { sendConnectionRequest, fetchConnections } from '../api/connections'
import './PartnersPage.css'

const SPOTLIGHT_PARTNER = {
  id: 1,
  name: 'Lukas',
  age: 26,
  city: 'Berlin',
  country: 'Germany',
  flag: '🇩🇪',
  match: 92,
  teaches: 'German',
  learns: 'English',
  verified: true,
  avatar: 'L',
  tags: ['Football ⚽', 'Cooking 🍳', 'Film 🎬'],
  overlap: 'Free 7–10 pm his time, about 30 min before your evening.',
  bio: 'Software engineer living in Berlin. Looking for a regular partner for weekly 50/50 voice practice.',
}

const ALL_PARTNERS = [
  { id: 1, name: 'Lukas', age: 26, city: 'Berlin', flag: '🇩🇪', native: 'German', learning: 'English', level: 'B1', status: 'online', topics: ['Football ⚽', 'Cooking 🍳', 'Film 🎬'], rating: 4.9, sessions: 28, avatar: 'L', match: 92, bio: 'Native German speaker in Berlin. Happy to exchange for English conversations!' },
  { id: 2, name: 'Maria Santos', age: 24, city: 'São Paulo', flag: '🇧🇷', native: 'Portuguese', learning: 'English', level: 'B2', status: 'online', topics: ['Music 🎵', 'Travel ✈️', 'Food 🍕'], rating: 4.9, sessions: 24, avatar: 'MS', match: 88, bio: 'Passionate about language learning and travel. I love sharing Brazilian culture!' },
  { id: 3, name: 'Yuki Tanaka', age: 28, city: 'Tokyo', flag: '🇯🇵', native: 'Japanese', learning: 'English', level: 'A2', status: 'online', topics: ['Anime 🎌', 'Gaming 🎮', 'Tech 💻'], rating: 4.7, sessions: 12, avatar: 'YT', match: 85, bio: 'Huge anime fan looking to improve English for international work.' },
  { id: 4, name: 'Pierre Dubois', age: 31, city: 'Paris', flag: '🇫🇷', native: 'French', learning: 'English', level: 'C1', status: 'offline', topics: ['Art 🎨', 'Literature 📚', 'Film 🎬'], rating: 4.8, sessions: 38, avatar: 'PD', match: 80, bio: 'French teacher and language enthusiast. Native French, near-native English.' },
  { id: 5, name: 'Carlos Ruiz', age: 27, city: 'Madrid', flag: '🇪🇸', native: 'Spanish', learning: 'English', level: 'B1', status: 'online', topics: ['Sports ⚽', 'Cooking 🍳', 'Movies 🎬'], rating: 4.5, sessions: 9, avatar: 'CR', match: 79, bio: 'Sports journalist who wants to write in English. Huge football fan!' },
  { id: 6, name: 'Sofia Müller', age: 25, city: 'Munich', flag: '🇩🇪', native: 'German', learning: 'Spanish', level: 'B1', status: 'away', topics: ['Science 🔬', 'Hiking 🏔️', 'Music 🎵'], rating: 4.6, sessions: 18, avatar: 'SM', match: 76, bio: 'Software engineer by day, language learner by night.' },
]

const LANGUAGES = ['All', 'German', 'English', 'Spanish', 'French', 'Japanese', 'Portuguese']
const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const ICEBREAKERS = [
  'Hi Lukas! I just finished a lesson on greetings and wanted to try: Wie war dein Tag?',
  'Hey! I saw you love film and cooking. Would love to practice German with you!',
  'Hallo! I am learning German and can help with your English. Up for a 50/50 chat?',
]

export default function PartnersPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [search, setSearch] = useState('')
  const [filterLang, setFilterLang] = useState('All')
  const [filterLevel, setFilterLevel] = useState('All')
  const [spotlightDismissed, setSpotlightDismissed] = useState(false)
  const [sayHiModal, setSayHiModal] = useState(null)
  const [selectedIcebreaker, setSelectedIcebreaker] = useState(ICEBREAKERS[0])
  const [selected, setSelected] = useState(null)

  const [connections, setConnections] = useState({})

  const handleConnect = async (partner, e) => {
    e.stopPropagation()
    setConnections(prev => ({ ...prev, [partner.id]: 'PENDING' }))
    addToast(`Connection request sent to ${partner.name}! ⏳`, 'info')
    try {
      await sendConnectionRequest(partner.id)
    } catch {
      // Optimistic state preserved
    }
  }

  const filtered = ALL_PARTNERS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.learning.toLowerCase().includes(search.toLowerCase()) ||
      p.native.toLowerCase().includes(search.toLowerCase())
    const matchLang = filterLang === 'All' || p.learning === filterLang || p.native === filterLang
    const matchLevel = filterLevel === 'All' || p.level === filterLevel
    return matchSearch && matchLang && matchLevel
  })

  const sendIcebreaker = () => {
    addToast(`Message sent to ${sayHiModal.name}! 🚀`, 'success')
    navigate('/chat', {
      state: {
        partnerId: sayHiModal.id,
        initialPrompt: selectedIcebreaker,
      },
    })
  }

  return (
    <div className="partners-page">
      <div className="page-header">
        <div>
          <h1 className="display-md">Language Exchange Partners</h1>
          <p className="body-sm text-secondary mt-4">
            The language swap is the headline: find native speakers who want to learn yours.
          </p>
        </div>
      </div>

      {/* Featured Spotlight Card: Parley "Discover" Screen Signature */}
      {!spotlightDismissed && (
        <div className="parley-spotlight-card mt-20">
          <div className="spotlight-top-banner">
            <div className="spotlight-badge">⭐ Recommended Match</div>
            <div className="spotlight-match-pill">{SPOTLIGHT_PARTNER.match}% Match</div>
          </div>

          <div className="spotlight-hero-area">
            <div className="spotlight-profile-row">
              <div className="spotlight-avatar">{SPOTLIGHT_PARTNER.avatar}</div>
              <div>
                <h2 className="spotlight-name">
                  {SPOTLIGHT_PARTNER.name}, {SPOTLIGHT_PARTNER.age}{' '}
                  <span className="verified-tag">✓ Verified</span>
                </h2>
                <div className="spotlight-city">
                  {SPOTLIGHT_PARTNER.city}, {SPOTLIGHT_PARTNER.country} {SPOTLIGHT_PARTNER.flag}
                </div>
              </div>
            </div>

            {/* The Headline: Language Swap */}
            <div className="swap-banner mt-16">
              <div className="swap-col swap-col-teach">
                <span className="swap-lbl">You teach (Mint)</span>
                <span className="swap-val">English</span>
              </div>
              <div className="swap-symbol">⇄</div>
              <div className="swap-col swap-col-learn">
                <span className="swap-lbl">He teaches (Lilac)</span>
                <span className="swap-val">German</span>
              </div>
            </div>

            {/* Tags & Time Overlap */}
            <div className="spotlight-tags-row mt-14">
              {SPOTLIGHT_PARTNER.tags.map(t => (
                <span key={t} className="parley-tag">{t}</span>
              ))}
            </div>

            <p className="spotlight-overlap-notice mt-10">
              🕒 {SPOTLIGHT_PARTNER.overlap}
            </p>

            <div className="spotlight-actions-row mt-16">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSpotlightDismissed(true)}
              >
                Skip
              </button>
              <button
                className={`btn btn-sm ${connections[SPOTLIGHT_PARTNER.id] === 'PENDING' ? 'btn-outline' : connections[SPOTLIGHT_PARTNER.id] === 'ACCEPTED' ? 'btn-success' : 'btn-outline'}`}
                onClick={(e) => handleConnect(SPOTLIGHT_PARTNER, e)}
                disabled={connections[SPOTLIGHT_PARTNER.id] === 'PENDING' || connections[SPOTLIGHT_PARTNER.id] === 'ACCEPTED'}
              >
                {connections[SPOTLIGHT_PARTNER.id] === 'ACCEPTED' ? '✓ Connected' : connections[SPOTLIGHT_PARTNER.id] === 'PENDING' ? '⏳ Request Pending' : '+ Connect'}
              </button>
              <button
                className="btn btn-gold btn-md"
                onClick={() => setSayHiModal(SPOTLIGHT_PARTNER)}
              >
                Say hi 👋
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="partners-filters card mt-24">
        <div className="input-group flex-1" style={{ minWidth: 220 }}>
          <span className="input-icon">🔍</span>
          <input
            className="form-input"
            placeholder="Search by name or language…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input filter-select"
          value={filterLang}
          onChange={e => setFilterLang(e.target.value)}
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l === 'All' ? 'All Languages' : l}</option>)}
        </select>
        <select
          className="form-input filter-select"
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value)}
        >
          {LEVELS.map(l => <option key={l} value={l}>{l === 'All' ? 'All Levels' : l}</option>)}
        </select>
      </div>

      {/* Partners Grid */}
      <div className="partners-grid mt-20">
        {filtered.map(p => (
          <div key={p.id} className="parley-partner-card card card-hover" onClick={() => setSelected(p)}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-10">
                <div className="avatar avatar-md avatar-gradient">{p.avatar}</div>
                <div>
                  <div className="body-sm" style={{ fontWeight: 700 }}>
                    {p.name} {p.flag}
                  </div>
                  <div className="caption text-muted">{p.city} · {p.level}</div>
                </div>
              </div>
              <span className="badge badge-warning">{p.match}% Match</span>
            </div>

            {/* Language Swap Indicator */}
            <div className="mini-swap-box mt-12">
              <span className="mini-swap-teach">Teaches {p.native}</span>
              <span className="mini-swap-arrow">⇄</span>
              <span className="mini-swap-learn">Learns {p.learning}</span>
            </div>

            <p className="caption text-secondary mt-10 line-clamp-2">{p.bio}</p>

            <div className="flex gap-6 mt-12 flex-wrap">
              {p.topics.slice(0, 2).map(t => (
                <span key={t} className="parley-tag parley-tag-sm">{t}</span>
              ))}
            </div>

            <div className="flex gap-8 mt-14">
              <button
                className={`btn btn-sm ${connections[p.id] === 'PENDING' ? 'btn-outline' : connections[p.id] === 'ACCEPTED' ? 'btn-success' : 'btn-outline'}`}
                style={{ minWidth: 92 }}
                onClick={(e) => handleConnect(p, e)}
                disabled={connections[p.id] === 'PENDING' || connections[p.id] === 'ACCEPTED'}
              >
                {connections[p.id] === 'ACCEPTED' ? '✓ Friends' : connections[p.id] === 'PENDING' ? '⏳ Pending' : '+ Connect'}
              </button>
              <button
                className="btn btn-gold btn-sm flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  setSayHiModal(p)
                }}
              >
                Say hi 👋
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelected(p)
                }}
              >
                Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Say Hi Icebreaker Modal */}
      {sayHiModal && (
        <div className="modal-overlay" onClick={() => setSayHiModal(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-16">
              <h2 className="heading-md">Send a greeting to {sayHiModal.name}</h2>
              <button className="btn-ghost" onClick={() => setSayHiModal(null)}>✕</button>
            </div>
            <p className="body-sm text-secondary mb-12">
              Choose an icebreaker to kick off your language exchange:
            </p>

            <div className="flex flex-col gap-10">
              {ICEBREAKERS.map((ib, idx) => (
                <div
                  key={idx}
                  className={`icebreaker-choice ${selectedIcebreaker === ib ? 'icebreaker-selected' : ''}`}
                  onClick={() => setSelectedIcebreaker(ib)}
                >
                  <span className="icebreaker-icon">💬</span>
                  <span className="body-sm flex-1">{ib}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-10 mt-20">
              <button className="btn btn-ghost flex-1" onClick={() => setSayHiModal(null)}>
                Cancel
              </button>
              <button className="btn btn-gold flex-2" onClick={sendIcebreaker}>
                Send Message & Open Chat →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-14 mb-16">
              <div className="avatar avatar-xl avatar-gradient">{selected.avatar}</div>
              <div>
                <h2 className="heading-lg">{selected.name} {selected.flag}</h2>
                <div className="caption text-muted">{selected.city} · ⭐ {selected.rating} · {selected.sessions} sessions</div>
              </div>
            </div>

            <div className="swap-banner mb-14">
              <div className="swap-col swap-col-teach">
                <span className="swap-lbl">Teaches</span>
                <span className="swap-val">{selected.native}</span>
              </div>
              <div className="swap-symbol">⇄</div>
              <div className="swap-col swap-col-learn">
                <span className="swap-lbl">Learns</span>
                <span className="swap-val">{selected.learning}</span>
              </div>
            </div>

            <p className="body-sm text-secondary">{selected.bio}</p>

            <div className="flex gap-10 mt-24">
              <button
                className="btn btn-gold flex-1"
                onClick={() => {
                  setSelected(null)
                  setSayHiModal(selected)
                }}
              >
                Say hi 👋
              </button>
              <Link to="/chat" className="btn btn-outline flex-1">
                Open Chat 💬
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
