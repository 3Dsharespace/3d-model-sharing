import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, History, IndianRupee, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import TipHistory from '../components/ui/TipHistory'
import CreatorEarnings from '../components/ui/CreatorEarnings'

const Tips = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('earnings')

  if (!user) {
    return (
      <div className="studio-page tips-page">
        <div className="studio-page__inner">
          <section className="tips-guest-panel">
            <p className="studio-kicker">Creator support</p>
            <h1>Sign in to manage tips.</h1>
            <p>View tips you have sent, track creator earnings, and set up payout details from your account.</p>
            <div className="tips-actions">
              <Link to="/login" className="studio-button studio-button--primary">Log in</Link>
              <Link to="/signup" className="studio-button studio-button--secondary">Create account</Link>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="studio-page tips-page">
      <div className="studio-page__inner">
        <section className="tips-hero">
          <div>
            <p className="studio-kicker">Creator support</p>
            <h1>Tips and creator earnings</h1>
            <p>
              Track received support, review tip activity, and keep payout details ready for creator withdrawals.
            </p>
          </div>
          <div className="tips-hero__note">
            <ShieldCheck size={18} />
            <span>Payments are processed through Razorpay. Payout details stay tied to your creator profile.</span>
          </div>
        </section>

        <section className="tips-summary-grid">
          <article>
            <IndianRupee size={18} />
            <span>Creator earnings</span>
            <strong>Live balance data</strong>
          </article>
          <article>
            <History size={18} />
            <span>Tip activity</span>
            <strong>Sent and received records</strong>
          </article>
          <article>
            <ArrowRight size={18} />
            <span>Payout setup</span>
            <strong>Managed in profile settings</strong>
          </article>
        </section>

        <section className="tips-workspace">
          <div className="tips-tabs" role="tablist" aria-label="Tips workspace">
            <button
              type="button"
              className={activeTab === 'earnings' ? 'is-active' : ''}
              onClick={() => setActiveTab('earnings')}
            >
              Creator earnings
            </button>
            <button
              type="button"
              className={activeTab === 'history' ? 'is-active' : ''}
              onClick={() => setActiveTab('history')}
            >
              Tip history
            </button>
          </div>

          <div className="tips-panel">
            {activeTab === 'earnings' ? <CreatorEarnings /> : <TipHistory />}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Tips
