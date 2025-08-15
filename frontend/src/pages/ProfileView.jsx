import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { firebaseHelpers } from '../lib/firebase'
import { 
  Download, 
  Calendar, 
  User, 
  Package, 
  Eye, 
  MapPin, 
  Globe, 
  Twitter, 
  Instagram, 
  Github, 
  Linkedin,
  Edit3,
  Settings,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Palette,
  Camera,
  Mail
} from 'lucide-react'
import ModelCard from '../components/ModelCard'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const ProfileView = () => {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('models')

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        const { profile: profileData, error: profileError } = await firebaseHelpers.getProfileByUsername(username)
        if (profileError) {
          setError(profileError)
          return
        }
        setProfile(profileData)
        
        const { models: userModels, error: modelsError } = await firebaseHelpers.getUserModels(profileData.id)
        if (modelsError) {
          console.error('Error fetching user models:', modelsError)
        } else {
          setModels(userModels)
        }
      } catch (err) {
        setError('Failed to load profile')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfileData()
    }
  }, [username])

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getTotalStats = () => {
    return {
      downloads: models.reduce((sum, model) => sum + (model.downloads_count || 0), 0),
      views: models.reduce((sum, model) => sum + (model.view_count || 0), 0),
      models: models.length
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={User}
          title="Profile Not Found"
          description={error || "The user profile you're looking for doesn't exist."}
          actionText="Go Back Home"
          actionLink="/"
        />
      </div>
    )
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {profile.display_name || profile.username}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    @{profile.username}
                  </p>
                  {profile.bio && (
                    <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 mt-4 md:mt-0">
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <Mail className="w-4 h-4 mr-2 inline" />
                    Contact
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Edit3 className="w-4 h-4 mr-2 inline" />
                    Edit Profile
                  </button>
                </div>
              </div>

              {/* Social Links */}
              {(profile.website || profile.twitter || profile.instagram || profile.github || profile.linkedin) && (
                <div className="flex items-center space-x-4 mt-4">
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={`https://github.com/${profile.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${profile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-700 transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {stats.models}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <Package className="w-4 h-4 mr-2" />
                Models
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {stats.downloads}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <Download className="w-4 h-4 mr-2" />
                Downloads
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {stats.views}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <Eye className="w-4 h-4 mr-2" />
                Views
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {formatDate(profile.created_at)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center">
                <Calendar className="w-4 h-4 mr-2" />
                Member Since
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Additional Info */}
        {(profile.location || profile.skills || profile.experience || profile.education) && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About {profile.display_name || profile.username}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Location</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.location}</p>
                  </div>
                </div>
              )}
              
              {profile.skills && (
                <div className="flex items-start space-x-3">
                  <Palette className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Skills</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.skills}</p>
                  </div>
                </div>
              )}
              
              {profile.experience && (
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Experience</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.experience}</p>
                  </div>
                </div>
              )}
              
              {profile.education && (
                <div className="flex items-start space-x-3">
                  <BookOpen className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Education</h3>
                    <p className="text-gray-600 dark:text-gray-400">{profile.education}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'models', label: 'Models', icon: Package, count: models.length },
                { id: 'collections', label: 'Collections', icon: BookOpen, count: 0 },
                { id: 'likes', label: 'Likes', icon: Star, count: 0 },
                { id: 'activity', label: 'Activity', icon: TrendingUp, count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'models' && (
              <div>
                {models.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No models yet"
                    description={`${profile.display_name || profile.username} hasn't uploaded any 3D models yet.`}
                    actionText="Browse All Models"
                    actionLink="/explore"
                  />
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {models.length} Model{models.length !== 1 ? 's' : ''}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Sort by:
                        </span>
                        <select className="bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="newest">Newest</option>
                          <option value="popular">Most Popular</option>
                          <option value="downloads">Most Downloaded</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {models.map((model) => (
                        <ModelCard key={model.id} model={model} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collections' && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Collections</h3>
                <p className="text-gray-500 dark:text-gray-400">Collections feature coming soon!</p>
              </div>
            )}

            {activeTab === 'likes' && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Likes</h3>
                <p className="text-gray-500 dark:text-gray-400">Likes feature coming soon!</p>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Activity</h3>
                <p className="text-gray-500 dark:text-gray-400">Activity feed coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileView
