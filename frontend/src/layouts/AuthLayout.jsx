/* ============================================================
   AuthLayout — HelloTalk Inspired Mobile Phone Auth Splash Layout
   ============================================================ */
import React from 'react'
import BrandLogo from '../components/BrandLogo'
import './AuthLayout.css'

export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {/* Decorative ambient background canvas */}
      <div className="auth-canvas-bg">
        <div className="auth-canvas-blob auth-canvas-blob-1" />
        <div className="auth-canvas-blob-2" />
        <div className="auth-canvas-blob-3" />
      </div>

      <div className="auth-container">
        {/* Mobile Device Frame Card */}
        <div className="auth-phone-card">
          {/* Top Brand Header */}
          <div className="auth-card-header">
            <BrandLogo size="md" showTagline={true} />
          </div>

          {/* HelloTalk Signature Visual: Organic Overlapping Color Shapes & Multilingual Bubbles */}
          <div className="auth-splash-visual">
            {/* The 4 Organic Blobs */}
            <div className="splash-blob splash-blob-blue" />
            <div className="splash-blob splash-blob-yellow" />
            <div className="splash-blob splash-blob-coral" />
            <div className="splash-blob splash-blob-green" />

            {/* Floating Speech Bubbles with Avatars & Country Flags */}
            <div className="floating-bubble bubble-pos-1">
              <span className="floating-bubble-avatar">🇺🇸</span>
              <span>Hello!</span>
            </div>
            <div className="floating-bubble bubble-pos-2">
              <span className="floating-bubble-avatar">🇸🇪</span>
              <span>Hej!</span>
            </div>
            <div className="floating-bubble bubble-pos-3">
              <span className="floating-bubble-avatar">🇹🇷</span>
              <span>Merhaba!</span>
            </div>
            <div className="floating-bubble bubble-pos-4">
              <span className="floating-bubble-avatar">🇩🇪</span>
              <span>Hallo!</span>
            </div>
            <div className="floating-bubble bubble-pos-5">
              <span className="floating-bubble-avatar">🇪🇸</span>
              <span>¡Hola!</span>
            </div>
            <div className="floating-bubble bubble-pos-6">
              <span className="floating-bubble-avatar">🇮🇹</span>
              <span>Ciao!</span>
            </div>
            <div className="floating-bubble bubble-pos-7">
              <span className="floating-bubble-avatar">🇧🇷</span>
              <span>Olá!</span>
            </div>
            <div className="floating-bubble bubble-pos-8">
              <span className="floating-bubble-avatar">🇷🇺</span>
              <span>Привет!</span>
            </div>
          </div>

          {/* Card Body containing Login or Register forms and CTA buttons */}
          <div className="auth-card-body">
            {children}
          </div>
        </div>

        {/* Global Footer */}
        <p className="auth-footer">
          © 2026 LinguaLink. Connect, Learn & Speak Freely.
        </p>
      </div>
    </div>
  )
}
