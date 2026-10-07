import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage  from './pages/DashboardPage'
import LearnPage      from './pages/LearnPage'
import PartnersPage   from './pages/PartnersPage'
import ChatPage       from './pages/ChatPage'
import AITutorPage    from './pages/AITutorPage'
import FlashcardsPage from './pages/FlashcardsPage'
import ProfilePage    from './pages/ProfilePage'
import SettingsPage   from './pages/SettingsPage'

// Route guards
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login"    element={<GuestRoute><AuthLayout><LoginPage /></AuthLayout></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><AuthLayout><RegisterPage /></AuthLayout></GuestRoute>} />
            <Route path="/onboarding" element={<PrivateRoute><OnboardingPage /></PrivateRoute>} />

            {/* App (authenticated) */}
            <Route path="/dashboard"  element={<PrivateRoute><MainLayout><DashboardPage /></MainLayout></PrivateRoute>} />
            <Route path="/learn"      element={<PrivateRoute><MainLayout><LearnPage /></MainLayout></PrivateRoute>} />
            <Route path="/partners"   element={<PrivateRoute><MainLayout><PartnersPage /></MainLayout></PrivateRoute>} />
            <Route path="/chat"       element={<PrivateRoute><MainLayout><ChatPage /></MainLayout></PrivateRoute>} />
            <Route path="/chat/:id"   element={<PrivateRoute><MainLayout><ChatPage /></MainLayout></PrivateRoute>} />
            <Route path="/ai-tutor"   element={<PrivateRoute><MainLayout><AITutorPage /></MainLayout></PrivateRoute>} />
            <Route path="/flashcards" element={<PrivateRoute><MainLayout><FlashcardsPage /></MainLayout></PrivateRoute>} />
            <Route path="/profile"    element={<PrivateRoute><MainLayout><ProfilePage /></MainLayout></PrivateRoute>} />
            <Route path="/settings"   element={<PrivateRoute><MainLayout><SettingsPage /></MainLayout></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
