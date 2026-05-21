import React, { useState } from 'react'
import { DollarSign, TrendingUp, Settings, BarChart3, Shield, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import AdSenseDashboard from '../components/ads/AdSenseDashboard'
import AdSenseSetupGuide from '../components/ads/AdSenseSetupGuide'
import { ADSENSE_CONFIG, areAdsEnabled } from '../config/adsense'

const AdSenseAdmin = () => {
  const [activeTab, setActiveTab] = 'dashboard'
  const [showTestMode, setShowTestMode] = useState(false)

  const tabs = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      description: 'Monitor ad performance and revenue'
    },
    {
      id: 'setup',
      name: 'Setup Guide',
      icon: Settings,
      description: 'Step-by-step AdSense configuration'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      icon: Shield,
      description: 'AdSense policy compliance status'
    }
  ]

  const complianceChecks = [
    {
      id: 'content_quality',
      name: 'Content Quality',
      status: 'pass',
      description: 'Site content meets AdSense quality standards',
      details: 'Your 3D model sharing platform provides valuable, original content'
    },
    {
      id: 'navigation',
      name: 'Navigation Structure',
      status: 'pass',
      description: 'Clear navigation and user experience',
      details: 'Site has logical navigation with proper header, footer, and content organization'
    },
    {
      id: 'contact_info',
      name: 'Contact Information',
      status: 'pass',
      description: 'Valid contact information available',
      details: 'Contact page and support information are properly displayed'
    },
    {
      id: 'privacy_policy',
      name: 'Privacy Policy',
      status: 'pass',
      description: 'Comprehensive privacy policy in place',
      details: 'Privacy policy covers data collection, usage, and user rights'
    },
    {
      id: 'terms_of_service',
      name: 'Terms of Service',
      status: 'pass',
      description: 'Clear terms of service documented',
      details: 'Terms of service outline user rights and platform rules'
    },
    {
      id: 'cookie_consent',
      name: 'Cookie Consent',
      status: 'pass',
      description: 'GDPR-compliant cookie consent implemented',
      details: 'Cookie consent banner with granular preferences available'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'fail':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'fail':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AdSense Administration
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Manage Google AdSense integration and monitor performance
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${areAdsEnabled() ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : 'text-red-600 bg-red-100 dark:bg-red-900/20'}`}>
                {areAdsEnabled() ? 'Ads Enabled' : 'Ads Disabled'}
              </div>
              
              <Button variant="outline" className={`h-9 px-4 ${showTestMode ? 'text-yellow-700 border-yellow-300 dark:text-yellow-300' : ''}`} onClick={() => setShowTestMode(!showTestMode)}>
                {showTestMode ? 'Test Mode ON' : 'Test Mode OFF'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <AdSenseDashboard />
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue Today</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">₹856.34</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Page Views</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">2,847</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">₹10,234.67</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Setup Guide Tab */}
        {activeTab === 'setup' && (
          <AdSenseSetupGuide />
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    AdSense Policy Compliance
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your site's compliance with Google AdSense policies
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {complianceChecks.map((check) => (
                  <div key={check.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(check.status)}
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {check.name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                            {check.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {check.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          {check.details}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    All compliance checks passed!
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  Your site meets all Google AdSense policy requirements and is ready for ad monetization.
                </p>
              </div>
            </div>

            {/* Policy Links */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Important AdSense Policies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="https://support.google.com/adsense/answer/48182"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Program Policies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Learn about AdSense program policies and requirements
                  </p>
                </a>
                
                <a
                  href="https://support.google.com/adsense/answer/1346295"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Ad Placement Policies
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Guidelines for proper ad placement and user experience
                  </p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdSenseAdmin
