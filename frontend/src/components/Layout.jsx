import React from 'react'
import { Link } from 'react-router-dom'
import PrivacyPreferences from './PrivacyPreferences'
import LeftStudioHeader from './LeftStudioHeader'

const Layout = ({ children }) => {
  return (
    <div className="studio-app-shell">
      <div className="studio-desktop-frame">
        <LeftStudioHeader />
        <div className="studio-content-frame">
          <main className="studio-main">{children}</main>
          <footer className="studio-footer">
            <div>
              <span>Share Space</span>
              <span>A practical 3D library made for the next viewport.</span>
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
