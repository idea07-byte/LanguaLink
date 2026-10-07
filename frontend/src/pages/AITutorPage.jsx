import { useState, useRef, useEffect } from 'react'
import { checkGrammar, practiceConversation, generateAIFlashcards, getCorrectionsHistory } from '../api/ai'
import { createFlashcard } from '../api/flashcards'
import './AITutorPage.css'

const QUICK_PROMPTS = [
  "I didn't went to college.",
  "What did you do yesterday?",
  "I am agree with your opinion.",
  "Explain the difference between ser and estar",
  "Generate 5 vocabulary cards about travel",
]

const INITIAL_MESSAGES = [
  {
    id: 1, from: 'ai',
    text: "¡Hola! 👋 I'm your AI Language Tutor, powered by Gemini and Ollama with LinguaLink.\n\nI can check your grammar, converse with you interactively, and create vocabulary flashcards.\n\nTry sending a sentence or asking a question below!",
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
  },
]

const TUTOR_MODES = [
  { id: 'chat',    label: 'AI Conversation', icon: '💬', desc: 'Interactive conversational practice' },
  { id: 'grammar', label: 'Grammar Tutor',   icon: '📝', desc: 'Fix errors & explain rules' },
  { id: 'vocab',   label: 'Flashcard Gen',   icon: '🃏', desc: 'Generate vocabulary cards' },
]

