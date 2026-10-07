import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { fetchLanguages, FALLBACK_LANGUAGES } from '../api/languages'
import './ProfilePage.css'

const LEVELS = ['Beginner','Elementary','Pre-Intermediate','Intermediate','Upper-Intermediate','Advanced']

const ACTIVITY = [
  { icon:'💬', text:'Chatted with Maria Santos', time:'2h ago' },
  { icon:'🃏', text:'Reviewed 20 flashcards', time:'4h ago' },
  { icon:'🤖', text:'AI Tutor session — 30 min', time:'Yesterday' },
  { icon:'👥', text:'Connected with Yuki Tanaka', time:'2 days ago' },
  { icon:'⭐', text:'Earned "Consistent Learner" badge', time:'3 days ago' },
]

const BADGES = [
  { icon:'🔥', label:'30-Day Streak',     earned:true  },
  { icon:'💬', label:'100 Messages',      earned:true  },
  { icon:'🃏', label:'500 Words',         earned:true  },
  { icon:'🌟', label:'Top Learner',       earned:false },
  { icon:'🌍', label:'5 Countries',       earned:false },
  { icon:'⭐', label:'1000 XP',           earned:true  },
  { icon:'🎓', label:'Grammar Master',    earned:false },
  { icon:'👥', label:'10 Partners',       earned:false },
]

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [languages, setLanguages] = useState(FALLBACK_LANGUAGES)

  useEffect(() => {
    fetchLanguages().then(list => {
      if (list && list.length > 0) setLanguages(list)
    })
  }, [])
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || 'Language enthusiast passionate about connecting with people around the world through conversation.',
    nativeLanguage: user?.nativeLanguage || 'English',
    level: user?.level || 'Intermediate',
    timezone: 'UTC+5:30',
    availability: 'Weekday evenings, weekends',
  })
  const [activeTab, setActiveTab] = useState('about')

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const handleSave = () => {
    updateUser(form)
    setEditing(false)
    addToast('Profile updated! ✅', 'success')
  }

  return (
    <div className="profile-page">
      {/* Profile header */}
      <div className="profile-header card">
        <div className="profile-header-bg" />
        <div className="profile-header-content">
          <div className="profile-avatar-wrap">
            <div className="avatar avatar-xl avatar-gradient profile-avatar">{initials}</div>
            {editing && (
              <button className="avatar-edit-btn btn btn-outline btn-sm">📷 Change</button>
            )}
            <div className="status-dot status-online" style={{ position:'absolute', bottom:4, right:4, width:14, height:14, border:'3px solid var(--bg-card)' }} />
          </div>
          <div className="profile-header-info">
            <div className="flex items-center gap-12 flex-wrap">
              {editing ? (
                <input className="form-input" style={{ fontSize:'1.5rem', fontWeight:700, maxWidth:280, padding:'6px 12px' }}
                  value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} id="profile-name-input" />
              ) : (
                <h1 className="display-md">{user?.name}</h1>
              )}
              <span className="badge badge-success">🟢 Online</span>
            </div>
            <div className="flex gap-16 mt-8 flex-wrap">
              <span className="body-sm text-secondary">🌐 {user?.nativeLanguage} native</span>
              <span className="body-sm text-secondary">📍 India</span>
              <span className="body-sm text-secondary">⏰ UTC+5:30</span>
            </div>
            <div className="flex gap-8 mt-10 flex-wrap">
              {(user?.learningLanguages || ['Spanish']).map(l => (
                <span key={l} className="badge badge-cyan">{l}</span>
              ))}
              <span className="badge badge-primary">{user?.level || 'Intermediate'}</span>
            </div>
          </div>
          <div className="profile-header-actions">
            {editing ? (
              <>
                <button className="btn btn-primary" onClick={handleSave} id="profile-save-btn">Save Changes</button>
                <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn btn-outline" onClick={() => setEditing(true)} id="profile-edit-btn">✏️ Edit Profile</button>
            )}
          </div>
        </div>

        {/* XP + Stats row */}
        <div className="profile-stats-row">
          <div className="profile-stat">
            <span className="heading-md gradient-text">⚡ {user?.xp?.toLocaleString()}</span>
            <span className="caption text-muted">XP Total</span>
          </div>
          <div className="profile-stat">
            <span className="heading-md" style={{ color:'var(--brand-warning)' }}>🔥 {user?.streak}</span>
            <span className="caption text-muted">Day Streak</span>
          </div>
          <div className="profile-stat">
            <span className="heading-md" style={{ color:'var(--brand-secondary)' }}>👥 {user?.partnersCount || 8}</span>
            <span className="caption text-muted">Partners</span>
          </div>
          <div className="profile-stat">
            <span className="heading-md" style={{ color:'var(--brand-success)' }}>🃏 523</span>
            <span className="caption text-muted">Words Learned</span>
          </div>
          <div className="profile-stat">
            <span className="heading-md" style={{ color:'var(--brand-danger)' }}>💬 247</span>
            <span className="caption text-muted">Messages</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar mt-20">
        {[['about','About'],['badges','Badges'],['activity','Activity'],['languages','Languages']].map(([id,label]) => (
          <button key={id} className={`tab-item ${activeTab===id ? 'active' : ''}`} onClick={() => setActiveTab(id)} id={`profile-tab-${id}`}>{label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div className="profile-content mt-20">
        {activeTab === 'about' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="heading-md mb-16">📝 Bio</h3>
              {editing ? (
                <textarea className="form-input" rows={4} value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))} id="profile-bio" />
              ) : (
                <p className="body-sm text-secondary">{form.bio}</p>
              )}
              <div className="divider mt-16 mb-16" />
              <h3 className="heading-md mb-12">⚙️ Learning Details</h3>
              {[
                ['Native Language', form.nativeLanguage, 'nativeLanguage'],
                ['Level',           form.level,          'level'],
                ['Timezone',        form.timezone,        'timezone'],
                ['Availability',    form.availability,    'availability'],
              ].map(([label, value, key]) => (
                <div key={key} className="detail-row">
                  <span className="caption text-muted">{label}</span>
                  {editing ? (
                    key === 'nativeLanguage' ? (
                      <select className="form-input" style={{ maxWidth:180, padding:'6px 10px', height:34 }}
                        value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}>
                        {languages.map(l => (
                          <option key={l.code || l.id} value={l.name}>
                            {l.flag ? `${l.flag} ` : ''}{l.name}
                          </option>
                        ))}
                      </select>
                    ) : key === 'level' ? (
                      <select className="form-input" style={{ maxWidth:200, padding:'6px 10px', height:34 }}
                        value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))}>
                        {LEVELS.map(l => <option key={l}>{l}</option>)}
                      </select>
                    ) : (
                      <input className="form-input" style={{ maxWidth:220, padding:'6px 10px', height:34 }}
                        value={form[key]} onChange={e => setForm(p => ({...p, [key]: e.target.value}))} />
                    )
                  ) : (
                    <span className="body-sm">{value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="heading-md mb-16">📊 Language Progress</h3>
              {[
                { lang:'Spanish', level:'B2 Intermediate', xp:2450, max:3000, flag:'🇪🇸' },
                { lang:'Japanese',level:'A2 Elementary',   xp:820,  max:2000, flag:'🇯🇵' },
              ].map(l => (
                <div key={l.lang} className="lang-progress-entry">
                  <div className="flex items-center gap-10 mb-6">
                    <span style={{ fontSize: 1.4+'rem' }}>{l.flag}</span>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="body-sm" style={{ fontWeight:600 }}>{l.lang}</span>
                        <span className="badge badge-cyan">{l.level}</span>
                      </div>
                    </div>
                  </div>
                  <div className="progress-bar mb-4">
                    <div className="progress-fill" style={{ width: `${(l.xp/l.max)*100}%` }} />
                  </div>
                  <div className="caption text-muted">{l.xp.toLocaleString()} / {l.max.toLocaleString()} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="card">
            <h3 className="heading-md mb-20">🏆 Achievements ({BADGES.filter(b => b.earned).length}/{BADGES.length})</h3>
            <div className="badges-grid">
              {BADGES.map((b, i) => (
                <div key={i} className={`badge-card ${b.earned ? 'earned' : 'locked'}`}>
                  <div className="badge-card-icon">{b.icon}</div>
                  <span className="caption text-center">{b.label}</span>
                  {!b.earned && <span className="caption text-muted" style={{ fontSize:'0.65rem' }}>🔒 Locked</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="card">
            <h3 className="heading-md mb-20">📅 Recent Activity</h3>
            <div className="activity-feed">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="activity-icon">{a.icon}</div>
                  <div className="flex-1">
                    <div className="body-sm">{a.text}</div>
                    <div className="caption text-muted">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'languages' && (
          <div className="card">
            <div className="flex justify-between items-center mb-20">
              <h3 className="heading-md">🌍 Language Portfolio</h3>
              <button className="btn btn-primary btn-sm" id="add-language-btn">+ Add Language</button>
            </div>
            <div className="languages-portfolio">
              {[
                { lang:'English',  level:'Native',       flag:'🇺🇸', percent:100, color:'var(--brand-success)' },
                { lang:'Spanish',  level:'Intermediate', flag:'🇪🇸', percent:65, color:'var(--brand-primary)' },
                { lang:'Japanese', level:'Elementary',   flag:'🇯🇵', percent:30, color:'var(--brand-danger)' },
              ].map(l => (
                <div key={l.lang} className="lang-portfolio-item">
                  <span style={{ fontSize:'1.8rem' }}>{l.flag}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-6">
                      <span className="body-sm" style={{ fontWeight:600 }}>{l.lang}</span>
                      <span className="badge badge-primary">{l.level}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width:`${l.percent}%`, background: l.color }} />
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm">✏️</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
