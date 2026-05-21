import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { 
  Bell, 
  Mail, 
  Monitor, 
  Clock, 
  Save,
  Loader2,
  Check,
  Settings
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const NotificationSettings = () => {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      loadPreferences()
    }
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
    setPreferences(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value
      }
    }))
  }

  const handleFrequencyChange = (frequency) => {
    setPreferences(prev => ({
      ...prev,
      frequency
    }))
  }

  const handleQuietHoursChange = (field, value) => {
    setPreferences(prev => ({
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

  const notificationTypes = [
    { key: 'follows', label: 'New Followers', description: 'When someone follows you' },
    { key: 'likes', label: 'Likes', description: 'When someone likes your models' },
    { key: 'comments', label: 'Comments', description: 'When someone comments on your models' },
    { key: 'downloads', label: 'Downloads', description: 'When someone downloads your models' },
    { key: 'tips', label: 'Tips', description: 'When someone tips you' },
    { key: 'achievements', label: 'Achievements', description: 'When you unlock new achievements' },
    { key: 'milestones', label: 'View Milestones', description: 'When your models reach view milestones' },
    { key: 'featured', label: 'Featured Models', description: 'When your models get featured' },
    { key: 'reviews', label: 'Reviews', description: 'When someone reviews your models' },
    { key: 'shares', label: 'Shares', description: 'When someone shares your models' },
    { key: 'collaborations', label: 'Collaborations', description: 'When someone requests collaboration' },
    { key: 'system', label: 'System Updates', description: 'Important system announcements' },
    { key: 'security', label: 'Security Alerts', description: 'Account security notifications' }
  ]

  const channels = [
    { key: 'email', label: 'Email', icon: Mail, description: 'Receive notifications via email' },
    { key: 'inApp', label: 'In-App', icon: Monitor, description: 'Show notifications in the app' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-luxury-bg-primary dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Loading notification settings...</p>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="min-h-screen bg-luxury-bg-primary dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Bell className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load notification settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-bg-primary dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Notification Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Customize how and when you receive notifications
          </p>
        </div>

        {/* Save Button */}
        <div className="mb-6 flex justify-end">
          <Button onClick={savePreferences} disabled={saving} className="h-10 px-6 inline-flex items-center">
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                <span>Saved!</span>
              </>
            ) : saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>

        {/* Notification Types */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notification Types
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Choose which types of notifications you want to receive
            </p>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {channels.map(channel => {
                const IconComponent = channel.icon
                return (
                  <div key={channel.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <IconComponent className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {channel.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {channel.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {notificationTypes.map(type => (
                        <div key={type.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {type.label}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {type.description}
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={preferences[channel.key][type.key] || false}
                              onChange={(e) => handlePreferenceChange(channel.key, type.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notification Frequency
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              How often you want to receive notifications
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'realtime', label: 'Real-time', description: 'Immediate notifications' },
                { key: 'hourly', label: 'Hourly', description: 'Digest every hour' },
                { key: 'daily', label: 'Daily', description: 'Daily summary' },
                { key: 'weekly', label: 'Weekly', description: 'Weekly summary' }
              ].map(freq => (
                <Button
                  key={freq.key}
                  onClick={() => handleFrequencyChange(freq.key)}
                  variant={preferences.frequency === freq.key ? 'secondary' : 'outline'}
                  className={`p-4 rounded-lg border-2 transition-colors w-full ${
                    preferences.frequency === freq.key
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                >
                  <div className="text-center w-full">
                    <div className={`font-medium ${
                      preferences.frequency === freq.key
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {freq.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {freq.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quiet Hours
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Set times when you don't want to receive notifications
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Enable Quiet Hours
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pause notifications during specified hours
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {preferences.quietHours.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={preferences.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={preferences.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
