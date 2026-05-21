import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { getModelAltText, getModelUrl } from '../lib/modelLinks'
import TipButton from '../components/ui/TipButton'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import PageMeta from '../components/PageMeta'
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Globe, 
  Download, 
  Upload, 
  Edit3, 
  Settings,
  Heart,
  Eye,
  Share2,
  MoreVertical,
  ExternalLink,
  UserPlus,
  UserMinus,
  Loader2,
  Star,
  Award,
  Crown,
  Zap,
  Target,
  Flame,
  Sparkles,
  TrendingUp,
  Grid3X3,
  List,
  Filter,
  Search,
  Copy,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Camera,
  BadgeCheck,
  Gift,
  Coffee,
  ArrowRight
} from 'lucide-react'

const PLATFORM_ACCOUNT_EMAILS = ['threedsharespace@gmail.com']
const PLATFORM_ACCOUNT_IDS = ['Bit2fGqznKheFgEg2dTEPCIIKw32']

const isPlatformAccount = (profile) => {
  const email = (profile?.email || '').toLowerCase()
  const id = profile?.uid || profile?.id
  const username = (profile?.username || '').toLowerCase()
  const displayName = (profile?.displayName || '').toLowerCase()
  return PLATFORM_ACCOUNT_EMAILS.includes(email) ||
    PLATFORM_ACCOUNT_IDS.includes(id) ||
    username === 'admin' ||
    displayName === 'admin' ||
    profile?.isPlatformAccount === true
}

