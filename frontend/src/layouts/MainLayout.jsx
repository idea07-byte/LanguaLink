/* ============================================================
   MainLayout — Sidebar + Header + Live Notifications + Main Content
   ============================================================ */
import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../api/notifications'
import './MainLayout.css'

const NAV_ITEMS = [
  { to: '/learn',      icon: '📖', label: 'Learn'      },
  { to: '/partners',   icon: '👥', label: 'Partners'   },
  { to: '/chat',       icon: '💬', label: 'Chats'      },
  { to: '/dashboard',  icon: '⊞', label: 'Dashboard'  },
  { to: '/ai-tutor',   icon: '🤖', label: 'AI Tutor'  },
  { to: '/flashcards', icon: '🃏', label: 'Flashcards' },
  { to: '/profile',    icon: '👤', label: 'Me'         },
]

export default function MainLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    // Auto-refresh unread badge every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const [list, count] = await Promise.all([
        getNotifications(),
        getUnreadNotificationsCount(),
      ])
      setNotifications(list)
      setUnreadCount(count)
    } catch (err) {
      console.warn('Could not load notifications:', err)
    }
  }

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markNotificationAsRead(notif.id)
        setNotifications(notifications.map(n => n.id === notif.id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      setNotifOpen(false)
      if (notif.link) {
        navigate(notif.link)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const getNotifIcon = (type) => {
    switch (type) {
      case 'MESSAGE': return '💬'
      case 'CONNECTION_REQUEST': return '👥'
      case 'CONNECTION_ACCEPTED': return '🤝'
      case 'FLASHCARD_REMINDER': return '🃏'
      case 'AI_LEARNING': return '🤖'
      default: return '🔔'
    }
  }

  return (
    <div className="main-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
            </svg>
          </div>
          <span className="sidebar-logo-text">LinguaLink</span>
        </div>

        {/* User mini profile */}
        <div className="sidebar-user">
          <div className="avatar avatar-md avatar-gradient">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="body-sm truncate" style={{ fontWeight: 600 }}>{user?.name}</div>
            <div className="caption text-muted truncate">{user?.learningLanguages?.[0] || 'Language'} learner</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="status-dot status-online" />
          </div>
        </div>

        {/* XP Progress */}
        <div className="sidebar-xp">
          <div className="flex justify-between caption text-muted mb-4">
            <span>⚡ {user?.xp?.toLocaleString() || 100} XP</span>
            <span>🔥 {user?.streak || 1} day streak</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(100, ((user?.xp || 100) % 1000) / 10)}%` }} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.to === '/chat' && unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </NavLink>
          <button className="nav-item nav-item-danger" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="main-area">
        {/* Header */}
        <header className="header">
          <button
            className="btn btn-ghost btn-icon hide-desktop"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="header-search">
            <span className="input-icon">🔍</span>
            <input
              className="form-input"
              placeholder="Search partners, languages, topics…"
              style={{ paddingLeft: 40, width: 280 }}
            />
          </div>

          <div className="header-actions">
            {/* Phase 16: Live Notifications Bell */}
            <div className="relative">
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                id="notifications-bell-btn"
              >
                <span style={{ position: 'relative' }}>
                  🔔
                  {unreadCount > 0 && (
                    <span className="notif-dot" title={`${unreadCount} unread`} />
                  )}
                </span>
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="heading-sm">Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button className="btn btn-ghost btn-sm text-accent" onClick={handleMarkAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="p-20 text-center caption text-muted">
                      No notifications right now.
                    </div>
                  ) : (
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notif-item ${!n.isRead ? 'notif-item-unread' : ''}`}
                          onClick={() => handleNotificationClick(n)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="notif-icon">{getNotifIcon(n.type)}</div>
                          <div style={{ flex: 1 }}>
                            <div className="body-sm font-600">{n.title}</div>
                            <div className="body-sm text-secondary" style={{ fontSize: '0.82rem' }}>{n.message}</div>
                            <div className="caption text-muted mt-2">
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}
                            </div>
                          </div>
                          {!n.isRead && (
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand-accent)' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile avatar */}
            <NavLink to="/profile">
              <div className="avatar avatar-md avatar-gradient" style={{ cursor: 'pointer' }}>{initials}</div>
            </NavLink>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
