import React from 'react'
import { Link } from 'react-router-dom'
import './BrandLogo.css'

export default function BrandLogo({ size = 'md', showTagline = false, clickable = true, light = false }) {
  const content = (
    <div className={`brand-logo brand-logo-${size} ${light ? 'brand-logo-light' : ''}`}>
      {/* HelloTalk Signature 4-Candy-Dot Logo Grid */}
      <div className="brand-dots-grid">
        <span className="dot dot-blue" />
        <span className="dot dot-yellow" />
        <span className="dot dot-coral" />
        <span className="dot dot-green" />
      </div>

      <div className="brand-text-col">
        <span className="brand-name">LinguaLink</span>
        {showTagline && (
          <span className="brand-tagline">150+ Languages & 50M Learners</span>
        )}
      </div>
    </div>
  )

  if (clickable) {
    return (
      <Link to="/" className="brand-logo-link">
        {content}
      </Link>
    )
  }

  return content
}