export default function AITutorPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('chat')
  const [language, setLanguage] = useState('English')
  const [loading, setLoading] = useState(false)
  const [recentCorrections, setRecentCorrections] = useState([])
  const [statusMsg, setStatusMsg] = useState('')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    loadCorrectionsHistory()
  }, [])

  const loadCorrectionsHistory = async () => {
    try {
      const history = await getCorrectionsHistory()
      setRecentCorrections(history.slice(0, 5))
    } catch (err) {
      console.warn('Could not load corrections history:', err)
    }
  }

  const sendMessage = async (text) => {
    if (!text?.trim() || loading) return
    const userText = text.trim()

    const userMsg = {
      id: Date.now(),
      from: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setStatusMsg('')

    try {
      if (mode === 'grammar') {
        // Phase 11: AI Grammar Correction
        const res = await checkGrammar(userText, language)
        const responseText = res.isCorrect
          ? `✅ Excellent! Your sentence is grammatically correct:\n"${res.correctedText}"\n\n💡 ${res.explanation}`
          : `🔍 Correction:\n"${res.correctedText}"\n\n📖 Rule: ${res.grammarRule || 'Grammar Standard'}\n💡 Explanation: ${res.explanation}`

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          from: 'ai',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
          correction: res,
        }])
        loadCorrectionsHistory()

      } else if (mode === 'vocab') {
        // Phase 13: AI Flashcard Generation
        const cards = await generateAIFlashcards(userText, 4, language)
        let responseText = `✨ Generated ${cards.length} new flashcards about "${userText}" and saved them to your deck:\n\n`
        cards.forEach((c, idx) => {
          responseText += `${idx + 1}. **${c.front}**: ${c.back}\n   Example: "${c.example || ''}"\n\n`
        })

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          from: 'ai',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
        }])
        setStatusMsg(`Saved ${cards.length} cards to your Flashcard deck!`)

      } else {
        // Phase 12: AI Conversation Practice
        const historyPayload = messages.slice(-4).map(m => ({
          role: m.from === 'user' ? 'user' : 'model',
          content: m.text,
        }))

        const res = await practiceConversation(userText, language, 'Intermediate', historyPayload)

        let replyText = res.reply || "Good attempt!"
        if (res.correction && res.correction.trim()) {
          replyText = `💡 Gentle Tip: ${res.correction}\n${res.explanation ? `(${res.explanation})\n\n` : '\n\n'}` + replyText
        }
        if (res.followUpQuestion && res.followUpQuestion.trim()) {
          replyText += `\n\n❓ ${res.followUpQuestion}`
        }

        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          from: 'ai',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
        }])
      }
    } catch (err) {
      console.error('AI Error:', err)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'ai',
        text: `I'm having a little trouble connecting right now, but here is a quick note on "${userText}": Keep practicing and reviewing your vocabulary daily!`,
        time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const addWordOfDayToCards = async () => {
    try {
      await createFlashcard({
        front: 'Madrugada',
        back: 'The early hours of the morning, just before dawn',
        example: 'Me desperté en la madrugada y no pude dormir.',
        language: 'Spanish',
      })
      setStatusMsg('Added "Madrugada" to your Flashcards! 🎴')
      setTimeout(() => setStatusMsg(''), 4000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="ai-tutor-page">
      {/* Left: AI Chat */}
      <div className="ai-chat-area">
        {/* Header */}
        <div className="ai-chat-header">
          <div className="flex items-center gap-12">
            <div className="ai-avatar-circle">🤖</div>
            <div>
              <div className="heading-sm">AI Language Tutor</div>
              <div className="caption">
                <span className="badge badge-success" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>🟢 Online</span>
                <span className="text-muted ml-8">Gemini & Ollama Backend</span>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <select
              className="form-input"
              style={{ width: 'auto', height: 36, fontSize: '0.85rem' }}
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {['English', 'Spanish', 'French', 'German', 'Japanese', 'Tamil', 'Korean'].map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={() => setMessages(INITIAL_MESSAGES)}>
              🔄 Reset
            </button>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="ai-mode-tabs">
          {TUTOR_MODES.map(m => (
            <button
              key={m.id}
              className={`ai-mode-tab ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
              title={m.desc}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {statusMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 8, padding: '8px 16px', margin: '8px 16px', color: '#10B981', fontSize: '0.85rem' }}>
            ✓ {statusMsg}
          </div>
        )}

        {/* Messages */}
        <div className="ai-messages">
          {messages.map(msg => (
            <div key={msg.id} className={`ai-msg ${msg.from === 'user' ? 'ai-msg-user' : 'ai-msg-ai'}`}>
              {msg.from === 'ai' && <div className="ai-msg-avatar">🤖</div>}
              <div className={`ai-msg-bubble ${msg.from === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
                <div className="ai-msg-text" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                <div className="ai-msg-time">{msg.time}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="ai-msg ai-msg-ai">
              <div className="ai-msg-avatar">🤖</div>
              <div className="ai-msg-bubble bubble-ai ai-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="ai-input-area">
          <div className="quick-prompts-scroll">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} className="quick-prompt-chip" onClick={() => sendMessage(p)}>
                {p}
              </button>
            ))}
          </div>
          <div className="ai-input-row">
            <textarea
              ref={inputRef}
              className="chat-textarea"
              placeholder={
                mode === 'grammar'
                  ? 'Enter any sentence to check and correct grammar…'
                  : mode === 'vocab'
                  ? 'Enter a topic to generate flashcards (e.g. Travel, Business, Food)…'
                  : `Chat casually with your ${language} AI tutor…`
              }
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              disabled={loading}
              id="ai-message-input"
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              id="ai-send-btn"
            >
              {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '➤ Send'}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Study tools */}
      <div className="ai-sidebar">
        {/* Word of Day */}
        <div className="card ai-word-of-day">
          <div className="flex justify-between items-center mb-12">
            <span className="caption text-muted font-600">📖 WORD OF THE DAY</span>
            <span className="badge badge-primary">Spanish</span>
          </div>
          <div className="wod-word">Madrugada</div>
          <div className="wod-pronunciation text-muted caption">/ma·dru·ˈga·da/</div>
          <div className="wod-meaning body-sm mt-8">
            <strong>noun</strong> — The early hours of the morning, just before dawn.
          </div>
          <div className="wod-example caption text-secondary mt-8 italic">
            "Me desperté en la madrugada y no pude dormir."<br/>
            (I woke up in the early hours and couldn't sleep.)
          </div>
          <button className="btn btn-outline btn-full btn-sm mt-14" onClick={addWordOfDayToCards}>
            Add to Flashcards +
          </button>
        </div>

        {/* Phase 11: Past Corrections */}
        <div className="card mt-16">
          <h3 className="heading-sm mb-14">📝 Recent AI Corrections</h3>
          {recentCorrections.length === 0 ? (
            <div className="caption text-muted">No corrections recorded yet. Switch to Grammar mode and check a sentence!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recentCorrections.map((c) => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8, fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--brand-danger)', textDecoration: 'line-through' }}>{c.originalText}</div>
                  <div style={{ color: 'var(--brand-success)', fontWeight: 600 }}>{c.correctedText}</div>
                  <div className="caption text-muted" style={{ marginTop: 4 }}>{c.grammarRule}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Stats */}
        <div className="card mt-16">
          <h3 className="heading-sm mb-16">📊 Today's Session</h3>
          <div className="ai-session-stats">
            <div className="ai-stat">
              <span className="heading-md text-accent">{messages.filter(m => m.from === 'user').length}</span>
              <span className="caption text-muted">Messages</span>
            </div>
            <div className="ai-stat">
              <span className="heading-md" style={{ color: 'var(--brand-success)' }}>{recentCorrections.length}</span>
              <span className="caption text-muted">Corrections</span>
            </div>
            <div className="ai-stat">
              <span className="heading-md" style={{ color: 'var(--brand-warning)' }}>{language}</span>
              <span className="caption text-muted">Target</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
