import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './SettingsPage.css'

const SECTIONS = [
  { id:'account',        icon:'👤', label:'Account' },
  { id:'notifications',  icon:'🔔', label:'Notifications' },
  { id:'privacy',        icon:'🔒', label:'Privacy' },
  { id:'appearance',     icon:'🎨', label:'Appearance' },
  { id:'language',       icon:'🌍', label:'Languages' },
  { id:'ai',             icon:'🤖', label:'AI Settings' },
  { id:'danger',         icon:'⚠️', label:'Danger Zone' },
]

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const { addToast } = useToast()
  const [section, setSection] = useState('account')
  const [notifs, setNotifs] = useState({
    messages:    true,
    partnerReq:  true,
    dailyRemind: true,
    xpUpdates:   false,
    newsletter:  false,
    soundNotifs: true,
  })
  const [privacy, setPrivacy] = useState({
    showOnline:    true,
    showProgress:  true,
    showLanguages: true,
    publicProfile: true,
    allowMessages: true,
  })
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    fontSize: 'medium',
    reducedMotion: false,
    compactMode: false,
  })
  const [aiSettings, setAiSettings] = useState({
    autoCorrect:   true,
    showAiHints:   true,
    aiLanguage:    'Spanish',
    strictMode:    false,
    pronunciationTips: true,
  })
  const [passwords, setPasswords] = useState({ current:'', newPass:'', confirm:'' })

  const toggleNotif   = k => setNotifs(p => ({...p, [k]:!p[k]}))
  const togglePrivacy = k => setPrivacy(p => ({...p, [k]:!p[k]}))
  const toggleAi      = k => setAiSettings(p => ({...p, [k]:!p[k]}))

  const save = (msg) => { addToast(msg || 'Settings saved ✅', 'success') }

  return (
    <div className="settings-page">
      {/* Sidebar */}
      <nav className="settings-nav card">
        <h2 className="heading-md mb-16">Settings</h2>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            className={`settings-nav-item ${section === s.id ? 'active' : ''} ${s.id === 'danger' ? 'danger' : ''}`}
            onClick={() => setSection(s.id)}
            id={`settings-nav-${s.id}`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="settings-content">

        {/* Account */}
        {section === 'account' && (
          <div className="settings-section card">
            <h2 className="heading-lg mb-4">Account Settings</h2>
            <p className="body-sm text-secondary mb-24">Manage your account information and security</p>

            <div className="settings-group">
              <h3 className="settings-group-title">Personal Information</h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input id="settings-name" className="form-input" defaultValue={user?.name} style={{ maxWidth: 360 }} />
              </div>
              <div className="form-group mt-14">
                <label className="form-label">Email Address</label>
                <input id="settings-email" type="email" className="form-input" defaultValue={user?.email} style={{ maxWidth: 360 }} />
              </div>
              <div className="form-group mt-14">
                <label className="form-label">Timezone</label>
                <select className="form-input" defaultValue="UTC+5:30" style={{ maxWidth: 260 }}>
                  {['UTC-8:00','UTC-5:00','UTC+0:00','UTC+1:00','UTC+5:30','UTC+8:00','UTC+9:00'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <button className="btn btn-primary mt-20" id="save-account-btn" onClick={() => save('Account updated ✅')}>Save Changes</button>
            </div>

            <div className="divider mt-24 mb-24" />

            <div className="settings-group">
              <h3 className="settings-group-title">Change Password</h3>
              {['current','newPass','confirm'].map((k,i) => (
                <div key={k} className={`form-group ${i>0?'mt-14':''}`}>
                  <label className="form-label">{['Current Password','New Password','Confirm New Password'][i]}</label>
                  <input type="password" className="form-input" style={{ maxWidth:360 }}
                    placeholder="••••••••" value={passwords[k]}
                    onChange={e => setPasswords(p => ({...p, [k]:e.target.value}))}
                    id={`settings-pass-${k}`} />
                </div>
              ))}
              <button className="btn btn-outline mt-20" id="change-password-btn" onClick={() => save('Password changed ✅')}>Change Password</button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {section === 'notifications' && (
          <div className="settings-section card">
            <h2 className="heading-lg mb-4">Notification Settings</h2>
            <p className="body-sm text-secondary mb-24">Control what you get notified about</p>
            <div className="settings-toggles">
              {[
                ['messages',    'New Messages',         'Get notified when you receive a chat message'],
                ['partnerReq',  'Partner Requests',     'New language partner requests'],
                ['dailyRemind', 'Daily Reminders',      'Remind me to review my flashcards daily'],
                ['xpUpdates',   'XP & Achievement News','Get notified about new badges and milestones'],
                ['newsletter',  'Newsletter',           'Weekly language tips and community news'],
                ['soundNotifs', 'Sound Notifications',  'Play a sound for new messages'],
              ].map(([k, label, desc]) => (
                <div key={k} className="settings-toggle-row">
                  <div className="flex-1">
                    <div className="body-sm" style={{ fontWeight:600 }}>{label}</div>
                    <div className="caption text-muted">{desc}</div>
                  </div>
                  <label className="toggle" id={`toggle-${k}`}>
                    <input type="checkbox" checked={notifs[k]} onChange={() => toggleNotif(k)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-20" onClick={() => save('Notification preferences saved ✅')}>Save Preferences</button>
          </div>
        )}

        {/* Privacy */}
        {section === 'privacy' && (
          <div className="settings-section card">
            <h2 className="heading-lg mb-4">Privacy Settings</h2>
            <p className="body-sm text-secondary mb-24">Control who can see your information</p>
            <div className="settings-toggles">
              {[
                ['showOnline',    'Show Online Status',   'Let partners see when you\'re online'],
                ['showProgress',  'Show Learning Progress','Display your XP and progress publicly'],
                ['showLanguages', 'Show Languages',        'Show your language portfolio on your profile'],
                ['publicProfile', 'Public Profile',        'Allow anyone to view your profile'],
                ['allowMessages', 'Allow Messages',        'Allow new partners to message you'],
              ].map(([k, label, desc]) => (
                <div key={k} className="settings-toggle-row">
                  <div className="flex-1">
                    <div className="body-sm" style={{ fontWeight:600 }}>{label}</div>
                    <div className="caption text-muted">{desc}</div>
                  </div>
                  <label className="toggle" id={`toggle-privacy-${k}`}>
                    <input type="checkbox" checked={privacy[k]} onChange={() => togglePrivacy(k)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-20" onClick={() => save('Privacy settings saved ✅')}>Save Privacy</button>
          </div>
        )}

        {/* Appearance */}
        {section === 'appearance' && (
          <div className="settings-section card">
            <h2 className="heading-lg mb-4">Appearance</h2>
            <p className="body-sm text-secondary mb-24">Customize how LinguaLink looks</p>

            <div className="settings-group">
              <h3 className="settings-group-title">Theme</h3>
              <div className="theme-options">
                {['dark','light','system'].map(t => (
                  <button
                    key={t} className={`theme-option ${appearance.theme===t?'selected':''}`}
                    onClick={() => setAppearance(p=>({...p, theme:t}))} id={`theme-${t}`}
                  >
                    <span className="theme-icon">{t==='dark'?'🌙':t==='light'?'☀️':'💻'}</span>
                    <span className="body-sm">{t.charAt(0).toUpperCase()+t.slice(1)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-group mt-20">
              <h3 className="settings-group-title">Font Size</h3>
              <div className="font-size-options">
                {['small','medium','large'].map(s => (
                  <button
                    key={s} className={`font-option ${appearance.fontSize===s?'selected':''}`}
                    onClick={() => setAppearance(p=>({...p, fontSize:s}))} id={`font-${s}`}
                  >
                    {s==='small'?'A':s==='medium'?'A':'A'} {s.charAt(0).toUpperCase()+s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-toggles mt-20">
              {[
                ['reducedMotion','Reduce Motion','Minimize animations for accessibility'],
                ['compactMode','Compact Mode','Show more content with less spacing'],
              ].map(([k,label,desc]) => (
                <div key={k} className="settings-toggle-row">
                  <div className="flex-1">
                    <div className="body-sm" style={{fontWeight:600}}>{label}</div>
                    <div className="caption text-muted">{desc}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={appearance[k]} onChange={()=>setAppearance(p=>({...p,[k]:!p[k]}))} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt-20" onClick={() => save('Appearance saved ✅')}>Apply Changes</button>
          </div>
        )}

        {/* AI Settings */}
        {section === 'ai' && (
          <div className="settings-section card">
            <h2 className="heading-lg mb-4">AI Tutor Settings</h2>
            <p className="body-sm text-secondary mb-24">Configure how the AI assistant helps you</p>
            <div className="settings-toggles">
              {[
                ['autoCorrect','Auto-Correct Grammar','Automatically highlight and correct grammar mistakes in chat'],
                ['showAiHints','Show AI Hints','Display contextual language tips while chatting'],
                ['strictMode','Strict Mode','Be more strict about corrections (advanced learners)'],
                ['pronunciationTips','Pronunciation Tips','Include pronunciation guidance with new vocabulary'],
              ].map(([k,label,desc]) => (
                <div key={k} className="settings-toggle-row">
                  <div className="flex-1">
                    <div className="body-sm" style={{fontWeight:600}}>{label}</div>
                    <div className="caption text-muted">{desc}</div>
                  </div>
                  <label className="toggle" id={`toggle-ai-${k}`}>
                    <input type="checkbox" checked={aiSettings[k]} onChange={() => toggleAi(k)} />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <div className="form-group mt-20">
              <label className="form-label">Primary AI Tutor Language</label>
              <select className="form-input" style={{ maxWidth:220 }} value={aiSettings.aiLanguage}
                onChange={e=>setAiSettings(p=>({...p,aiLanguage:e.target.value}))}>
                {['Spanish','French','Japanese','German','Korean','Italian'].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <button className="btn btn-primary mt-20" onClick={() => save('AI settings saved ✅')}>Save AI Settings</button>
          </div>
        )}

        {/* Danger zone */}
        {section === 'danger' && (
          <div className="settings-section card">
            <h2 className="heading-lg mb-4" style={{ color:'var(--brand-danger)' }}>⚠️ Danger Zone</h2>
            <p className="body-sm text-secondary mb-24">These actions are permanent and cannot be undone</p>
            <div className="danger-actions">
              <div className="danger-action">
                <div>
                  <div className="body-sm" style={{ fontWeight:600 }}>Export My Data</div>
                  <div className="caption text-muted">Download all your data including messages, flashcards, and progress</div>
                </div>
                <button className="btn btn-outline btn-sm" id="export-data-btn">📥 Export</button>
              </div>
              <div className="danger-action">
                <div>
                  <div className="body-sm" style={{ fontWeight:600 }}>Delete All Flashcards</div>
                  <div className="caption text-muted">Permanently delete all your flashcard decks and progress</div>
                </div>
                <button className="btn btn-danger btn-sm" id="delete-cards-btn">🗑️ Delete Cards</button>
              </div>
              <div className="danger-action">
                <div>
                  <div className="body-sm" style={{ fontWeight:600 }}>Delete Account</div>
                  <div className="caption text-muted">Permanently delete your account and all associated data. This cannot be undone.</div>
                </div>
                <button className="btn btn-danger btn-sm" id="delete-account-btn">💀 Delete Account</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
