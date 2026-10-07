/* ============================================================
   PartnersPage — HelloTalk Partner Discovery (Screen 2)
   ============================================================ */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { sendConnectionRequest } from '../api/connections'
import './PartnersPage.css'

const PARTNERS_DATA = [
  {
    id: 1,
    name: 'Bilal Yusuf',
    flag: '🇸🇪',
    country: 'Sweden',
    nativeLang: 'SWE',
    learningLang: 'ENG',
    status: 'online',
    activeText: 'Active now',
    avatar: 'BY',
    bio: "Hi! My name is Bilal Yusuf and I'm from Sweden. I joined LinguaLink to improve my English and share Swedish culture!",
    interests: ['Sports', 'Software', 'Travel'],
    genderAge: '♂ 24',
    rating: 4.9,
    sessions: 32,
  },
  {
    id: 2,
    name: 'Furkan',
    flag: '🇷🇺',
    country: 'Russia',
    nativeLang: 'RU',
    learningLang: 'ES',
    status: 'online',
    activeText: 'Active now',
    avatar: 'FK',
    bio: "Hi! I'm Furkan from Saint Petersburg. Looking for serious Spanish practice in exchange for Russian lessons.",
    interests: ['Dance', 'Languages', 'Music'],
    genderAge: '♂ 22',
    rating: 4.8,
    sessions: 19,
  },
  {
    id: 3,
    name: 'Yağmur',
    flag: '🇹🇷',
    country: 'Turkey',
    nativeLang: 'TUR',
    learningLang: 'JA',
    status: 'online',
    activeText: 'Active now',
    avatar: 'YG',
    bio: "Merhaba! Native Turkish speaker, passionate about Japanese culture and anime. Let's do a 50/50 language swap!",
    interests: ['Sports', 'Anime', 'Art'],
    genderAge: '♀ 21',
    rating: 5.0,
    sessions: 45,
  },
  {
    id: 4,
    name: 'Yüsra',
    flag: '🇹🇷',
    country: 'Turkey',
    nativeLang: 'TUR',
    learningLang: 'ES',
    status: 'online',
    activeText: 'Active now',
    avatar: 'YS',
    bio: "Hi everyone! I want to practice conversational Spanish for my upcoming travel. Happy to teach Turkish in return!",
    interests: ['Cooking', 'Music', 'Photography'],
    genderAge: '♀ 23',
    rating: 4.7,
    sessions: 14,
  },
  {
    id: 5,
    name: 'Lukas Meyer',
    flag: '🇩🇪',
    country: 'Germany',
    nativeLang: 'DEU',
    learningLang: 'ENG',
    status: 'online',
    activeText: 'Active now',
    avatar: 'LM',
    bio: "Software developer living in Berlin. Looking for regular English conversation partners for weekly voice practice.",
    interests: ['Software', 'Football', 'Cinema'],
    genderAge: '♂ 26',
    rating: 4.9,
    sessions: 52,
  },
  {
    id: 6,
    name: 'Maria Santos',
    flag: '🇧🇷',
    country: 'Brazil',
    nativeLang: 'POR',
    learningLang: 'ENG',
    status: 'away',
    activeText: 'Active 2h ago',
    avatar: 'MS',
    bio: "Ola! Passionate language lover from São Paulo. Let's practice English and Portuguese together!",
    interests: ['Music', 'Travel', 'Food'],
    genderAge: '♀ 25',
    rating: 4.8,
    sessions: 28,
  },
]

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'serious', label: 'Serious Learners' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'online', label: 'Online Now' },
  { id: 'native', label: 'Native Speakers' },
]

const ICEBREAKERS = [
  'Hey! Saw your profile and would love to practice together! 🚀',
  'Hej! I can help with your target language if you help with mine 🤝',
  'Hi there! Loved your interests in tech & travel, up for a quick chat? 😊',
]

