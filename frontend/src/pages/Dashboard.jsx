import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Upload, 
  Download, 
  Heart,
  Eye,
  Users,
  UserPlus,
  TrendingUp,
  BarChart3,
  Settings,
  Edit3,
  Plus,
  Calendar,
  Award,
  Star,
  Crown,
  Sparkles,
  Zap,
  Target,
  Flame,
  Gift,
  Coffee,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import PageMeta from '../components/PageMeta'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    totalLikes: 0,
    totalComments: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login', { replace: true, state: { from: { pathname: '/dashboard' } } })
      return
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Load follow stats
        const followStats = await firebaseHelpers.getFollowStats(user.uid)
        if (followStats.success) {
          setStats(prev => ({
            ...prev,
            followers: followStats.followers,
            following: followStats.following
          }))
        }

        // Load user models to calculate total likes and comments
        const modelsResult = await firebaseHelpers.getModels({ userId: user.uid })
        if (modelsResult.success) {
          const totalLikes = modelsResult.models.reduce((total, model) => total + (model.likes || 0), 0)
          const totalComments = modelsResult.models.reduce((total, model) => total + (model.comments || 0), 0)
          
          setStats(prev => ({
            ...prev,
            totalLikes,
            totalComments
          }))
        }

        // Load recent social activity (followers, likes, comments)
        await loadRecentActivity()
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadRecentActivity = async () => {
      try {
        // Get recent followers
        const followersResult = await firebaseHelpers.getFollowersList(user.uid)
        if (followersResult.success) {
          const recentFollowers = followersResult.followers.slice(0, 5).map(follower => ({
            type: 'follow',
            user: follower,
            timestamp: new Date(),
            message: `${follower.displayName || follower.username} started following you`
          }))
          
          setRecentActivity(prev => [...prev, ...recentFollowers])
        }

        // Get recent following
        const followingResult = await firebaseHelpers.getFollowingList(user.uid)
        if (followingResult.success) {
          const recentFollowing = followingResult.following.slice(0, 3).map(following => ({
            type: 'following',
            user: following,
            timestamp: new Date(),
            message: `You started following ${following.displayName || following.username}`
          }))
          
          setRecentActivity(prev => [...prev, ...recentFollowing])
        }

        // Sort by timestamp (most recent first)
        setRecentActivity(prev => prev.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10))
      } catch (error) {
        console.error('Error loading recent activity:', error)
      }
    }

    loadDashboardData()
  }, [authLoading, user, navigate])

  const getFollowersList = async () => {
    if (!user?.uid) return
    
    try {
      const result = await firebaseHelpers.getFollowersList(user.uid)
      if (result.success) {
        setFollowersList(result.followers)
        setShowFollowersModal(true)
      }
    } catch (error) {
      console.error('Error getting followers list:', error)
    }
  }

  const getFollowingList = async () => {
    if (!user?.uid) return
    
    try {
      const result = await firebaseHelpers.getFollowingList(user.uid)
      if (result.success) {
        setFollowingList(result.following)
        setShowFollowingModal(true)
      }
    } catch (error) {
      console.error('Error getting following list:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      <PageMeta
        title="Dashboard – 3D ShareSpace"
        description="Your personal dashboard for managing 3D models, tracking analytics, and connecting with the community."
        keywords="dashboard, 3D models, analytics, creator tools"
        url="/dashboard"
        type="website"
      />
      
      {/* Enhanced Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.1, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 dark:border-gray-700/50 p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-6">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1"
                >
                  <Crown className="w-5 h-5 text-yellow-400" />
                </motion.div>
              </motion.div>
              
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-gray-900 dark:text-white"
                >
                  Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {profile?.displayName || profile?.username || 'Creator'}
                  </span>! 
                  <motion.span
                    animate={{ rotate: [0, 20, -20, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
                    className="inline-block ml-2"
                  >
                    👋
                  </motion.span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-400 mt-1"
                >
                  Your creative journey dashboard - track your impact and discover new opportunities
                </motion.p>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex space-x-3"
            >
              <Link to="/upload">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="h-12 px-6 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Upload Model
                  </Button>
                </motion.div>
              </Link>
              <Link to="/profile/edit">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" className="h-12 px-6 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500">
                    <Settings className="h-5 w-5 mr-2" />
                    Settings
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.div>

                 {/* Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
           <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
             <div className="flex items-center">
               <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                 <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Followers</p>
                 <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.followers}</p>
               </div>
             </div>
           </div>

           <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
             <div className="flex items-center">
               <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                 <UserPlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Following</p>
                 <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.following}</p>
               </div>
             </div>
           </div>

           <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
             <div className="flex items-center">
               <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                 <Heart className="h-6 w-6 text-red-600 dark:text-red-400" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Likes</p>
                 <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalLikes}</p>
               </div>
             </div>
           </div>

           <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
             <div className="flex items-center">
               <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                 <Edit3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
               </div>
               <div className="ml-4">
                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Comments</p>
                 <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalComments}</p>
               </div>
             </div>
           </div>
         </div>

                 {/* Main Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Social Activity */}
           <div className="lg:col-span-2">
             <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Social Activity</h3>
                   <Link to="/profile">
                     <Button variant="ghost" className="h-8 px-3 text-blue-600 dark:text-blue-300">View Profile</Button>
                   </Link>
                 </div>
               </div>
               <div className="p-6">
                 {recentActivity.length > 0 ? (
                   <div className="space-y-4">
                     {recentActivity.map((activity, index) => (
                       <div key={index} className="flex items-center space-x-4 p-4 bg-luxury-bg-secondary dark:bg-gray-700 rounded-lg">
                         <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                           <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                         </div>
                         <div className="flex-1">
                           <p className="text-sm text-luxury-text-primary dark:text-white">{activity.message}</p>
                           <p className="text-xs text-luxury-text-muted dark:text-gray-400">
                             {activity.timestamp.toLocaleDateString()}
                           </p>
                         </div>
                         <div className="flex items-center space-x-2">
                           {activity.type === 'follow' && (
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                               New Follower
                             </span>
                           )}
                           {activity.type === 'following' && (
                             <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                               Following
                             </span>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                     <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No recent activity</h4>
                     <p className="text-gray-500 dark:text-gray-400 mb-4">Start connecting with other creators to see activity here!</p>
                     <Link to="/explore">
                       <Button className="h-9 px-4"><TrendingUp className="h-4 w-4 mr-2" />Explore Creators</Button>
                     </Link>
                   </div>
                 )}
               </div>
             </div>
           </div>

          {/* Social & Quick Actions */}
          <div className="space-y-6">
            {/* Social Stats */}
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                 <h3 className="text-lg font-medium text-luxury-text-primary dark:text-white">Social</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Followers</span>
                    </div>
                    <button
                      onClick={getFollowersList}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {stats.followers} View All
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Following</span>
                    </div>
                    <button
                      onClick={getFollowingList}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                    >
                      {stats.following} View All
                    </button>
                  </div>
                </div>
              </div>
            </div>

                         {/* Quick Actions */}
             <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
               <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                 <h3 className="text-lg font-medium text-luxury-text-primary dark:text-white">Quick Actions</h3>
               </div>
               <div className="p-6">
                 <div className="space-y-3">
                   <Link
                     to="/explore"
                     className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                   >
                     <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                     <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Explore Creators</span>
                   </Link>
                   <Link
                     to="/profile/edit"
                     className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                   >
                     <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Edit Profile</span>
                   </Link>
                   <Link
                     to="/upload"
                     className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                   >
                     <Plus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                     <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Model</span>
                   </Link>
                 </div>
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
                Followers ({stats.followers})
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
                Following ({stats.following})
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

export default Dashboard
