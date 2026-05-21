import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Camera, 
  Save, 
  X, 
  Shield,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Lock,
  Briefcase,
  Palette,
  Bell,
  Heart,
  Upload,
  Download,
  Smartphone,
  Star,
  Award,
  Target,
  TrendingUp,
  Calendar,
  FileText,
  Link,
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Facebook,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  Zap,
  Bookmark
} from 'lucide-react'
import UPIProfileSetup from '../components/ui/UPIProfileSetup'

const ProfileEdit = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, updateProfile, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showUPISetup, setShowUPISetup] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true, state: { from: { pathname: '/profile/edit' } } })
    }
  }, [authLoading, navigate, user])

  useEffect(() => {
    const requestedTab = new URLSearchParams(location.search).get('tab')
    const supportedTabs = ['overview', 'professional', 'portfolio', 'social', 'achievements', 'settings', 'payments']

    if (requestedTab && supportedTabs.includes(requestedTab)) {
      setActiveTab(requestedTab)
    }
  }, [location.search])
  
  // Form data state
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    email: '',
    location: '',
    website: '',
    languages: '',
    preferredTools: [],
    areasOfExpertise: [],
    allowCustomJobs: false,
    makeNamePrivate: false,
    showLocationPublicly: false,
    enable2FA: false,
    // New enhanced fields
    jobTitle: '',
    company: '',
    yearsOfExperience: '',
    hourlyRate: '',
    availability: 'available',
    timeZone: '',
    socialLinks: {
      github: '',
      twitter: '',
      linkedin: '',
      instagram: '',
      youtube: '',
      facebook: '',
      behance: '',
      artstation: ''
    },
    skills: [],
    certifications: [],
    portfolioItems: [],
    achievements: [],
    tagline: '',
    phoneNumber: '',
    portfolioDescription: ''
  })

  // New field states
  const [newTool, setNewTool] = useState('')
  const [newExpertise, setNewExpertise] = useState('')
  const [newSkill, setNewSkill] = useState('')
  const [newCertification, setNewCertification] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [autoSave, setAutoSave] = useState(false)

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        username: profile.username || '',
        bio: profile.bio || '',
        email: profile.email || '',
        location: profile.location || '',
        website: profile.website || '',
        languages: profile.languages || 'english',
        preferredTools: profile.preferredTools || [],
        areasOfExpertise: profile.areasOfExpertise || [],
        allowCustomJobs: profile.allowCustomJobs || false,
        makeNamePrivate: profile.makeNamePrivate || false,
        showLocationPublicly: profile.showLocationPublicly || true,
        enable2FA: profile.enable2FA || false,
        // New enhanced fields
        jobTitle: profile.jobTitle || '',
        company: profile.company || '',
        yearsOfExperience: profile.yearsOfExperience || '',
        hourlyRate: profile.hourlyRate || '',
        availability: profile.availability || 'available',
        timeZone: profile.timeZone || '',
        socialLinks: {
          github: profile.socialLinks?.github || '',
          twitter: profile.socialLinks?.twitter || '',
          linkedin: profile.socialLinks?.linkedin || '',
          instagram: profile.socialLinks?.instagram || '',
          youtube: profile.socialLinks?.youtube || '',
          facebook: profile.socialLinks?.facebook || '',
          behance: profile.socialLinks?.behance || '',
          artstation: profile.socialLinks?.artstation || ''
        },
        skills: profile.skills || [],
        certifications: profile.certifications || [],
        portfolioItems: profile.portfolioItems || [],
        achievements: profile.achievements || [],
        tagline: profile.tagline || '',
        phoneNumber: profile.phoneNumber || '',
        portfolioDescription: profile.portfolioDescription || ''
      })
      
      if (profile.avatar) {
        setAvatarPreview(profile.avatar)
      }
    }
  }, [profile])

  // Calculate profile completion percentage
  const calculateProfileCompletion = useCallback(() => {
    const fields = [
      formData.displayName,
      formData.bio,
      formData.location,
      formData.jobTitle,
      formData.preferredTools.length > 0,
      formData.areasOfExpertise.length > 0,
      formData.skills.length > 0,
      avatarPreview,
      formData.website,
      formData.yearsOfExperience,
      Object.values(formData.socialLinks).some(link => link),
      formData.tagline
    ]
    
    const filledFields = fields.filter(field => field && field !== '').length
    const percentage = Math.round((filledFields / fields.length) * 100)
    setProfileCompletion(percentage)
  }, [formData, avatarPreview])

  useEffect(() => {
    calculateProfileCompletion()
  }, [calculateProfileCompletion])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSocialLinkChange = (platform, value) => {
    setFormData({
      ...formData,
      socialLinks: {
        ...formData.socialLinks,
        [platform]: value
      }
    })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Accept any image format
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Accept any file size (we'll optimize on upload)
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setError('')
      
      // Show success message
      setSuccess('Avatar selected successfully! Click "Update Information" to save.')
    }
  }

  const addTool = () => {
    if (newTool.trim() && !formData.preferredTools.includes(newTool.trim())) {
      setFormData({
        ...formData,
        preferredTools: [...formData.preferredTools, newTool.trim()]
      })
      setNewTool('')
    }
  }

  const removeTool = (tool) => {
    setFormData({
      ...formData,
      preferredTools: formData.preferredTools.filter(t => t !== tool)
    })
  }

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.areasOfExpertise.includes(newExpertise.trim())) {
      setFormData({
        ...formData,
        areasOfExpertise: [...formData.areasOfExpertise, newExpertise.trim()]
      })
      setNewExpertise('')
    }
  }

  const removeExpertise = (expertise) => {
    setFormData({
      ...formData,
      areasOfExpertise: formData.areasOfExpertise.filter(e => e !== expertise)
    })
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skill)
    })
  }

  const addCertification = () => {
    if (newCertification.trim() && !formData.certifications.includes(newCertification.trim())) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, newCertification.trim()]
      })
      setNewCertification('')
    }
  }

  const removeCertification = (certification) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(c => c !== certification)
    })
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview('')
    setFormData({
      ...formData,
      avatar: null
    })
    setSuccess('Avatar removed successfully!')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Prepare updates
      const updates = { ...formData }
      
      // Handle avatar upload if changed
      if (avatarFile) {
        setSuccess('Uploading avatar...')
        
        // Upload avatar to Firebase Storage
        const uploadResult = await firebaseHelpers.uploadAvatar(
          user.uid, 
          avatarFile,
          (progress) => {
            setSuccess(`Uploading avatar... ${Math.round(progress)}%`)
          }
        )
        
        if (uploadResult.success) {
          // Add avatar URL to updates
          updates.avatar = uploadResult.downloadURL
          setSuccess('Avatar uploaded successfully! Updating profile...')
        } else {
          throw new Error(`Avatar upload failed: ${uploadResult.error}`)
        }
      }

      const result = await updateProfile(updates)
      if (result.success) {
        setSuccess('Profile updated successfully!')
        // Reset avatar file state after successful update
        setAvatarFile(null)
        // Update the avatar preview to show the uploaded image
        if (updates.avatar) {
          setAvatarPreview(updates.avatar)
        }
        setTimeout(() => navigate(`/profile/${user.uid}`), 2000)
      } else {
        setError(result.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return null
  }

  if (!user) return null

  const tabs = [
    { id: 'overview', label: 'OVERVIEW', icon: User, description: 'Basic profile information' },
    { id: 'professional', label: 'PROFESSIONAL', icon: Briefcase, description: 'Work experience & skills' },
    { id: 'portfolio', label: 'PORTFOLIO', icon: Star, description: 'Showcase your work' },
    { id: 'social', label: 'SOCIAL LINKS', icon: Link, description: 'Connect your profiles' },
    { id: 'achievements', label: 'ACHIEVEMENTS', icon: Award, description: 'Certifications & awards' },
    { id: 'settings', label: 'SETTINGS', icon: Settings, description: 'Account & privacy settings' },
    { id: 'payments', label: 'PAYMENTS', icon: Smartphone, description: 'UPI & payment setup' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Breadcrumbs */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex mb-8" 
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
            <li className="inline-flex items-center">
              <a href="/" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>3D ShareSpace</span>
                </span>
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <a href={`/profile/${user.uid}`} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                  Profile
                </a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Edit Profile</span>
              </div>
            </li>
          </ol>
        </motion.nav>

        {/* Profile Completion Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 mb-8 text-white shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Profile Completion</h2>
              <p className="text-blue-100">Complete your profile to attract more viewers and opportunities</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{profileCompletion}%</div>
              <div className="w-24 bg-white/20 rounded-full h-2 mt-2">
                <motion.div 
                  className="bg-white rounded-full h-2"
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/20"
        >
          {/* Enhanced Header */}
          <div className="px-8 py-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Your Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Showcase your skills and build your professional presence in the 3D community
            </p>
              </div>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
            <nav className="flex overflow-x-auto space-x-1 px-8 py-2" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
  return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative py-3 px-4 font-medium text-sm flex items-center space-x-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white/50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    
                    {/* Tooltip for mobile */}
                    <div className="sm:hidden absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {tab.label}
                    </div>
                  </motion.button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
          {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
                </motion.div>
          )}

          {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-3"
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
                </motion.div>
          )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Profile Header Card */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                    <div className="flex items-center space-x-6">
                      {/* Enhanced Avatar Section */}
              <div className="relative">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-600 p-1">
                          <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-800">
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                        </div>
                        <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-3 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                          <Camera className="w-5 h-5" />
                <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {/* Profile Info */}
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Display Name *
                            </label>
                            <input
                              type="text"
                              name="displayName"
                              value={formData.displayName}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                              placeholder="Your full name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Username *
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">@</span>
                              <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                                placeholder="unique_username"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tagline
                          </label>
                          <input
                            type="text"
                            name="tagline"
                            value={formData.tagline}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="Your professional tagline (e.g., 'Expert 3D Artist & Animator')"
                          />
                        </div>
                      </div>
              </div>
            </div>

                  {/* Bio Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <FileText className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About You</h3>
                    </div>
                    <textarea
                      name="bio"
                      rows={6}
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                      placeholder="Share your story, experience, and what makes you unique as a 3D artist. This will be visible on your public profile..."
                    />
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <span>Tell your professional story</span>
                      <span>{formData.bio.length}/500</span>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900 dark:text-white font-medium">{user.email}</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Verified</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <div className="relative">
                          <MapPin className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="City, Country"
                          />
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                          <input
                            type="checkbox"
                            id="showLocationPublicly"
                            name="showLocationPublicly"
                            checked={formData.showLocationPublicly}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="showLocationPublicly" className="text-sm text-gray-700 dark:text-gray-300">
                            Show location on public profile
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Time Zone
                        </label>
                        <select
                          name="timeZone"
                          value={formData.timeZone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        >
                          <option value="">Select timezone</option>
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time (EST)</option>
                          <option value="PST">Pacific Time (PST)</option>
                          <option value="GMT">Greenwich Mean Time (GMT)</option>
                          <option value="IST">India Standard Time (IST)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Settings</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Private Name</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Hide your real name from public profile</p>
                        </div>
                        <input
                          type="checkbox"
                          id="makeNamePrivate"
                          name="makeNamePrivate"
                          checked={formData.makeNamePrivate}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Custom Job Requests</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Allow clients to send custom project requests</p>
                        </div>
                        <input
                          type="checkbox"
                          id="allowCustomJobs"
                          name="allowCustomJobs"
                          checked={formData.allowCustomJobs}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PROFESSIONAL INFO TAB */}
              {activeTab === 'professional' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Professional Header */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Briefcase className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Professional Information</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Showcase your professional expertise and experience to attract the right opportunities
                    </p>
                  </div>

                  {/* Work Details */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Career Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Job Title
              </label>
                        <input
                          type="text"
                          name="jobTitle"
                          value={formData.jobTitle}
                onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          placeholder="e.g., Senior 3D Artist, Freelance Animator"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Company/Studio
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          placeholder="e.g., Pixar, Freelance, Your Studio"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Years of Experience
                        </label>
                        <select
                          name="yearsOfExperience"
                          value={formData.yearsOfExperience}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        >
                          <option value="">Select experience level</option>
                          <option value="beginner">Beginner (Less than 1 year)</option>
                          <option value="junior">Junior (1-2 years)</option>
                          <option value="intermediate">Intermediate (3-5 years)</option>
                          <option value="senior">Senior (5-10 years)</option>
                          <option value="expert">Expert (10+ years)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hourly Rate (Optional)
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                          <input
                            type="number"
                            name="hourlyRate"
                            value={formData.hourlyRate}
                            onChange={handleChange}
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Availability Status
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['available', 'busy', 'unavailable'].map((status) => (
                          <label key={status} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <input
                              type="radio"
                              name="availability"
                              value={status}
                              checked={formData.availability === status}
                              onChange={handleChange}
                              className="mr-3 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                status === 'available' ? 'bg-green-500' :
                                status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                              }`} />
                              <span className="capitalize text-gray-900 dark:text-white">{status}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tools & Skills */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Zap className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tools & Technologies</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Preferred Tools */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Preferred Software & Tools
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.preferredTools.map((tool, index) => (
                            <motion.span
                                key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200 border border-blue-200 dark:border-blue-700"
                              >
                                {tool}
                                <button
                                  type="button"
                                  onClick={() => removeTool(tool)}
                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 transition-colors"
                                >
                                <X className="w-4 h-4" />
                                </button>
                            </motion.span>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newTool}
                              onChange={(e) => setNewTool(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && addTool()}
                            placeholder="Add software (e.g., Blender, Maya, Cinema 4D)"
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            />
                            <button
                              type="button"
                              onClick={addTool}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                            <Plus className="w-5 h-5" />
                            </button>
                        </div>
                      </div>

                      {/* Areas of Expertise */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Areas of Expertise
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.areasOfExpertise.map((expertise, index) => (
                            <motion.span
                                key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 border border-green-200 dark:border-green-700"
                              >
                                {expertise}
                                <button
                                  type="button"
                                  onClick={() => removeExpertise(expertise)}
                                className="ml-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
                                >
                                <X className="w-4 h-4" />
                                </button>
                            </motion.span>
                            ))}
                          </div>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={newExpertise}
                              onChange={(e) => setNewExpertise(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && addExpertise()}
                            placeholder="Add expertise (e.g., Character Modeling, Animation, VFX)"
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            />
                            <button
                              type="button"
                              onClick={addExpertise}
                            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                            <Plus className="w-5 h-5" />
                            </button>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Technical Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {formData.skills.map((skill, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(skill)}
                                className="ml-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && addSkill()}
                            placeholder="Add technical skill (e.g., Rigging, Sculpting, Lighting)"
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                          </div>
                        </div>
                      </div>

                  {/* Portfolio Website */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio & Website</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Portfolio Website URL
                        </label>
                        <div className="relative">
                          <Globe className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                          onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://your-portfolio.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Portfolio Description
                        </label>
                        <textarea
                          name="portfolioDescription"
                          rows={3}
                          value={formData.portfolioDescription}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all resize-none"
                          placeholder="Brief description of your portfolio and what visitors can expect to see..."
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* PORTFOLIO TAB */}
              {activeTab === 'portfolio' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Portfolio Header */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200/50 dark:border-yellow-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Star className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Portfolio Showcase</h3>
                </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Highlight your best work and achievements to impress potential clients
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-4">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile?.uploadsCount || 0}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">Models Uploaded</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-4">
                        <Download className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile?.totalDownloads || 0}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">Total Downloads</p>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-4">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {profile?.followersCount || 0}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">Followers</p>
                    </div>
                  </div>

                  {/* Portfolio Items Management */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Bookmark className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Portfolio Items</h3>
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                      </button>
                    </div>
                    
                    {/* Portfolio grid placeholder */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4">
                            <Star className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Feature your best work here
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievement Highlights */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Award className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievements & Milestones</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Featured Creator</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Top contributor this month</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Rising Artist</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Fast growing profile</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SOCIAL LINKS TAB */}
              {activeTab === 'social' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Social Header */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-pink-200/50 dark:border-pink-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Link className="w-6 h-6 text-pink-600" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Social Media & Links</h3>
                    </div>
                  <p className="text-gray-600 dark:text-gray-400">
                      Connect your social profiles to build your online presence and make it easy for clients to find you
                  </p>
                  </div>

                  {/* Social Media Links */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Social Media Profiles</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* GitHub */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          GitHub
                      </label>
                        <div className="relative">
                          <Github className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                          <input
                            type="url"
                            value={formData.socialLinks.github}
                            onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://github.com/username"
                          />
                        </div>
                    </div>
                    
                      {/* LinkedIn */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          LinkedIn
                      </label>
                        <div className="relative">
                          <Linkedin className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                      <input
                        type="url"
                            value={formData.socialLinks.linkedin}
                            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                      {/* Twitter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Twitter / X
                      </label>
                        <div className="relative">
                          <Twitter className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                      <input
                            type="url"
                            value={formData.socialLinks.twitter}
                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://twitter.com/username"
                          />
                        </div>
                      </div>

                      {/* Instagram */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Instagram
                        </label>
                        <div className="relative">
                          <Instagram className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                        <input
                            type="url"
                            value={formData.socialLinks.instagram}
                            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://instagram.com/username"
                          />
                      </div>
                    </div>

                      {/* YouTube */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          YouTube
                      </label>
                        <div className="relative">
                          <Youtube className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                      <input
                            type="url"
                            value={formData.socialLinks.youtube}
                            onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://youtube.com/@username"
                          />
                        </div>
                    </div>

                      {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Facebook
              </label>
                        <div className="relative">
                          <Facebook className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                <input
                            type="url"
                            value={formData.socialLinks.facebook}
                            onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://facebook.com/username"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Platform Links */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Portfolio Platforms</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Behance */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Behance
                        </label>
                        <div className="relative">
                          <ExternalLink className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                        <input
                            type="url"
                            value={formData.socialLinks.behance}
                            onChange={(e) => handleSocialLinkChange('behance', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://behance.net/username"
                          />
              </div>
            </div>

                      {/* ArtStation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ArtStation
              </label>
                        <div className="relative">
                          <ExternalLink className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none w-10" />
                      <input
                            type="url"
                            value={formData.socialLinks.artstation}
                            onChange={(e) => handleSocialLinkChange('artstation', e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                            placeholder="https://artstation.com/username"
                      />
                    </div>
                  </div>
                </div>
                  </div>

                  {/* Social Media Tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
                    <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">
                      Tips for Building Your Online Presence
                    </h4>
                    <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Keep your profiles consistent across platforms with the same username and bio</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Regularly showcase your work-in-progress and finished projects</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Engage with the 3D art community by commenting and sharing others' work</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Use relevant hashtags to increase visibility of your posts</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* PAYMENTS TAB */}
              {activeTab === 'payments' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-indigo-200/50 dark:border-indigo-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Smartphone className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Set up your payment methods to receive tips and earnings from your 3D models
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UPI Payment Setup</h3>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowUPISetup(true)
                        }}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Setup UPI
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Receive Tips via UPI
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Set up your UPI ID to receive tips directly in your bank account. Users can send you tips using any UPI app like PhonePe, Google Pay, Paytm, or BHIM.
                          </p>
                          
                          {profile?.upiId ? (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                  UPI Payment Enabled
                                </span>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300">
                                Your UPI ID: <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">{profile.upiId}</code>
                              </p>
                            </div>
                          ) : (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertCircle className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                  UPI Payment Not Set Up
                                </span>
                              </div>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                Click "Setup UPI" to add your UPI ID and start receiving tips.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Features */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Clock className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How UPI Tips Work</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Instant Payments</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Users can tip you directly using any UPI app</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-green-600 dark:text-green-400 text-sm font-bold">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Zero Platform Fees</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Tips go directly to your bank account</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Auto QR Codes</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">QR codes are automatically generated</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">4</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">Wide Compatibility</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Works with all major Indian banks</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Analytics */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Analytics</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">₹0</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total Tips Received</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">0</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Tip Transactions</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">₹0</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">This Month</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ACHIEVEMENTS TAB */}
              {activeTab === 'achievements' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Award className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Achievements & Certifications</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Showcase your professional certifications, awards, and notable achievements
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Award className="w-5 h-5 text-blue-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Certifications</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.certifications.map((cert, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700"
                          >
                            {cert}
                            <button
                              type="button"
                              onClick={() => removeCertification(cert)}
                              className="ml-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && e.preventDefault() && addCertification()}
                          placeholder="Add certification (e.g., Adobe Certified Expert)"
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                        />
                        <button
                          type="button"
                          onClick={addCertification}
                          className="px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Target className="w-5 h-5 text-purple-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Platform Achievements</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">First Upload</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Shared your first 3D model</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Community Builder</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">100+ profile views</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Rising Star</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Featured content</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <Settings className="w-6 h-6 text-gray-600" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Account Settings</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage your account preferences, security settings, and notification options
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Shield className="w-5 h-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                        </div>
                        <input
                          type="checkbox"
                          id="enable2FA"
                          name="enable2FA"
                          checked={formData.enable2FA}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Bell className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your models and account</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Get instant updates in your browser</p>
                        </div>
                        <input
                          type="checkbox"
                          defaultChecked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Shield className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy & Cookies</h3>
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Cookie preferences</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage privacy choices and optional website cookies.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                      >
                        Manage Privacy
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center space-x-3 mb-6">
                      <Globe className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Language & Region</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Interface Language
                        </label>
                        <select className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all">
                          <option>English</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Communication Languages
                        </label>
                        <input
                          type="text"
                          name="languages"
                          value={formData.languages}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          placeholder="e.g., English, Spanish, French"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Enhanced Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-between items-center pt-8 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50 -mx-8 px-8 pb-8 -mb-8 rounded-b-2xl"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Profile completion: <span className="font-semibold text-blue-600 dark:text-blue-400">{profileCompletion}%</span>
                  </div>
                  {autoSave && (
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Auto-saved</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/profile/${user.uid}`)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
                  <motion.button
                type="submit"
                disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      'Update Profile'
                    )}
                  </motion.button>
            </div>
              </motion.div>
            </form>
          </div>
        </motion.div>
      </div>

      {/* UPI Setup Modal */}
      {showUPISetup && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUPISetup(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <UPIProfileSetup onClose={() => setShowUPISetup(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileEdit
