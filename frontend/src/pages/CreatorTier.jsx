import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Button } from '../components/ui/Button'
import CreatorBadge from '../components/ui/CreatorBadge'
import { useToast } from '../hooks/use-toast'
import {
  Award,
  Calendar,
  DollarSign,
  FileImage,
  RefreshCw,
  Shield,
  Star,
  Upload,
  Users
} from 'lucide-react'

const TIER_INFO = {
  basic: {
    name: 'Basic Creator',
    description: 'Default account for uploading and managing models.',
    icon: Users
  },
  verified: {
    name: 'Verified Creator',
    description: 'A creator account with stronger trust signals.',
    icon: Shield
  },
  pro: {
    name: 'Pro Creator',
    description: 'For creators with consistent downloads and published work.',
    icon: Star
  },
  elite: {
    name: 'Elite Creator',
    description: 'Top creator status for established libraries.',
    icon: Award
  }
}

const statLabels = {
  totalDownloads: 'Downloads',
  totalEarnings: 'Earnings',
  modelCount: 'Published models',
  accountAge: 'Account age',
  rating: 'Average rating'
}

const formatNumber = (num = 0) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return String(num)
}

const formatFeature = (feature) => (
  String(feature || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
)

const progressValue = (current = 0, required = 1) => {
  if (!required) return 100
  return Math.min(Math.max((Number(current) / Number(required)) * 100, 0), 100)
}

const requirementRows = (requirements, stats) => {
  if (!requirements) return []

  const rows = [
    {
      key: 'totalDownloads',
      label: statLabels.totalDownloads,
      current: stats.totalDownloads || 0,
      required: requirements.minDownloads,
      value: formatNumber(stats.totalDownloads || 0),
      target: formatNumber(requirements.minDownloads || 0)
    },
    {
      key: 'totalEarnings',
      label: statLabels.totalEarnings,
      current: stats.totalEarnings || 0,
      required: requirements.minEarnings,
      value: `Rs ${(stats.totalEarnings || 0).toFixed(0)}`,
      target: `Rs ${requirements.minEarnings || 0}`
    },
    {
      key: 'modelCount',
      label: statLabels.modelCount,
      current: stats.modelCount || 0,
      required: requirements.minModels,
      value: stats.modelCount || 0,
      target: requirements.minModels || 0
    },
    {
      key: 'accountAge',
      label: statLabels.accountAge,
      current: stats.accountAge || 0,
      required: requirements.accountAge,
      value: `${stats.accountAge || 0} days`,
      target: `${requirements.accountAge || 0} days`
    }
  ]

  if (requirements.minRating) {
    rows.push({
      key: 'rating',
      label: statLabels.rating,
      current: stats.rating || 0,
      required: requirements.minRating,
      value: (stats.rating || 0).toFixed(1),
      target: requirements.minRating
    })
  }

  return rows.filter((row) => row.required !== undefined && row.required !== null)
}

export default function CreatorTier() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tierData, setTierData] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(Boolean(user))
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let active = true

    const loadData = async () => {
      setLoading(true)
      try {
        const [tierResult, earningsResult, profileResult] = await Promise.all([
          firebaseHelpers.getCreatorTier({ userId: user.uid }),
          firebaseHelpers.getCreatorEarnings(user.uid),
          firebaseHelpers.getUserProfile(user.uid)
        ])

        if (!active) return

        setTierData(tierResult)
        setUserStats({
          ...earningsResult,
          ...profileResult,
          modelCount: profileResult.totalModels || 0,
          accountAge: profileResult.createdAt
            ? Math.floor((Date.now() - new Date(profileResult.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            : 0
        })
      } catch (error) {
        if (!active) return
        toast({
          title: 'Could not load creator tier',
          description: error.message || 'Please try again later.',
          variant: 'destructive'
        })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [toast, user])

  const handleUpdateTier = async () => {
    if (!user) return

    setUpdating(true)
    try {
      const result = await firebaseHelpers.updateCreatorTier({ userId: user.uid })
      const [tierResult, earningsResult, profileResult] = await Promise.all([
        firebaseHelpers.getCreatorTier({ userId: user.uid }),
        firebaseHelpers.getCreatorEarnings(user.uid),
        firebaseHelpers.getUserProfile(user.uid)
      ])

      setTierData(tierResult)
      setUserStats({
        ...earningsResult,
        ...profileResult,
        modelCount: profileResult.totalModels || 0,
        accountAge: profileResult.createdAt
          ? Math.floor((Date.now() - new Date(profileResult.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      })

      toast({
        title: 'Tier refreshed',
        description: `Current tier: ${String(result.tier || tierResult.currentTier || '').toUpperCase()}`
      })
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: error.message || 'Could not update creator tier.',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const currentTier = tierData?.currentTier || 'basic'
  const currentInfo = TIER_INFO[currentTier] || TIER_INFO.basic
  const CurrentIcon = currentInfo.icon
  const benefits = tierData?.benefits || {}
  const nextTier = tierData?.requirements?.nextTier
  const nextInfo = TIER_INFO[nextTier]
  const nextRows = useMemo(
    () => requirementRows(tierData?.requirements?.nextTierRequirements, userStats || {}),
    [tierData, userStats]
  )

  if (loading) {
    return (
      <main className="creator-tier-page">
        <div className="creator-tier-shell">
          <div className="creator-tier-loading">
            <span />
            <p>Loading creator tier</p>
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="creator-tier-page">
        <div className="creator-tier-shell">
          <section className="creator-tier-empty">
            <p className="creator-tier-kicker">Creator account</p>
            <h1>Sign in to view your creator tier</h1>
            <p>Creator tiers use your real uploads, downloads, earnings, and account history.</p>
            <div className="creator-tier-actions">
              <Link to="/login">Log in</Link>
              <Link to="/signup">Create account</Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (!tierData || !userStats) {
    return (
      <main className="creator-tier-page">
        <div className="creator-tier-shell">
          <section className="creator-tier-empty">
            <p className="creator-tier-kicker">Creator account</p>
            <h1>Unable to load tier data</h1>
            <p>Please refresh the page or check again later.</p>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="creator-tier-page">
      <div className="creator-tier-shell">
        <section className="creator-tier-hero">
          <div>
            <p className="creator-tier-kicker">Creator tier</p>
            <h1>Creator status and account limits</h1>
            <p>
              Review your current creator tier, active benefits, and the real requirements for the next level.
            </p>
          </div>
          <Button onClick={handleUpdateTier} disabled={updating} className="creator-tier-refresh">
            <RefreshCw className={updating ? 'is-spinning' : ''} size={16} />
            {updating ? 'Refreshing' : 'Refresh tier'}
          </Button>
        </section>

        <section className="creator-tier-layout">
          <article className="creator-tier-current">
            <div className="creator-tier-current__mark">
              <CurrentIcon size={30} />
            </div>
            <div>
              <div className="creator-tier-current__title">
                <h2>{currentInfo.name}</h2>
                <CreatorBadge tier={currentTier} size="md" />
              </div>
              <p>{currentInfo.description}</p>
            </div>
          </article>

          <aside className="creator-tier-summary">
            <div>
              <span>{formatNumber(userStats.totalDownloads || 0)}</span>
              <p>Downloads</p>
            </div>
            <div>
              <span>{userStats.modelCount || 0}</span>
              <p>Models</p>
            </div>
            <div>
              <span>Rs {(userStats.totalEarnings || 0).toFixed(0)}</span>
              <p>Earnings</p>
            </div>
          </aside>
        </section>

        <section className="creator-tier-grid">
          <article className="creator-tier-panel creator-tier-panel--wide">
            <div className="creator-tier-panel__header">
              <div>
                <p className="creator-tier-kicker">Benefits</p>
                <h2>Current account rules</h2>
              </div>
            </div>

            <div className="creator-benefit-grid">
              <div className="creator-benefit">
                <Upload size={18} />
                <span>Upload limit</span>
                <strong>{benefits.uploadLimit ?? 0} models/month</strong>
              </div>
              <div className="creator-benefit">
                <FileImage size={18} />
                <span>Max file size</span>
                <strong>{benefits.maxFileSize ?? 0} MB</strong>
              </div>
              <div className="creator-benefit">
                <DollarSign size={18} />
                <span>Revenue share</span>
                <strong>{((benefits.revenueShare || 0) * 100).toFixed(0)}%</strong>
              </div>
              <div className="creator-benefit">
                <Award size={18} />
                <span>Featured chance</span>
                <strong>{((benefits.featuredChance || 0) * 100).toFixed(0)}%</strong>
              </div>
              <div className="creator-benefit">
                <Shield size={18} />
                <span>Support priority</span>
                <strong>{benefits.supportPriority || 'standard'}</strong>
              </div>
              <div className="creator-benefit">
                <Calendar size={18} />
                <span>Account age</span>
                <strong>{userStats.accountAge || 0} days</strong>
              </div>
            </div>

            {Array.isArray(benefits.exclusiveFeatures) && benefits.exclusiveFeatures.length > 0 && (
              <div className="creator-feature-list">
                <h3>Enabled features</h3>
                <div>
                  {benefits.exclusiveFeatures.map((feature) => (
                    <span key={feature}>{formatFeature(feature)}</span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <article className="creator-tier-panel">
            <div className="creator-tier-panel__header">
              <div>
                <p className="creator-tier-kicker">Next tier</p>
                <h2>{nextInfo ? nextInfo.name : 'Highest current tier'}</h2>
              </div>
            </div>

            {nextInfo && nextRows.length > 0 ? (
              <div className="creator-progress-list">
                {nextRows.map((row) => (
                  <div className="creator-progress" key={row.key}>
                    <div className="creator-progress__top">
                      <span>{row.label}</span>
                      <span>{row.value} / {row.target}</span>
                    </div>
                    <div className="creator-progress__track">
                      <span style={{ width: `${progressValue(row.current, row.required)}%` }} />
                    </div>
                  </div>
                ))}

                {tierData.requirements?.nextTierRequirements?.featured && (
                  <div className="creator-tier-note">
                    Featured content is required for this tier.
                  </div>
                )}
              </div>
            ) : (
              <p className="creator-tier-muted">
                Your account is already at the top available tier.
              </p>
            )}
          </article>
        </section>

        {tierData.allTiers && (
          <section className="creator-tier-panel creator-tier-all">
            <div className="creator-tier-panel__header">
              <div>
                <p className="creator-tier-kicker">Tier table</p>
                <h2>Creator tiers</h2>
              </div>
            </div>

            <div className="creator-tier-table">
              {Object.entries(TIER_INFO).map(([tier, info]) => {
                const TierIcon = info.icon
                const tierBenefits = tierData.allTiers[tier] || {}
                const isCurrentTier = tier === currentTier

                return (
                  <article className={isCurrentTier ? 'is-current' : ''} key={tier}>
                    <div className="creator-tier-table__top">
                      <TierIcon size={20} />
                      {isCurrentTier && <span>Current</span>}
                    </div>
                    <h3>{info.name}</h3>
                    <p>{info.description}</p>
                    <dl>
                      <div>
                        <dt>Uploads</dt>
                        <dd>{tierBenefits.uploadLimit ?? 0}/month</dd>
                      </div>
                      <div>
                        <dt>Revenue</dt>
                        <dd>{((tierBenefits.revenueShare || 0) * 100).toFixed(0)}%</dd>
                      </div>
                      <div>
                        <dt>Featured</dt>
                        <dd>{((tierBenefits.featuredChance || 0) * 100).toFixed(0)}%</dd>
                      </div>
                    </dl>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