export default function PartnersPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [connections, setConnections] = useState({})
  const [wavingPartner, setWavingPartner] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [icebreakerModal, setIcebreakerModal] = useState(null)
  const [chosenIcebreaker, setChosenIcebreaker] = useState(ICEBREAKERS[0])

  const handleWave = async (partner, e) => {
    e.stopPropagation()
    setWavingPartner(partner.id)
    setTimeout(() => setWavingPartner(null), 1000)

    setConnections(prev => ({ ...prev, [partner.id]: 'PENDING' }))
    addToast(`Waved at ${partner.name}! 👋 Request sent`, 'info')

    try {
      await sendConnectionRequest(partner.id)
    } catch {
      // Optimistic state preserved
    }

    // Open icebreaker prompt
    setIcebreakerModal(partner)
  }

  const sendIcebreaker = () => {
    addToast(`Message sent to ${icebreakerModal.name}! 🚀`, 'success')
    navigate('/chat', {
      state: {
        partnerId: icebreakerModal.id,
        initialPrompt: chosenIcebreaker,
      },
    })
  }

  const filtered = PARTNERS_DATA.filter(p => {
    if (activeTab === 'online' && p.status !== 'online') return false
    if (!search) return true
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.country.toLowerCase().includes(search.toLowerCase()) ||
      p.interests.some(i => i.toLowerCase().includes(search.toLowerCase()))
    )
  })

  return (
    <div className="hellotalk-partners-container">
      {/* Top Header Bar from HelloTalk Mockup */}
      <div className="partners-top-bar">
        {/* VIP / Streak Pill Badge */}
        <div className="vip-badge-pill">
          <span className="vip-star">★</span>
          <span className="vip-text">VIP</span>
        </div>

        {/* Center Title */}
        <h1 className="partners-main-title">Find Language Partners</h1>

        {/* Settings Gear Button */}
        <button
          type="button"
          className="settings-gear-btn"
          onClick={() => navigate('/settings')}
          title="Filter & Settings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Horizontal Pill Tab Filter Bar from Mockup */}
      <div className="partners-filter-tabs-row">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`partner-filter-pill ${activeTab === tab.id ? 'active-pill' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Quick Search Input */}
      <div className="partners-search-box mt-16">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search partners by name, language, or interest…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* List of Partners matching HelloTalk Middle Screen */}
      <div className="partners-cards-stack mt-20">
        {filtered.map(partner => (
          <div
            key={partner.id}
            className="hellotalk-partner-card"
            onClick={() => setSelectedPartner(partner)}
          >
            {/* Left Side: Avatar + Flag Badge + Active status */}
            <div className="partner-avatar-col">
              <div className="avatar-wrapper">
                <div className="partner-avatar-circle">
                  {partner.avatar}
                </div>
                {/* Round Country Flag Badge overlapping bottom corner */}
                <span className="avatar-flag-badge">
                  {partner.flag}
                </span>
              </div>
              <div className="status-label-row">
                <span className="online-green-dot" />
                <span className="online-text">{partner.activeText}</span>
              </div>
            </div>

            {/* Middle: Details, Language Swap, Bio, and Interest Tags */}
            <div className="partner-info-col">
              <div className="partner-name-row">
                <span className="partner-name">{partner.name}</span>
                {/* Language Swap Indicator SWE ⇄ ENG */}
                <div className="language-swap-pill">
                  <span className="lang-native-code">{partner.nativeLang}</span>
                  <span className="lang-swap-arrows">⇄</span>
                  <span className="lang-learn-code">{partner.learningLang}</span>
                </div>
              </div>

              {/* Bio Preview Snippet */}
              <p className="partner-bio-snippet">
                {partner.bio}
              </p>

              {/* Interest Pills */}
              <div className="partner-interests-row">
                {partner.interests.map(tag => (
                  <span key={tag} className="interest-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: The Signature HelloTalk Purple Waving Hand Button */}
            <div className="partner-action-col">
              <button
                type="button"
                className={`wave-action-btn ${wavingPartner === partner.id ? 'waving-anim' : ''} ${connections[partner.id] ? 'connected-btn' : ''}`}
                onClick={(e) => handleWave(partner, e)}
                title="Say hi and connect!"
              >
                <span className="wave-icon">👋</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Say Hi / Icebreaker Modal */}
      {icebreakerModal && (
        <div className="modal-overlay" onClick={() => setIcebreakerModal(null)}>
          <div className="modal hellotalk-modal" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-12 mb-16">
              <div className="avatar-wrapper">
                <div className="partner-avatar-circle" style={{ width: 44, height: 44 }}>
                  {icebreakerModal.avatar}
                </div>
                <span className="avatar-flag-badge">{icebreakerModal.flag}</span>
              </div>
              <div>
                <h3 className="heading-sm">Say Hi to {icebreakerModal.name}! 👋</h3>
                <p className="caption text-secondary">
                  Exchange: {icebreakerModal.nativeLang} ⇄ {icebreakerModal.learningLang}
                </p>
              </div>
            </div>

            <p className="body-sm text-secondary mb-12">
              Choose a friendly opening message to break the ice:
            </p>

            <div className="flex flex-col gap-8 mb-20">
              {ICEBREAKERS.map(msg => (
                <div
                  key={msg}
                  className={`icebreaker-option ${chosenIcebreaker === msg ? 'selected' : ''}`}
                  onClick={() => setChosenIcebreaker(msg)}
                >
                  {msg}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-10">
              <button className="btn btn-outline btn-sm" onClick={() => setIcebreakerModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={sendIcebreaker}>
                Send Message & Chat →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
