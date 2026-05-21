import React from 'react'
import { Link } from 'react-router-dom'
import PrivacyPreferences from './PrivacyPreferences'
import LeftStudioHeader from './LeftStudioHeader'

const Layout = ({ children }) => {
  return (
    <div className="studio-app-shell">
      <div className="studio-mobile-fallback">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500">3D ShareSpace</p>
          <h1 className="mt-3 text-2xl font-semibold text-neutral-100">Desktop workspace</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">
            This redesign is built as a desktop-first asset library. Open it on a wider screen for the full studio interface.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/explore" className="studio-button studio-button--primary">Explore</Link>
            <Link to="/login" className="studio-button">Log in</Link>
          </div>
        </div>
      </div>

      <div className="studio-desktop-frame">
        <LeftStudioHeader />
        <div className="studio-content-frame">
          <main className="studio-main">{children}</main>
          <footer className="studio-footer">
            <div>
              <span>3D ShareSpace</span>
              <span>Free 3D models for real projects.</span>
            </div>
            <nav aria-label="Footer links">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/report">Report content</Link>
            </nav>
          </footer>
        </div>
      </div>

      <PrivacyPreferences />
    </div>
  )
}

export default Layout
