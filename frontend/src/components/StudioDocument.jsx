import React from 'react'
import { Link } from 'react-router-dom'
import ExploreHighlight from './ui/ExploreHighlight'

const StudioDocument = ({ kicker, title, subtitle, actions = [], children, aside }) => (
  <div className="studio-page">
    <div className="studio-container">
      <header className="studio-doc-hero">
        <div>
          {kicker && <p className="studio-kicker">{kicker}</p>}
          <h1 className="studio-page-title">{title}</h1>
          {subtitle && <p className="studio-page-subtitle">{subtitle}</p>}
        </div>
        {actions.length > 0 && (
          <div className="studio-doc-actions">
            {actions.map((action) => {
              const link = (
                <Link key={action.to} to={action.to} className={action.primary ? 'studio-primary-button' : 'studio-secondary-button'}>
                  {action.label}
                </Link>
              )

              return action.to?.startsWith('/explore')
                ? <ExploreHighlight key={action.to}>{link}</ExploreHighlight>
                : link
            })}
          </div>
        )}
      </header>

      <div className={aside ? 'studio-doc-layout' : 'studio-doc-layout is-single'}>
        <main className="studio-doc-panel">
          {children}
        </main>
        {aside && <aside className="studio-doc-aside">{aside}</aside>}
      </div>
    </div>
  </div>
)

export default StudioDocument
