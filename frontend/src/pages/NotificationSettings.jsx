import React, { useEffect, useState } from 'react'
import { Bell, Check, Clock, Loader2, Mail, Monitor, Save, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const notificationTypes = [
  { key: 'follows', label: 'New followers', description: 'When someone follows you' },
  { key: 'likes', label: 'Likes', description: 'When someone likes your models' },
  { key: 'comments', label: 'Comments', description: 'When someone comments on your models' },
  { key: 'downloads', label: 'Downloads', description: 'When someone downloads your models' },
  { key: 'tips', label: 'Tips', description: 'When someone tips you' },
  { key: 'achievements', label: 'Achievements', description: 'When your account reaches a milestone' },
  { key: 'milestones', label: 'View milestones', description: 'When your models reach view milestones' },
  { key: 'featured', label: 'Featured models', description: 'When one of your models is featured' },
  { key: 'reviews', label: 'Reviews', description: 'When someone reviews your models' },
  { key: 'shares', label: 'Shares', description: 'When someone shares your models' },
  { key: 'collaborations', label: 'Collaborations', description: 'When someone requests collaboration' },
  { key: 'system', label: 'System updates', description: 'Important platform notices' },
  { key: 'security', label: 'Security alerts', description: 'Account security notifications' }
]

const channels = [
  { key: 'email', label: 'Email', icon: Mail, description: 'Receive notifications by email' },
  { key: 'inApp', label: 'In app', icon: Monitor, description: 'Show notifications inside 3D ShareSpace' }
]

const frequencies = [
  { key: 'realtime', label: 'Real time', description: 'Send activity as it happens' },
  { key: 'hourly', label: 'Hourly', description: 'Group updates by hour' },
  { key: 'daily', label: 'Daily', description: 'One daily summary' },
  { key: 'weekly', label: 'Weekly', description: 'One weekly summary' }
]

const NotificationSettings = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    loadPreferences()
  }, [user])

  const loadPreferences = async () => {
    try {
      setLoading(true)
      const result = await firebaseHelpers.getUserNotificationPreferences(user.uid)

      if (result.success) {
        setPreferences(result.preferences)
      } else {
        console.error('Failed to load preferences:', result.error)
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (channel, type, value) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value
      }
    }))
  }

  const handleFrequencyChange = (frequency) => {
    setPreferences((prev) => ({ ...prev, frequency }))
  }

  const handleQuietHoursChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }))
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const result = await firebaseHelpers.updateUserNotificationPreferences(user.uid, preferences)

      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        console.error('Failed to save preferences:', result.error)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="studio-page notification-settings-page">
        <div className="studio-page__inner">
          <div className="studio-empty">
            <Loader2 className="mx-auto animate-spin" size={30} />
            <p>Loading notification settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="studio-page notification-settings-page">
        <div className="studio-page__inner">
          <div className="studio-empty">
            <Bell className="mx-auto" size={34} />
            <h1>Notification settings unavailable</h1>
            <p>Sign in again or refresh the page to load your account settings.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="studio-page notification-settings-page">
      <div className="studio-page__inner">
        <div className="studio-page__header">
          <div>
            <p className="studio-kicker">Account</p>
            <h1>Notification settings</h1>
            <p>Control which account and model updates reach you.</p>
          </div>
          <Button onClick={savePreferences} disabled={saving} className="studio-button studio-button--primary">
            {saved ? <Check size={14} /> : saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={14} />}
            {saved ? 'Saved' : saving ? 'Saving' : 'Save changes'}
          </Button>
        </div>

        <section className="settings-panel">
          <div className="settings-panel__header">
            <Settings size={16} />
            <div>
              <h2>Notification types</h2>
              <p>Choose the updates you want on each channel.</p>
            </div>
          </div>

          <div className="notification-channel-list">
            {channels.map((channel) => {
              const IconComponent = channel.icon
              return (
                <article key={channel.key} className="notification-channel">
                  <div className="notification-channel__header">
                    <IconComponent size={16} />
                    <div>
                      <h3>{channel.label}</h3>
                      <p>{channel.description}</p>
                    </div>
                  </div>

                  <div className="notification-type-grid">
                    {notificationTypes.map((type) => (
                      <label key={type.key} className="notification-toggle-row">
                        <span>
                          <strong>{type.label}</strong>
                          <small>{type.description}</small>
                        </span>
                        <input
                          type="checkbox"
                          checked={preferences[channel.key]?.[type.key] || false}
                          onChange={(event) => handlePreferenceChange(channel.key, type.key, event.target.checked)}
                        />
                      </label>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="settings-panel">
          <div className="settings-panel__header">
            <Clock size={16} />
            <div>
              <h2>Frequency</h2>
              <p>Set how often notifications should be grouped.</p>
            </div>
          </div>

          <div className="frequency-grid">
            {frequencies.map((frequency) => (
              <button
                key={frequency.key}
                type="button"
                className={preferences.frequency === frequency.key ? 'is-active' : ''}
                onClick={() => handleFrequencyChange(frequency.key)}
              >
                <strong>{frequency.label}</strong>
                <span>{frequency.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="settings-panel">
          <div className="settings-panel__header">
            <Clock size={16} />
            <div>
              <h2>Quiet hours</h2>
              <p>Pause notifications during a regular time window.</p>
            </div>
          </div>

          <div className="quiet-hours-row">
            <label className="notification-toggle-row">
              <span>
                <strong>Enable quiet hours</strong>
                <small>Hold notifications during the times below.</small>
              </span>
              <input
                type="checkbox"
                checked={preferences.quietHours?.enabled || false}
                onChange={(event) => handleQuietHoursChange('enabled', event.target.checked)}
              />
            </label>

            {preferences.quietHours?.enabled && (
              <div className="quiet-hours-inputs">
                <label>
                  <span>Start time</span>
                  <Input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(event) => handleQuietHoursChange('start', event.target.value)}
                  />
                </label>
                <label>
                  <span>End time</span>
                  <Input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(event) => handleQuietHoursChange('end', event.target.value)}
                  />
                </label>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default NotificationSettings
