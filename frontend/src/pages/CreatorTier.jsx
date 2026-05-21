import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Progress } from '../components/ui/Progress'
import { Badge } from '../components/ui/Badge'
import CreatorBadge from '../components/ui/CreatorBadge'
import { useToast } from '../hooks/use-toast'
import { 
  Crown, 
  Star, 
  Shield, 
  TrendingUp,
  Upload,
  FileImage,
  Zap,
  Award,
  Users,
  Calendar,
  DollarSign,
  Sparkles
} from 'lucide-react'

const TIER_INFO = {
  basic: {
    name: 'Basic Creator',
    description: 'Start your 3D modeling journey',
    color: 'gray',
    icon: Users
  },
  verified: {
    name: 'Verified Creator',
    description: 'Trusted community member',
    color: 'blue',
    icon: Shield
  },
  pro: {
    name: 'Pro Creator',
    description: 'Professional 3D artist',
    color: 'purple',
    icon: Star
  },
  elite: {
    name: 'Elite Creator',
    description: 'Top-tier creator with exclusive access',
    color: 'orange',
    icon: Crown
  }
}

export default function CreatorTier() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [tierData, setTierData] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTierData()
      fetchUserStats()
    }
  }, [user])

  const fetchTierData = async () => {
    try {
      const result = await firebaseHelpers.getCreatorTier({ userId: user.uid })
      setTierData(result)
    } catch (error) {
      console.error('Error fetching tier data:', error)
      toast({
        title: "Error",
        description: "Failed to load tier information",
        variant: "destructive"
      })
    }
  }

  const fetchUserStats = async () => {
    try {
      const [earningsResult, profileResult] = await Promise.all([
        firebaseHelpers.getCreatorEarnings(user.uid),
        firebaseHelpers.getUserProfile(user.uid)
      ])
      
      setUserStats({
        ...earningsResult,
        ...profileResult,
        modelCount: profileResult.totalModels || 0,
        accountAge: profileResult.createdAt 
          ? Math.floor((Date.now() - new Date(profileResult.createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0
      })
    } catch (error) {
      console.error('Error fetching user stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTier = async () => {
    setUpdating(true)
    try {
      const result = await firebaseHelpers.updateCreatorTier({ userId: user.uid })
      
      toast({
        title: "Tier Updated",
        description: `Your tier has been updated to ${result.tier.toUpperCase()}`,
      })
      
      fetchTierData()
      fetchUserStats()
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update tier",
        variant: "destructive"
      })
    } finally {
      setUpdating(false)
    }
  }

  const calculateProgress = (current, required) => {
    return Math.min((current / required) * 100, 100)
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!tierData || !userStats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Unable to Load Tier Data</h2>
            <p className="text-gray-600">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentTier = tierData.currentTier
  const nextTier = tierData.requirements?.nextTier
  const nextRequirements = tierData.requirements?.nextTierRequirements
  const currentInfo = TIER_INFO[currentTier]
  const benefits = tierData.benefits

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Tier Status</h1>
        <p className="text-gray-600">Track your progress and unlock exclusive benefits</p>
      </div>

      {/* Current Tier Status */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full bg-${currentInfo.color}-100`}>
                <currentInfo.icon className={`w-8 h-8 text-${currentInfo.color}-600`} />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>{currentInfo.name}</span>
                  <CreatorBadge tier={currentTier} size="md" />
                </CardTitle>
                <CardDescription>{currentInfo.description}</CardDescription>
              </div>
            </div>
            <Button onClick={handleUpdateTier} disabled={updating}>
              {updating ? 'Updating...' : 'Refresh Tier'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Current Benefits */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Current Benefits</CardTitle>
          <CardDescription>Perks available with your {currentInfo.name} status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Upload className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Upload Limit</p>
                <p className="text-sm text-gray-600">{benefits.uploadLimit} models/month</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <FileImage className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Max File Size</p>
                <p className="text-sm text-gray-600">{benefits.maxFileSize}MB per file</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium">Revenue Share</p>
                <p className="text-sm text-gray-600">{(benefits.revenueShare * 100).toFixed(0)}% to you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium">Withdrawal Fee</p>
                <p className="text-sm text-gray-600">{(benefits.withdrawalFee * 100).toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium">Featured Chance</p>
                <p className="text-sm text-gray-600">{(benefits.featuredChance * 100).toFixed(0)}%</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="font-medium">Support Priority</p>
                <p className="text-sm text-gray-600 capitalize">{benefits.supportPriority}</p>
              </div>
            </div>
          </div>
          
          {benefits.exclusiveFeatures && benefits.exclusiveFeatures.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Exclusive Features</h4>
              <div className="flex flex-wrap gap-2">
                {benefits.exclusiveFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      {nextTier && nextRequirements && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Progress to {TIER_INFO[nextTier].name}</span>
            </CardTitle>
            <CardDescription>Complete these requirements to unlock the next tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Downloads Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Downloads</span>
                  <span className="text-sm text-gray-600">
                    {formatNumber(userStats.totalDownloads || 0)} / {formatNumber(nextRequirements.minDownloads)}
                  </span>
                </div>
                <Progress value={calculateProgress(userStats.totalDownloads || 0, nextRequirements.minDownloads)} />
              </div>

              {/* Earnings Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Earnings (₹)</span>
                  <span className="text-sm text-gray-600">
                    ₹{(userStats.totalEarnings || 0).toFixed(0)} / ₹{nextRequirements.minEarnings}
                  </span>
                </div>
                <Progress value={calculateProgress(userStats.totalEarnings || 0, nextRequirements.minEarnings)} />
              </div>

              {/* Models Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Published Models</span>
                  <span className="text-sm text-gray-600">
                    {userStats.modelCount || 0} / {nextRequirements.minModels}
                  </span>
                </div>
                <Progress value={calculateProgress(userStats.modelCount || 0, nextRequirements.minModels)} />
              </div>

              {/* Account Age Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Account Age (days)</span>
                  <span className="text-sm text-gray-600">
                    {userStats.accountAge} / {nextRequirements.accountAge}
                  </span>
                </div>
                <Progress value={calculateProgress(userStats.accountAge, nextRequirements.accountAge)} />
              </div>

              {/* Rating Progress (if required) */}
              {nextRequirements.minRating && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Average Rating</span>
                    <span className="text-sm text-gray-600">
                      {(userStats.rating || 0).toFixed(1)} / {nextRequirements.minRating}
                    </span>
                  </div>
                  <Progress value={calculateProgress(userStats.rating || 0, nextRequirements.minRating)} />
                </div>
              )}

              {/* Featured Requirement */}
              {nextRequirements.featured && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Featured Status Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    You need to have featured content to reach Elite tier. Create exceptional models to get featured!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tiers Overview */}
      <Card className="bg-gray-900 dark:bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">All Creator Tiers</CardTitle>
          <CardDescription className="text-gray-300">Overview of all available creator tiers and their benefits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(TIER_INFO).map(([tier, info]) => {
              const tierBenefits = tierData.allTiers[tier]
              const isCurrentTier = tier === currentTier
              
              return (
                <div
                  key={tier}
                  className={`p-4 rounded-lg border-2 ${
                    isCurrentTier 
                      ? `border-${info.color}-500 bg-${info.color}-900/30` 
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <info.icon className={`w-6 h-6 text-${info.color}-400`} />
                    {isCurrentTier && <Badge variant="default" className="bg-blue-600 text-white">Current</Badge>}
                  </div>
                  
                  <h3 className="font-semibold mb-1 text-white">{info.name}</h3>
                  <p className="text-sm text-gray-300 mb-3">{info.description}</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Upload Limit:</span>
                      <span className="text-white font-medium">{tierBenefits.uploadLimit}/month</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Revenue Share:</span>
                      <span className="text-white font-medium">{(tierBenefits.revenueShare * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Featured Chance:</span>
                      <span className="text-white font-medium">{(tierBenefits.featuredChance * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