const ProfileView = () => {
  const { userId } = useParams()
  const { user: currentUser, profile: currentProfile } = useAuth()
  const { scrollY } = useScroll()
  const headerY = useTransform(scrollY, [0, 100], [0, -50])
  const heroParallax = useTransform(scrollY, [0, 500], [0, -100])
  const statsScale = useTransform(scrollY, [0, 300], [1, 0.95])
  
  const [profile, setProfile] = useState(null)
  const [models, setModels] = useState([])
  const [likedModels, setLikedModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('models')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 })
  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'popular', 'downloads'
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [socialShareCopied, setSocialShareCopied] = useState('')
  const [hoveredModel, setHoveredModel] = useState(null)
  const [profileViews, setProfileViews] = useState(0)
  const [achievements, setAchievements] = useState([])
  const [showAchievements, setShowAchievements] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('🔄 Starting to fetch profile for userId:', userId)
        console.log('🔧 firebaseHelpers available:', !!firebaseHelpers)
        console.log('🔧 firebaseHelpers.getModels:', !!firebaseHelpers?.getModels)
        setLoading(true)
        
        // Fetch real user profile
        const userProfile = await firebaseHelpers.getUserProfile(userId)
        
        if (userProfile.success) {
          setProfile(userProfile.profile)
        } else {
          // Fallback to basic profile if user not found
          setProfile({
            id: userId,
            username: userId,
            email: '',
            displayName: userId,
            bio: '3D Model Creator',
            avatar: null,
            location: '',
            website: '',
            joinDate: new Date().toISOString().split('T')[0],
            totalDownloads: 0,
            totalLikes: 0,
            totalViews: 0,
            isVerified: false,
            socialLinks: {}
          })
        }

        // Fetch real models from Firestore
        const modelsResult = await firebaseHelpers.getModels({ userId: userId })
        
        if (modelsResult.success) {
          // Get real-time stats for each model
          const modelsWithStats = await Promise.all(
            modelsResult.models.map(async (model) => {
              const statsResult = await firebaseHelpers.getModelStats(model.id);
              if (statsResult.success) {
                return {
                  ...model,
                  likes: statsResult.stats.likes,
                  downloads: statsResult.stats.downloads,
                  views: model.views || 0
                };
              }
              return model;
            })
          );
          
          setModels(modelsWithStats)
        } else {
          setModels([])
        }

        // Fetch liked models
        const likedModelsResult = await firebaseHelpers.getLikedModels(userId)
        
        if (likedModelsResult.success) {
          // Get real-time stats for each liked model
          const likedModelsWithStats = await Promise.all(
            likedModelsResult.models.map(async (model) => {
              const statsResult = await firebaseHelpers.getModelStats(model.id);
              if (statsResult.success) {
                return {
                  ...model,
                  likes: statsResult.stats.likes,
                  downloads: statsResult.stats.downloads,
                  views: model.views || 0
                };
              }
              return model;
            })
          );
          
          setLikedModels(likedModelsWithStats)
        } else {
          setLikedModels([])
        }

        setLoading(false)
      } catch (err) {
        console.error('💥 Profile fetch error:', err)
        setError('Failed to load profile')
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfile()
    }
  }, [userId])

  // Real-time statistics updater for models
  useEffect(() => {
    if (!models.length) return;

    const updateModelStats = async () => {
      try {
        const updatedModels = await Promise.all(
          models.map(async (model) => {
            // Get real-time stats for each model
            const statsResult = await firebaseHelpers.getModelStats(model.id);
            if (statsResult.success) {
              return {
                ...model,
                likes: statsResult.stats.likes,
                downloads: statsResult.stats.downloads,
                views: model.views || 0
              };
            }
            return model;
          })
        );
        
        setModels(updatedModels);
      } catch (error) {
        console.error('Error updating model stats:', error);
      }
    };

    // Update stats immediately
    updateModelStats();

    // Set up interval to update stats every 30 seconds
    const interval = setInterval(updateModelStats, 30000);

    return () => clearInterval(interval);
  }, [models.length]);

  // Check follow status and stats when profile loads
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (profile?.uid && currentUser && !isOwnProfile) {
        try {
          const [followStatus, stats] = await Promise.all([
            firebaseHelpers.checkFollowStatus(profile.uid),
            firebaseHelpers.getFollowStats(profile.uid)
          ])
          
          if (followStatus.success) {
            setIsFollowing(followStatus.isFollowing)
          }
          
          if (stats.success) {
            console.log('📊 Setting follow stats:', stats);
            setFollowStats(stats)
          } else {
            console.log('❌ Failed to get follow stats:', stats);
          }
        } catch (error) {
          console.error('Error checking follow status:', error)
        }
      } else if (profile?.uid && isOwnProfile) {
        // Load own follow stats
        try {
          const stats = await firebaseHelpers.getFollowStats(profile.uid)
          if (stats.success) {
            console.log('📊 Setting own follow stats:', stats);
            setFollowStats(stats)
          } else {
            console.log('❌ Failed to get own follow stats:', stats);
          }
        } catch (error) {
          console.error('Error loading follow stats:', error)
        }
      }
    }

    checkFollowStatus()
  }, [profile?.uid, currentUser])

  const handleFollow = async () => {
    if (!profile?.uid || !currentUser || isOwnProfile) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        const result = await firebaseHelpers.unfollowUser(profile.uid)
        if (result.success) {
          setIsFollowing(false)
          // Update the followed user's followers count
          setFollowStats(prev => ({
            ...prev,
            followers: Math.max(0, prev.followers - 1)
          }))
        }
      } else {
        const result = await firebaseHelpers.followUser(profile.uid)
        if (result.success) {
          setIsFollowing(true)
          // Update the followed user's followers count
          setFollowStats(prev => ({
            ...prev,
            followers: prev.followers + 1
          }))
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    } finally {
      setFollowLoading(false)
    }
  }

  const getFollowersList = async () => {
    if (!profile?.uid) return
    
    try {
      const result = await firebaseHelpers.getFollowersList(profile.uid)
      if (result.success) {
        setFollowersList(result.followers)
        setShowFollowersModal(true)
      }
    } catch (error) {
      console.error('Error getting followers list:', error)
    }
  }

  const getFollowingList = async () => {
    if (!profile?.uid) return
    
    try {
      const result = await firebaseHelpers.getFollowingList(profile.uid)
      if (result.success) {
        setFollowingList(result.following)
        setShowFollowingModal(true)
      }
    } catch (error) {
      console.error('Error getting following list:', error)
    }
  }

  const isOwnProfile = currentUser && profile && currentUser.uid === profile.uid
  const isPlatformProfile = isPlatformAccount(profile)
  const profileName = isPlatformProfile ? '3D ShareSpace' : (profile?.displayName || profile?.username || userId)
  const profileUsername = isPlatformProfile ? 'platform' : (profile?.username || userId)
  const profileBio = isPlatformProfile ? 'Official platform library for free 3D models.' : (profile?.bio || '3D Model Creator')
  const profileUrl = `/profile/${userId}`
  const profileDescription = profile
    ? `${profileName} shares ${models.length} free 3D models on 3D ShareSpace. View creator bio, downloads, likes, and public 3D assets.`
    : ''
  const profileJsonLd = profile ? [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: `${profileName} 3D Creator Profile`,
      description: profileDescription,
      url: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}${profileUrl}`,
      mainEntity: {
        '@type': 'Person',
        name: profileName,
        alternateName: profileUsername,
        description: profileBio,
        image: isPlatformProfile ? undefined : (profile.avatar || undefined),
        url: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}${profileUrl}`
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${profileName} 3D Models`,
      numberOfItems: models.length,
      itemListElement: models.slice(0, 10).map((model, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'}${getModelUrl(model)}`,
        name: model.title
      }))
    }
  ] : null

  // Enhanced helper functions
  const copyToClipboard = async (text, type = 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setSocialShareCopied(type)
      setTimeout(() => setSocialShareCopied(''), 2000)
      setShowShareMenu(false)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const filterAndSortModels = (modelsArray) => {
    let filtered = modelsArray.filter(model => 
      model.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    switch (sortBy) {
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      case 'popular':
        return filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
      case 'downloads':
        return filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      default: // newest
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 dark:bg-blue-600/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -150, 0],
              y: [0, 100, 0],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200/30 dark:bg-purple-600/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-200/30 dark:bg-emerald-600/20 rounded-full blur-xl"
          />
        </div>
        
        <div className="text-center relative z-10">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 rounded-full mx-auto mb-4"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-600 border-r-purple-600 rounded-full mx-auto"
              />
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <User className="w-8 h-8 text-blue-500" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
          >
            Loading Amazing Profile
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Discovering creativity and talent...
          </motion.p>
          
          {/* Loading progress dots */}
          <motion.div 
            className="flex items-center justify-center space-x-2 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-blue-500 rounded-full"
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The profile you\'re looking for doesn\'t exist.'}
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  const filteredModels = filterAndSortModels(models)
  const filteredLikedModels = filterAndSortModels(likedModels)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      {/* Enhanced Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          style={{ y: headerY }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"
        />
      </div>
      {profile && (
        <PageMeta
          title={`${profileName} 3D Models | 3D ShareSpace`}
          description={profileDescription}
          keywords={`3D creator, free 3D models, ${profileUsername}, ${profileName}`}
          url={profileUrl}
          image={isPlatformProfile ? '/favicon.svg' : (profile.avatar || '/favicon.svg')}
          type="profile"
          jsonLd={profileJsonLd}
        />
      )}
      {/* Enhanced Hero Header */}
      <motion.div 
        style={{ y: headerY }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-2xl border-b border-white/20 dark:border-gray-700/50 relative z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex items-center space-x-8">
              {/* Enhanced Avatar */}
              <motion.div 
                className="flex-shrink-0 relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 300 }}
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <div className="relative">
                  <motion.div 
                    className="h-32 w-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/50 dark:border-gray-700/50"
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(59, 130, 246, 0.3)",
                        "0 0 40px rgba(147, 51, 234, 0.4)",
                        "0 0 20px rgba(59, 130, 246, 0.3)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {!isPlatformProfile && profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt={profileName} 
                        className="h-32 w-32 rounded-full object-cover" 
                      />
                    ) : (
                      <User className="h-16 w-16 text-white" />
                    )}
                  </motion.div>
                  
                  {/* Online status indicator */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-full h-full bg-green-400 rounded-full"
                    />
                  </motion.div>
                  
                  {/* Floating sparkles */}
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 8, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="absolute -top-2 -right-2"
                  >
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profileName}
                  </h1>
                  {profile.isVerified && (
                    <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  @{profileUsername}
                </p>
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                  {profileBio}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 lg:mt-0 flex items-center space-x-3">
              {isOwnProfile ? (
                <Link to="/profile/edit">
                  <Button variant="outline" className="h-9 px-4"><Edit3 className="h-4 w-4 mr-2" />Edit Profile</Button>
                </Link>
              ) : isPlatformProfile ? (
                <Button className="h-9 px-4 inline-flex items-center" variant="outline"><BadgeCheck className="h-4 w-4 mr-2" />Official Platform</Button>
              ) : (
                <>
                  <Button onClick={handleFollow} disabled={followLoading} className="h-9 px-4 inline-flex items-center">
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : isFollowing ? (
                      <UserMinus className="h-4 w-4 mr-2" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-2" />
                    )}
                    {followLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <TipButton
                    creatorId={userId}
                    creatorName={profileName}
                    variant="default"
                  />
                  <Button className="h-9 px-4 inline-flex items-center"><Share2 className="h-4 w-4 mr-2" />Share</Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {models.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Models</div>
            </div>
            <div className="text-center">
              {isOwnProfile ? (
                <Button 
                  onClick={getFollowersList}
                  variant="ghost"
                  className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {followStats.followers}
                </Button>
              ) : (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {followStats.followers}
                </div>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              {isOwnProfile ? (
                <Button 
                  onClick={getFollowingList}
                  variant="ghost"
                  className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {followStats.following}
                </Button>
              ) : (
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {followStats.following}
                </div>
              )}
              <div className="text-sm text-gray-600 dark:text-gray-400">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {models.reduce((total, model) => total + (model.downloads || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {models.reduce((total, model) => total + (model.likes || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {models.reduce((total, model) => total + (model.views || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Views</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-medium text-luxury-text-primary dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {!isPlatformProfile && profile.email && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {!isPlatformProfile && profile.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-3 text-gray-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {!isPlatformProfile && profile.website && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Globe className="h-4 w-4 mr-3 text-gray-400" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        {profile.website}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-luxury-text-primary dark:text-white mb-4">
                    Social Links
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(profile.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span className="capitalize">{platform}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              

            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  <Button onClick={() => setActiveTab('models')} variant="ghost" className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'models' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Models ({models.length})</Button>
                  <Button onClick={() => setActiveTab('likes')} variant="ghost" className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'likes' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Liked Models ({likedModels.length})</Button>
                  <Button onClick={() => setActiveTab('collections')} variant="ghost" className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'collections' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Collections</Button>
                  {isOwnProfile && (
                    <Button onClick={() => setActiveTab('social')} variant="ghost" className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'social' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>Social</Button>
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'models' && (
                  <>
                    {models.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {models.map((model) => (
                          <div key={model.id} className="bg-luxury-bg-card dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                            <div className="aspect-w-16 aspect-h-9">
                              {model.previewImages && model.previewImages.length > 0 ? (
                                <img
                                  src={model.previewImages[0].url}
                                  alt={getModelAltText(model, 'profile model preview')}
                                  className="w-full h-48 object-cover"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-400 text-sm">No Preview</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {model.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {model.description}
                              </p>
                              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                                <span>{model.category}</span>
                                <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center">
                                    <Download className="h-4 w-4 mr-1" />
                                    {model.downloads || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-4 w-4 mr-1" />
                                    {model.likes || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {model.views || 0}
                                  </span>
                                </div>
                                <Link
                                  to={getModelUrl(model)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-luxury-text-primary dark:text-white mb-2">
                          No models uploaded yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          Start sharing your 3D models with the community!
                        </p>
                        <Link
                          to="/upload"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Your First Model
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'likes' && (
                  <>
                    {likedModels.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {likedModels.map((model) => (
                          <div key={model.id} className="bg-luxury-bg-card dark:bg-gray-700 rounded-lg shadow overflow-hidden">
                            <div className="aspect-w-16 aspect-h-9">
                              {model.previewImages && model.previewImages.length > 0 ? (
                                <img
                                  src={model.previewImages[0].url}
                                  alt={getModelAltText(model, 'profile model preview')}
                                  className="w-full h-48 object-cover"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-400 text-sm">No Preview</span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {model.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                                {model.description}
                              </p>
                              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                                <span>{model.category}</span>
                                <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center">
                                    <Download className="h-4 w-4 mr-1" />
                                    {model.downloads || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-4 w-4 mr-1" />
                                    {model.likes || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {model.views || 0}
                                  </span>
                                </div>
                                <Link
                                  to={getModelUrl(model)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                                >
                                  View Details
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-luxury-text-primary dark:text-white mb-2">
                          No liked models yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Models you like will appear here
                        </p>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'collections' && (
                  <div className="text-center py-12">
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 text-xl">📁</span>
                    </div>
                    <h3 className="text-lg font-medium text-luxury-text-primary dark:text-white mb-2">
                      No collections yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Create collections to organize your favorite models
                    </p>
                  </div>
                )}

                {activeTab === 'social' && isOwnProfile && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Social Connections</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Followers Section */}
                      <div className="bg-luxury-bg-card dark:bg-gray-700 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-luxury-text-primary dark:text-white">Followers</h4>
                          <button
                            onClick={getFollowersList}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View All
                          </button>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {followStats.followers}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            People following you
                          </div>
                        </div>
                      </div>

                      {/* Following Section */}
                      <div className="bg-luxury-bg-card dark:bg-gray-700 rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-md font-medium text-luxury-text-primary dark:text-white">Following</h4>
                          <button
                            onClick={getFollowingList}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            View All
                          </button>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {followStats.following}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            People you follow
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-luxury-bg-card dark:bg-gray-700 rounded-lg shadow p-6">
                      <h4 className="text-md font-medium text-luxury-text-primary dark:text-white mb-4">Recent Activity</h4>
                      <div className="text-center py-8">
                        <div className="h-12 w-12 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                          <span className="text-gray-400 text-xl">📊</span>
                        </div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          No recent activity
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Follow activity will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      {showFollowersModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFollowersModal(false)}
        >
          <div 
            className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Followers ({followStats.followers})
              </h3>
              <button
                onClick={() => setShowFollowersModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {followersList.length > 0 ? (
                followersList.map((follower) => (
                  <div key={follower.uid} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {follower.displayName || follower.username || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{follower.username || follower.uid}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No followers yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {showFollowingModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowFollowingModal(false)}
        >
          <div 
            className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Following ({followStats.following})
              </h3>
              <button
                onClick={() => setShowFollowingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {followingList.length > 0 ? (
                followingList.map((following) => (
                  <div key={following.uid} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                    <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {following.displayName || following.username || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{following.username || following.uid}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Not following anyone yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileView
