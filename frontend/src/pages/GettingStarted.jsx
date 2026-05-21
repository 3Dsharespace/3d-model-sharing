import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { motion, AnimatePresence } from 'framer-motion'
import PageMeta from '../components/PageMeta'
import { 
  Upload, 
  DollarSign, 
  Award, 
  Store, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Gift,
  Zap,
  Sparkles,
  Crown,
  Target,
  Flame,
  Heart,
  Coffee,
  Rocket
} from 'lucide-react'

export default function GettingStarted() {
  const { user } = useAuth()

  const steps = [
    {
      id: 1,
      title: "Upload Your First 3D Model",
      description: "Start by uploading your 3D models to build your portfolio",
      icon: Upload,
      action: "Upload Now",
      link: "/upload",
      color: "blue"
    },
    {
      id: 2,
      title: "Check Your Creator Tier",
      description: "See your current tier and progress to unlock better benefits",
      icon: Award,
      action: "View Tier",
      link: "/creator-tier",
      color: "purple"
    },
    {
      id: 3,
      title: "Set Up Tips & Earnings",
      description: "Configure withdrawals and track your earnings in detail",
      icon: DollarSign,
      action: "Setup Earnings",
      link: "/tips",
      color: "green"
    },
    {
      id: 4,
      title: "Create Your Storefront",
      description: "Build a custom branded store for your 3D models (Pro+ tier)",
      icon: Store,
      action: "Create Store",
      link: `/store/${user?.uid}`,
      color: "orange"
    },
    {
      id: 5,
      title: "Start Referring Friends",
      description: "Earn bonuses by inviting friends to join the platform",
      icon: Users,
      action: "Get Referral Code",
      link: "/referrals",
      color: "pink"
    }
  ]

  const features = [
    {
      title: "Tier-Based Benefits",
      description: "Automatic progression from Basic to Elite with better revenue shares",
      icon: TrendingUp,
      highlights: ["85%-95% revenue share", "Lower withdrawal fees", "Higher featured chances"]
    },
    {
      title: "Multiple Revenue Streams",
      description: "Earn from downloads, tips, ad revenue, and referrals",
      icon: DollarSign,
      highlights: ["Live Razorpay payments", "Ad revenue sharing", "Referral commissions"]
    },
    {
      title: "Creator Tools",
      description: "Professional tools for serious 3D artists",
      icon: Zap,
      highlights: ["Custom storefronts", "Model collections", "Analytics dashboard"]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to 3DShareSpace! 🎉</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          The complete platform for 3D creators with advanced monetization, tier progression, and professional tools
        </p>
      </div>

      {/* Quick Stats */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Your Creator Journey</h3>
              <p className="text-sm text-gray-600">Start earning after 1000 downloads</p>
              <Link to="/creator-tier">
                <Button variant="outline" size="sm" className="mt-2">
                  Check Progress
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Referral Rewards</h3>
              <p className="text-sm text-gray-600">₹50 signup + ₹100 activation bonuses</p>
              <Link to="/referrals">
                <Button variant="outline" size="sm" className="mt-2">
                  Get Code
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold mb-1">Live Payments</h3>
              <p className="text-sm text-gray-600">Instant tips & scheduled withdrawals</p>
              <Link to="/tips">
                <Button variant="outline" size="sm" className="mt-2">
                  View Earnings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Getting Started Steps */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Get Started in 5 Easy Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600 border-blue-200',
              purple: 'bg-purple-100 text-purple-600 border-purple-200',
              green: 'bg-green-100 text-green-600 border-green-200',
              orange: 'bg-orange-100 text-orange-600 border-orange-200',
              pink: 'bg-pink-100 text-pink-600 border-pink-200'
            }
            
            return (
              <Card key={step.id} className="relative hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[step.color]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        Step {step.id}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {step.description}
                  </CardDescription>
                  <Link to={step.link}>
                    <Button className="w-full">
                      {step.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Platform Features */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Why Creators Choose 3DShareSpace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center">
                <CardHeader>
                  <Icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center justify-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Creator Tiers Overview */}
      <Card className="mb-12">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Creator Tier Benefits</CardTitle>
          <CardDescription>Automatic progression based on your performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { tier: 'Basic', share: '85%', fee: '2%', uploads: '10', featured: '0%' },
              { tier: 'Verified', share: '87%', fee: '1.5%', uploads: '25', featured: '10%' },
              { tier: 'Pro', share: '90%', fee: '1%', uploads: '50', featured: '25%' },
              { tier: 'Elite', share: '95%', fee: '0.5%', uploads: '100', featured: '50%' }
            ].map((tier, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">{tier.tier}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Revenue: {tier.share}</p>
                  <p>Fee: {tier.fee}</p>
                  <p>Uploads: {tier.uploads}/mo</p>
                  <p>Featured: {tier.featured}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/creator-tier">
              <Button>
                View Your Tier Progress
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Join thousands of creators already earning on 3DShareSpace
        </p>
        <div className="flex justify-center space-x-4">
          {user ? (
            <>
              <Link to="/upload">
                <Button size="lg">
                  Upload Your First Model
                  <Upload className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/creator-tier">
                <Button variant="outline" size="lg">
                  Check Your Progress
                  <TrendingUp className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg">
                  Sign Up Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="outline" size="lg">
                  Explore Models
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
