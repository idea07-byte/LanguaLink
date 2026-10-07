/* ============================================================
   ChatPage — HelloTalk Real-Time Conversation (Screen 3)
   ============================================================ */
import React, { useState, useRef, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import PracticeSessionModal from '../components/PracticeSessionModal'
import { fetchConversations, fetchConversationMessages, sendChatMessage } from '../api/chat'
import { createStompClient, subscribeToConversation, sendStompMessage } from '../api/websocket'
import './ChatPage.css'

const CONVERSATIONS = [
  {
    id: 1,
    name: 'Bilal Yusuf',
    flag: '🇸🇪',
    genderAge: '♂ 18',
    country: 'Sweden',
    status: 'online',
    tags: ['Sport', 'Software'],
    lastMsg: 'Where do you live?',
    time: '23:05',
    unread: 1,
    avatar: 'BY',
    teaching: 'SWE',
    learning: 'ENG',
  },
  {
    id: 2,
    name: 'Furkan',
    flag: '🇷🇺',
    genderAge: '♂ 22',
    country: 'Russia',
    status: 'online',
    tags: ['Dance', 'Languages'],
    lastMsg: 'Hola! Practicamos hoy?',
    time: '21:10',
    unread: 0,
    avatar: 'FK',
    teaching: 'RU',
    learning: 'ES',
  },
  {
    id: 3,
    name: 'Yağmur',
    flag: '🇹🇷',
    genderAge: '♀ 21',
    country: 'Turkey',
    status: 'online',
    tags: ['Anime', 'Art'],
    lastMsg: 'Konnichiwa! How is your day?',
    time: '18:45',
    unread: 0,
    avatar: 'YG',
    teaching: 'TUR',
    learning: 'JA',
  },
  {
    id: 4,
    name: 'Maria Santos',
    flag: '🇧🇷',
    genderAge: '♀ 25',
    country: 'Brazil',
    status: 'away',
    tags: ['Music', 'Travel'],
    lastMsg: 'See you tomorrow for voice call!',
    time: '14:20',
    unread: 0,
    avatar: 'MS',
    teaching: 'POR',
    learning: 'ENG',
  },
]

// Mock initial messages matching Behance Screen 3
const INITIAL_MESSAGES = {
  1: [
    {
      id: 1,
      from: 'me',
      text: "Hey, hi Bilal, how's it going?",
      time: '23:05',
      type: 'text',
    },
    {
      id: 2,
      from: 'partner',
      text: 'Hi buddy, you seem to be doing well. Where do you live?',
      translatedText: 'Selam dostum, iyi görünüyorsun. Nerede yaşıyorsun?',
      grammarTip: '"seem to be doing" is a natural idiom for checking in politely!',
      time: '23:05',
      type: 'text',
    },
    {
      id: 3,
      from: 'me',
      text: 'USA, I think you are in Sweden',
      time: '23:06',
      type: 'text',
    },
  ],
  2: [
    { id: 1, from: 'partner', text: '¡Hola! ¿Cómo estás?', translatedText: 'Hello! How are you?', time: '21:05', type: 'text' },
    { id: 2, from: 'me', text: '¡Muy bien! Ready to practice Spanish!', time: '21:08', type: 'text' },
  ],
}

export default function ChatPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user } = useAuth()

  const [activeConv, setActiveConv] = useState(id ? parseInt(id) : 1)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [translatedMsgIds, setTranslatedMsgIds] = useState({ 2: true }) // Show translation for mockup fidelity
  const [callModalOpen, setCallModalOpen] = useState(false)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false)

  const messagesEndRef = useRef(null)
  const stompClientRef = useRef(null)

  const partner = CONVERSATIONS.find(c => c.id === activeConv) || CONVERSATIONS[0]
  const convMessages = messages[activeConv] || []

  useEffect(() => {
    if (location.state?.initialPrompt) {
      setInput(location.state.initialPrompt)
    }
  }, [location.state])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeConv])

  // WebSocket Subscription
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
                  type: 'text',
                },
              ],
            }))
          }
        })
      },
      onError: () => {
        // Fallback gracefully
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
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMsg = {
      id: Date.now(),
      from: 'me',
      text,
      time: nowTime,
      type: 'text',
    }

    setMessages(prev => ({
      ...prev,
      [activeConv]: [...(prev[activeConv] || []), newMsg],
    }))
    setInput('')

    // WebSocket / REST Dispatch
    const sentViaWs = sendStompMessage(stompClientRef.current, activeConv, text)
    if (!sentViaWs) {
      sendChatMessage(activeConv, text).catch(() => {
        // Auto simulated buddy reply
        setTimeout(() => {
          const autoReply = {
            id: Date.now() + 1,
            from: 'partner',
            text: `Yes, exactly! I am based in Stockholm. Would love to voice chat soon!`,
            translatedText: `Evet, kesinlikle! Stockholm'deyim. Yakında sesli sohbet etmeyi çok isterim!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
          }
          setMessages(prev => ({
            ...prev,
            [activeConv]: [...(prev[activeConv] || []), autoReply],
          }))
        }, 1500)
      })
    }
  }

  const toggleTranslation = (msgId) => {
    setTranslatedMsgIds(prev => ({
      ...prev,
      [msgId]: !prev[msgId],
    }))
    addToast('Instant translation toggled! 🌐', 'info')
  }

  return (
    <div className="hellotalk-chat-layout">
      {/* Optional Conversations Sidebar */}
      <div className={`chat-conversations-panel ${sidebarMobileOpen ? 'open' : ''}`}>
        <div className="conv-panel-header">
          <span className="conv-panel-title">Messages</span>
          <button
            className="conv-close-mobile-btn"
            onClick={() => setSidebarMobileOpen(false)}
          >
            ✕
          </button>
        </div>

        <div className="conv-items-list">
          {CONVERSATIONS.map(c => (
            <div
              key={c.id}
              className={`conv-list-item ${c.id === activeConv ? 'active-conv' : ''}`}
              onClick={() => {
                setActiveConv(c.id)
                setSidebarMobileOpen(false)
              }}
            >
              <div className="avatar-wrapper">
                <div className="partner-avatar-circle" style={{ width: 44, height: 44, fontSize: '1rem' }}>
                  {c.avatar}
                </div>
                <span className="avatar-flag-badge" style={{ width: 18, height: 18, fontSize: '0.75rem' }}>
                  {c.flag}
                </span>
              </div>
              <div className="conv-info-col">
                <div className="flex justify-between items-center">
                  <span className="conv-name">{c.name}</span>
                  <span className="conv-time">{c.time}</span>
                </div>
                <p className="conv-snippet">{c.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Canvas matching HelloTalk Right Screen */}
      <div className="chat-viewport-card">
        {/* Header Bar: Back Arrow, Title "Chat", Phone Call Icon */}
        <div className="chat-top-navbar">
          <div className="flex items-center gap-12">
            <button
              type="button"
              className="chat-nav-back-btn"
              onClick={() => navigate('/partners')}
              title="Back to Partners"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <h2 className="chat-title-text">Chat</h2>
          </div>

          <div className="flex items-center gap-8">
            {/* Toggle conversations list on small screens */}
            <button
              type="button"
              className="chat-conv-toggle-btn"
              onClick={() => setSidebarMobileOpen(!sidebarMobileOpen)}
              title="Conversations"
            >
              💬
            </button>
            {/* Phone Call Icon Button */}
            <button
              type="button"
              className="chat-call-action-btn"
              onClick={() => setCallModalOpen(true)}
              title="Start Voice / Video Session"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Partner Sub-header Area: Avatar, Name + Gender/Age pill, Interest tags */}
        <div className="chat-partner-profile-subheader">
          <div className="avatar-wrapper">
            <div className="partner-avatar-circle" style={{ width: 50, height: 50 }}>
              {partner.avatar}
            </div>
            <span className="avatar-flag-badge">
              {partner.flag}
            </span>
          </div>

          <div className="chat-partner-details">
            <div className="chat-partner-name-row">
              <span className="partner-name">{partner.name}</span>
              {/* Gender / Age pill badge (e.g. ♂ 18) */}
              <span className="gender-age-pill">{partner.genderAge}</span>
            </div>

            {/* Interest Tags */}
            <div className="chat-partner-tags-row">
              {partner.tags.map(t => (
                <span key={t} className="chat-tag-pill">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Message Thread Area */}
        <div className="chat-messages-scroll-area">
          {/* Centered Date Separator: 07/01 15:33 */}
          <div className="chat-date-pill-wrapper">
            <span className="chat-date-pill">07/01 15:33</span>
          </div>

          {/* Messages */}
          {convMessages.map((msg) => {
            const isMe = msg.from === 'me'
            const isTranslated = translatedMsgIds[msg.id]

            if (isMe) {
              return (
                <div key={msg.id} className="msg-row msg-row-outgoing">
                  <div className="bubble-outgoing">
                    <p className="bubble-text">{msg.text}</p>
                    <span className="bubble-time-outgoing">{msg.time}</span>
                  </div>
                </div>
              )
            }

            return (
              <div key={msg.id} className="msg-row msg-row-incoming">
                <div className="bubble-incoming-container">
                  {/* The White Incoming Bubble with Purple Translation Badge */}
                  <div className="bubble-incoming">
                    {/* The Signature Purple Translation Badge 文A at top right */}
                    <button
                      type="button"
                      className="bubble-translation-badge"
                      onClick={() => toggleTranslation(msg.id)}
                      title="Tap to translate and view grammar tips"
                    >
                      文A
                    </button>

                    <p className="bubble-text">{msg.text}</p>
                    <span className="bubble-time-incoming">{msg.time}</span>
                  </div>

                  {/* Inline Translation Expansion */}
                  {isTranslated && msg.translatedText && (
                    <div className="bubble-translation-box">
                      <div className="trans-header">
                        <span className="trans-icon">🌐</span>
                        <span className="trans-title">Instant Translation</span>
                      </div>
                      <p className="trans-text">{msg.translatedText}</p>
                      {msg.grammarTip && (
                        <p className="trans-tip">💡 {msg.grammarTip}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Pill Input Bar: 😊 Mesaj... 🎙️ ➤ */}
        <div className="chat-bottom-composer-wrapper">
          <div className="hellotalk-composer-pill">
            {/* Emoji Button */}
            <button
              type="button"
              className="composer-emoji-btn"
              onClick={() => setInput(prev => prev + ' 😊')}
              title="Insert Emoji"
            >
              😊
            </button>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="composer-text-input"
            />

            {/* Mic / Voice Note Button */}
            <button
              type="button"
              className="composer-mic-btn"
              onClick={() => addToast('Voice message recording ready! 🎙️', 'info')}
              title="Record Voice Note"
            >
              🎙️
            </button>

            {/* Send Button */}
            <button
              type="button"
              className="composer-send-btn"
              onClick={handleSend}
              disabled={!input.trim()}
              title="Send Message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* Voice Practice Call Modal */}
      {callModalOpen && (
        <PracticeSessionModal
          partner={partner}
          onClose={() => setCallModalOpen(false)}
        />
      )}
    </div>
  )
}
