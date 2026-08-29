import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useToast } from '../hooks/use-toast'
import { 
  Share, 
  Copy, 
  Users, 
  DollarSign, 
  TrendingUp,
  Gift,
  ExternalLink,
  QrCode,
  Twitter,
  Facebook,
  MessageCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function ReferralDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [referralData, setReferralData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showMilestones, setShowMilestones] = useState(false)

  useEffect(() => {
    if (user) {
      fetchReferralData()
    }
  }, [user])

  const fetchReferralData = async () => {
    try {
      const result = await firebaseHelpers.generateReferralCode()
      setReferralData(result)
    } catch (error) {
      console.error('Error fetching referral data:', error)
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode)
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard"
    })
  }

  const copyReferralUrl = () => {
    navigator.clipboard.writeText(referralData.referralUrl)
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard"
    })
  }

  const shareReferral = async (platform) => {
    const shareData = {
      title: "Join 3DShareSpace - Get ₹50 Bonus!",
      text: `I'm inviting you to join 3DShareSpace, the best platform for 3D models! Use my referral code "${referralData.referralCode}" and get ₹50 bonus when you sign up!`,
      url: referralData.referralUrl
    }

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      const encodedText = encodeURIComponent(shareData.text)
      const encodedUrl = encodeURIComponent(shareData.url)
      
      const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
        whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`
      }
      
      if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400')
      }
    }
  }

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(referralData.referralUrl)}`
    const newWindow = window.open('', '_blank')
    newWindow.document.write(`
      <html>
        <head><title>Referral QR Code</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f0f0f0;">
          <div style="text-align:center;background:white;padding:20px;border-radius:10px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            <h3>Scan to Join with Your Referral</h3>
            <img src="${qrUrl}" alt="Referral QR Code" style="max-width:300px;" />
            <p style="margin-top:10px;color:#666;">Code: ${referralData.referralCode}</p>
          </div>
        </body>
      </html>
    `)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!referralData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Unable to Load Referral Data</h2>
            <p className="text-gray-600">Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = referralData.stats

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
        <p className="text-gray-600">Invite friends and earn rewards together!</p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Signups</p>
                <p className="text-2xl font-bold">{stats.totalReferrals || 0}</p>
                <p className="text-xs text-blue-500">People joined</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Creators</p>
                <p className="text-2xl font-bold">{stats.activeReferrals || 0}</p>
                <p className="text-xs text-green-500">1000+ downloads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Gift className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Milestone Bonuses</p>
                <p className="text-2xl font-bold">₹{(stats.milestoneEarnings || 0).toFixed(0)}</p>
                <p className="text-xs text-purple-500">One-time rewards</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Earnings</p>
                <p className="text-2xl font-bold">₹{(stats.commissionEarnings || 0).toFixed(2)}</p>
                <p className="text-xs text-yellow-500">Ongoing income</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="w-5 h-5 mr-2" />
            How Referral Program Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Share Your Link</h3>
              <p className="text-sm text-gray-600">Share your unique referral link with friends and on social media</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Friends Join & Engage</h3>
              <p className="text-sm text-gray-600">They sign up using your code and start contributing to the community</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Milestone Rewards</h3>
              <p className="text-sm text-gray-600">Earn increasing bonuses as they hit engagement milestones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Rewards Structure */}
      <Card className="mb-8 bg-gray-900 dark:bg-gray-900 border-gray-700">
        <CardHeader>
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-800 rounded-lg p-2 -m-2 transition-colors"
            onClick={() => setShowMilestones(!showMilestones)}
          >
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              <div>
                <CardTitle className="flex items-center text-white">
                  Milestone Reward Structure
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    Click to {showMilestones ? 'collapse' : 'expand'}
                  </span>
                </CardTitle>
                <CardDescription className="text-gray-300">Earn progressive bonuses as your referrals become active members</CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {showMilestones ? (
                <ChevronUp className="w-5 h-5 text-gray-300" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-300" />
              )}
            </div>
          </div>
        </CardHeader>
        {showMilestones && (
          <CardContent>
            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-lg">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-white mb-2">📋 Referral Milestone Structure</h4>
                <p className="text-gray-300 text-sm">Earn progressive rewards as your referrals become active community members</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <div className="flex items-center space-x-3">
                    <span className="text-blue-400">📝</span>
                    <div>
                      <span className="text-white font-medium">Registration</span>
                      <span className="text-gray-400 ml-2">- Friend signs up with your code</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-400 font-semibold">₹0</span>
                    <span className="text-gray-500 text-xs ml-1">(No instant bonus)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400">🎯</span>
                    <div>
                      <span className="text-white font-medium">First Upload</span>
                      <span className="text-gray-400 ml-2">- Friend uploads their first 3D model</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-green-400 font-semibold">₹25</span>
                    <span className="text-gray-500 text-xs ml-1">(Both earn)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <div className="flex items-center space-x-3">
                    <span className="text-purple-400">🔥</span>
                    <div>
                      <span className="text-white font-medium">Popular Creator</span>
                      <span className="text-gray-400 ml-2">- Friend reaches 100 total downloads</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-purple-400 font-semibold">₹50</span>
                    <span className="text-gray-500 text-xs ml-1">(Quality bonus)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <div className="flex items-center space-x-3">
                    <span className="text-yellow-400">🏆</span>
                    <div>
                      <span className="text-white font-medium">Active Creator</span>
                      <span className="text-gray-400 ml-2">- Friend reaches 1000 downloads</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-yellow-400 font-semibold">₹100</span>
                    <span className="text-gray-500 text-xs ml-1">(Major milestone)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-orange-400">💰</span>
                    <div>
                      <span className="text-white font-medium">Ongoing Commission</span>
                      <span className="text-gray-400 ml-2">- 5% of friend's monthly earnings</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-orange-400 font-semibold">5%</span>
                    <span className="text-gray-500 text-xs ml-1">(Lifetime)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-600">
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 text-lg">🛡️</span>
                  <div>
                    <h5 className="text-white font-medium mb-2">Anti-Abuse Protection</h5>
                    <ul className="text-gray-300 text-xs space-y-1">
                      <li>• No instant signup bonuses prevent fake accounts</li>
                      <li>• Milestones require genuine engagement and community contribution</li>
                      <li>• Account verification required for all milestone rewards</li>
                      <li>• Suspicious activity automatically flagged and reviewed</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Referral Code & Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Details</CardTitle>
          <CardDescription>Share these with friends to earn rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Referral Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Code
            </label>
            <div className="flex items-center space-x-2">
              <Input 
                value={referralData.referralCode} 
                readOnly 
                className="font-mono text-lg font-bold bg-gray-50"
              />
              <Button onClick={copyReferralCode} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Referral URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Link
            </label>
            <div className="flex items-center space-x-2">
              <Input 
                value={referralData.referralUrl} 
                readOnly 
                className="font-mono text-sm bg-gray-50"
              />
              <Button onClick={copyReferralUrl} variant="outline">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Options */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Share Your Referral</CardTitle>
          <CardDescription>Choose your preferred sharing method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Native Share */}
            {navigator.share && (
              <Button 
                onClick={() => shareReferral('native')}
                variant="outline"
                className="h-auto py-4 flex-col"
              >
                <Share className="w-6 h-6 mb-2" />
                <span className="text-sm">Share</span>
              </Button>
            )}

            {/* Twitter */}
            <Button 
              onClick={() => shareReferral('twitter')}
              variant="outline"
              className="h-auto py-4 flex-col"
            >
              <Twitter className="w-6 h-6 mb-2 text-blue-400" />
              <span className="text-sm">Twitter</span>
            </Button>

            {/* Facebook */}
            <Button 
              onClick={() => shareReferral('facebook')}
              variant="outline"
              className="h-auto py-4 flex-col"
            >
              <Facebook className="w-6 h-6 mb-2 text-blue-600" />
              <span className="text-sm">Facebook</span>
            </Button>

            {/* WhatsApp */}
            <Button 
              onClick={() => shareReferral('whatsapp')}
              variant="outline"
              className="h-auto py-4 flex-col"
            >
              <MessageCircle className="w-6 h-6 mb-2 text-green-500" />
              <span className="text-sm">WhatsApp</span>
            </Button>

            {/* QR Code */}
            <Button 
              onClick={generateQRCode}
              variant="outline"
              className="h-auto py-4 flex-col"
            >
              <QrCode className="w-6 h-6 mb-2" />
              <span className="text-sm">QR Code</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
          <CardDescription>How you earn from referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Friend Signup Bonus</p>
                <p className="text-sm text-gray-600">When someone joins with your code</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">₹100</p>
                <p className="text-xs text-gray-500">After 7 days activity</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <p className="font-medium">Download Commission</p>
                <p className="text-sm text-gray-600">From referred user downloads</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">5%</p>
                <p className="text-xs text-gray-500">Ongoing</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="font-medium">Tip Commission</p>
                <p className="text-sm text-gray-600">From referred user tips</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">10%</p>
                <p className="text-xs text-gray-500">Ongoing</p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-blue-800">
              Focus on referring active creators! You'll earn more from their ongoing activity than one-time signups.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
