import { useState, useRef, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PracticeSessionModal from '../components/PracticeSessionModal'
import { fetchConversations, fetchConversationMessages, sendChatMessage, markMessagesRead } from '../api/chat'
import { createStompClient, subscribeToConversation, sendStompMessage } from '../api/websocket'
import './ChatPage.css'

const DICTIONARY = {
  'Guten': 'Good',
  'Morgen!': 'Morning!',
  'Was': 'What',
  'hast': 'have (auxiliary verb)',
  'du': 'you (informal)',
  'gestern': 'yesterday',
  'gemacht?': 'done / made?',
  'Welcher': 'Which',
  'Film?': 'Movie / Film?',
  'Kino': 'Cinema / Movie theater',
  'gegangen': 'gone (past participle of gehen)',
}

const CONVERSATIONS = [
  {
    id: 1,
    name: 'Lukas',
    flag: '🇩🇪',
    status: 'online',
    city: 'Berlin',
    verified: true,
    lastMsg: 'Welcher Film? 🙂',
    time: 'Just now',
    unread: 1,
    avatar: 'L',
    teaching: 'German',
    learning: 'English',
  },
  {
    id: 2,
    name: 'Maria Santos',
    flag: '🇧🇷',
    status: 'online',
    city: 'São Paulo',
    verified: true,
    lastMsg: '¡Gracias! Hasta mañana 😊',
    time: '2m',
    unread: 0,
    avatar: 'MS',
    teaching: 'Portuguese',
    learning: 'English',
  },
  {
    id: 3,
    name: 'Yuki Tanaka',
    flag: '🇯🇵',
    status: 'online',
    city: 'Tokyo',
    verified: true,
    lastMsg: 'Can you help me with this grammar?',
    time: '1h',
    unread: 0,
    avatar: 'YT',
    teaching: 'Japanese',
    learning: 'English',
  },
  {
    id: 4,
    name: 'Pierre Dubois',
    flag: '🇫🇷',
    status: 'offline',
    city: 'Paris',
    verified: false,
    lastMsg: 'See you tomorrow for the voice call!',
    time: '3h',
    unread: 0,
    avatar: 'PD',
    teaching: 'French',
    learning: 'English',
  },
]

const INITIAL_MESSAGES = {
  1: [
    {
      id: 1,
      from: 'partner',
      text: 'Guten Morgen! Was hast du gestern gemacht?',
      subHint: 'Tap a word to translate',
      time: '9:41 AM',
      lang: 'German',
      type: 'text',
    },
    {
      id: 2,
      from: 'me',
      text: 'Ich habe gestern ins Kino gegangen.',
      time: '9:42 AM',
      lang: 'German',
      type: 'text',
    },
    {
      id: 3,
      from: 'partner',
      type: 'correction',
      wrongText: 'habe',
      correctText: 'bin',
      sentence: 'bin gestern ins Kino gegangen',
      explanation: 'Lukas suggested this fix. Gehen uses "sein" as auxiliary.',
      saved: false,
      time: '9:43 AM',
    },
    {
      id: 4,
      from: 'partner',
      text: 'Welcher Film? 🙂',
      time: '9:44 AM',
      lang: 'German',
      type: 'text',
    },
    {
      id: 5,
      type: 'call_proposed',
      timeText: 'Call proposed: Thu 8:00 pm',
      subText: '7:30 pm his time · 50/50 Fair-Time Session',
      time: '9:45 AM',
    },
  ],
  2: [
    { id: 1, from: 'partner', text: '¡Hola! ¿Cómo estuvo tu día?', time: '10:30', lang: 'Spanish', type: 'text' },
    { id: 2, from: 'me', text: '¡Muy bien! Practiqué mucho hoy.', time: '10:32', lang: 'Spanish', type: 'text' },
    { id: 3, from: 'partner', text: '¡Gracias! Hasta mañana 😊', time: '10:40', lang: 'Spanish', type: 'text' },
  ],
}

export default function ChatPage() {
  const { id } = useParams()
  const location = useLocation()
  const { addToast } = useToast()

  const [activeConv, setActiveConv] = useState(id ? parseInt(id) : 1)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [activeTranslation, setActiveTranslation] = useState(null)
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const messagesEndRef = useRef(null)

  const partner = CONVERSATIONS.find(c => c.id === activeConv) || CONVERSATIONS[0]
  const convMessages = messages[activeConv] || []

  // Check if routed with initial prompt from LearnPage
  useEffect(() => {
    if (location.state?.initialPrompt) {
      setInput(location.state.initialPrompt)
    }
  }, [location.state])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeConv])

  const handleWordClick = (word) => {
    const clean = word.replace(/[,.?!]/g, '')
    const meaning = DICTIONARY[clean] || DICTIONARY[word] || `Translation for "${clean}"`
    setActiveTranslation({ word: clean, meaning })
  }

  const handleSaveCorrection = (msgId, phrase) => {
    setMessages(prev => ({
      ...prev,
      [activeConv]: prev[activeConv].map(m => m.id === msgId ? { ...m, saved: true } : m),
    }))
    addToast(`Saved "${phrase}" to your Flashcards deck! 🃏`, 'success')
  }

  const { user } = useAuth()
  const stompClientRef = useRef(null)

  // Real-Time WebSocket STOMP Connection & Subscription
  useEffect(() => {
    let sub = null
    const client = createStompClient({
      onConnect: (c) => {
        stompClientRef.current = c
        sub = subscribeToConversation(c, activeConv, (newMsg) => {
          if (newMsg && newMsg.senderId !== user?.id) {
            setMessages(prev => ({
              ...prev,
              [activeConv]: [
                ...(prev[activeConv] || []),
                {
                  id: newMsg.id || Date.now(),
                  from: 'partner',
                  text: newMsg.content,
                  time: new Date(newMsg.sentAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  lang: 'German',
                  type: 'text',
                },
              ],
            }))
          }
        })
      },
      onError: () => {
        // Fallback to local demo mode seamlessly
      },
    })

    return () => {
      if (sub) sub.unsubscribe()
      client.deactivate()
    }
  }, [activeConv, user?.id])

  const handleSend = () => {
    if (!input.trim()) return
    const text = input.trim()
    const newMsg = {
      id: Date.now(),
      from: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lang: 'German',
      type: 'text',
    }

    setMessages(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), newMsg],
    }))
    setInput('')

    // 1. Send via WebSocket if connected
    const sentViaWs = sendStompMessage(stompClientRef.current, activeConv, text)
    if (!sentViaWs) {
      // 2. Or fallback to REST API
      sendChatMessage(activeConv, text).catch(() => {
        // Simulated local partner response when backend offline
        setTimeout(() => {
          const reply = {
            id: Date.now() + 1,
            from: 'partner',
            text: 'Super! Das verstehe ich gut. Wir können heute Abend telefonieren!',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            lang: 'German',
            type: 'text',
          }
          setMessages(prev => ({
            ...prev,
            [activeConv]: [...(prev[activeConv] || []), reply],
          }))
        }, 1800)
      })
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-page">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <div>
            <h2 className="heading-md" style={{ fontFamily: 'var(--font-display)' }}>Chats</h2>
            <div className="caption text-muted">Daily language exchanges</div>
          </div>
          <button className="btn btn-gold btn-sm">+ New</button>
        </div>

        <div className="chat-sidebar-search">
          <div className="input-group">
            <span className="input-icon">🔍</span>
            <input className="form-input" placeholder="Search chats…" style={{ paddingLeft: 38 }} />
          </div>
        </div>

        <div className="conversations-list">
          {CONVERSATIONS.map(c => (
            <div
              key={c.id}
              className={`conversation-item ${c.id === activeConv ? 'active' : ''}`}
              onClick={() => setActiveConv(c.id)}
            >
              <div className="relative shrink-0">
                <div className="avatar avatar-md avatar-gradient">{c.avatar}</div>
                <div className={`status-dot status-${c.status}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="body-sm truncate" style={{ fontWeight: 700 }}>
                    {c.name} {c.flag}
                  </span>
                  <span className="caption text-muted shrink-0">{c.time}</span>
                </div>
                <div className="caption text-muted truncate">{c.lastMsg}</div>
                <div className="swap-mini-badge mt-4">
                  {c.teaching} ⇄ {c.learning}
                </div>
              </div>
              {c.unread > 0 && <div className="unread-badge">{c.unread}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Conversation */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="flex items-center gap-12">
            <div className="relative shrink-0">
              <div className="avatar avatar-md" style={{ background: '#CDEBDD', color: '#1E2150', fontWeight: 800 }}>
                {partner.avatar}
              </div>
              <div className={`status-dot status-${partner.status}`} style={{ position: 'absolute', bottom: 0, right: 0 }} />
            </div>
            <div>
              <div className="body-sm flex items-center gap-6" style={{ fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {partner.name} {partner.flag}
                {partner.verified && <span className="verified-pill">✓ Verified</span>}
              </div>
              <div className="caption text-muted">
                {partner.city} · Teaches {partner.teaching} · Learns {partner.learning}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <button
              className="btn btn-gold btn-sm flex items-center gap-6"
              onClick={() => setCallModalOpen(true)}
              title="Launch 50/50 Voice Call"
            >
              <span>📞</span> 50/50 Practice Call
            </button>
            <button className="btn btn-ghost btn-icon" onClick={() => setShowInfo(!showInfo)}>
              ℹ️
            </button>
          </div>
        </div>

        {/* Parley Color Semantics Indicator Banner */}
        <div className="lang-semantics-banner">
          <span className="semantics-badge lilac-badge">Lilac = Target Language (German)</span>
          <span className="semantics-badge mint-badge">Mint = Native Language (English)</span>
          <span className="semantics-note">💡 Colour shows the language, not who sent it</span>
        </div>

        {/* Translation Tooltip Floating Card */}
        {activeTranslation && (
          <div className="translation-floating-tooltip">
            <div className="tooltip-word">"{activeTranslation.word}"</div>
            <div className="tooltip-meaning">→ {activeTranslation.meaning}</div>
            <button className="tooltip-close" onClick={() => setActiveTranslation(null)}>✕</button>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="messages-area">
          <div className="messages-date-divider">
            <span>Today</span>
          </div>

          {convMessages.map(msg => {
            // 1. Correction Card
            if (msg.type === 'correction') {
              return (
                <div key={msg.id} className="correction-card-wrapper">
                  <div className="gentle-correction-card">
                    <div className="correction-diff">
                      <s>{msg.wrongText}</s> <b>{msg.correctText}</b> {msg.sentence.replace(msg.correctText, '')}
                    </div>
                    <div className="correction-note">{msg.explanation}</div>
                    <div className="correction-actions-row mt-8">
                      <button
                        className={`chip ${msg.saved ? 'chip-saved' : 'chip-gold'}`}
                        onClick={() => handleSaveCorrection(msg.id, `Ich ${msg.correctText} ins Kino gegangen`)}
                        disabled={msg.saved}
                      >
                        {msg.saved ? '✓ Saved in Flashcards' : '🃏 Save to review'}
                      </button>
                      <button
                        className="chip chip-ghost"
                        onClick={() => addToast('Sent thanks to Lukas! 🙏', 'info')}
                      >
                        Thanks 🙏
                      </button>
                    </div>
                  </div>
                </div>
              )
            }

            // 2. Call Proposal Banner
            if (msg.type === 'call_proposed') {
              return (
                <div key={msg.id} className="call-proposal-card-wrapper">
                  <div className="call-proposal-card">
                    <div className="call-proposal-left">
                      <span className="proposal-icon">📅</span>
                      <div>
                        <div className="proposal-title">{msg.timeText}</div>
                        <div className="proposal-sub">{msg.subText}</div>
                      </div>
                    </div>
                    <button className="btn btn-gold btn-sm" onClick={() => setCallModalOpen(true)}>
                      Accept & Start Call 📞
                    </button>
                  </div>
                </div>
              )
            }

            // 3. Regular Chat Bubble
            const isMe = msg.from === 'me'
            return (
              <div
                key={msg.id}
                className={`parley-bubble-wrapper ${isMe ? 'bubble-right' : 'bubble-left'}`}
              >
                {!isMe && (
                  <div className="bubble-avatar-chip">{partner.avatar}</div>
                )}
                <div className={`parley-bubble ${isMe ? 'bubble-learning-me' : 'bubble-learning-partner'}`}>
                  <div className="bubble-text">
                    {msg.text.split(' ').map((w, idx) => (
                      <span
                        key={idx}
                        className="clickable-word"
                        onClick={() => handleWordClick(w)}
                        title="Tap to translate"
                      >
                        {w}{' '}
                      </span>
                    ))}
                  </div>
                  {msg.subHint && (
                    <div className="bubble-hint-caption">{msg.subHint}</div>
                  )}
                  <div className="bubble-meta">{msg.time}</div>
                </div>
              </div>
            )
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="parley-composer-container">
          <button className="composer-action-btn" title="Voice note">
            🎤
          </button>
          <input
            className="parley-input-pill"
            placeholder={`Type in ${partner.teaching}…`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            className="composer-send-pill"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            ↑
          </button>
        </div>
      </div>

      {/* 50/50 Live Practice Call Modal */}
      {callModalOpen && (
        <PracticeSessionModal
          partner={partner}
          onClose={() => setCallModalOpen(false)}
          onSaveVocab={(vocab) => {
            addToast(`Vocab note "${vocab}" saved to flashcards! 🃏`, 'success')
          }}
        />
      )}
    </div>
  )
}
