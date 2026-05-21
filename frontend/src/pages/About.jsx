import React from 'react'
import { Link } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import { 
  Users, 
  Globe, 
  Heart, 
  Shield, 
  Zap, 
  Award,
  Upload,
  Download,
  Eye,
  Star
} from 'lucide-react'

const About = () => {
  return (
    <>
      <PageMeta 
        title="About 3DShareSpace - Free 3D Model Sharing Platform"
        description="Learn about 3DShareSpace, the world's premier platform for sharing, discovering, and collaborating on 3D models. Join our global community of creators."
        keywords="3D models, 3D sharing, free 3D assets, 3D community, 3D creators, 3D platform"
        url="/about"
        type="website"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              About 3DShareSpace
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The world's premier platform for sharing, discovering, and collaborating on 3D models. 
              We're building a global community where creativity knows no bounds.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            To democratize 3D design by providing a free, accessible platform where creators can share their work, 
            inspire others, and build meaningful connections within the 3D community.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We believe in fostering a supportive, inclusive community where every creator feels valued.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Free Sharing</h3>
            <p className="text-gray-600 dark:text-gray-400">
              All models are shared completely free, ensuring accessibility for creators and users worldwide.
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quality & Safety</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We maintain high standards for content quality while ensuring a safe environment for all users.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Free Model Sharing</h4>
                  <p className="text-gray-600 dark:text-gray-400">Upload and share your 3D models with the global community</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Model Discovery</h4>
                  <p className="text-gray-600 dark:text-gray-400">Explore thousands of high-quality 3D models across all categories</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Download className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Free Downloads</h4>
                  <p className="text-gray-600 dark:text-gray-400">Download models for personal and commercial use</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Creator Profiles</h4>
                  <p className="text-gray-600 dark:text-gray-400">Build your portfolio and connect with other creators</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Fast Performance</h4>
                  <p className="text-gray-600 dark:text-gray-400">Optimized platform for quick uploads and downloads</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Global Reach</h4>
                  <p className="text-gray-600 dark:text-gray-400">Connect with creators and users from around the world</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-100">Free</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100">Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">Global</div>
              <div className="text-blue-100">Community</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">Secure</div>
              <div className="text-blue-100">Platform</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Join Our Community Today
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Start sharing your 3D models, discover amazing creations, and connect with fellow creators 
            from around the world. It's completely free!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Upload className="h-5 w-5 mr-2" />
              Start Uploading
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <Eye className="h-5 w-5 mr-2" />
              Explore Models
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default About
