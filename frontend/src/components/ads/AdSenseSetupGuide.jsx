import React, { useState } from 'react'
import { CheckCircle, AlertCircle, ExternalLink, Copy, Settings, DollarSign, Shield, TrendingUp } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ADSENSE_CONFIG } from '../../config/adsense'

const AdSenseSetupGuide = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [copiedField, setCopiedField] = useState('')

  const steps = [
    {
      id: 1,
      title: 'Create AdSense Account',
      description: 'Set up your Google AdSense account and get approved',
      status: 'pending',
      details: [
        'Visit Google AdSense website',
        'Sign in with your Google account',
        'Complete the application form',
        'Wait for approval (usually 1-2 weeks)',
        'Verify your website ownership'
      ]
    },
    {
      id: 2,
      title: 'Get Publisher ID',
      description: 'Copy your unique AdSense publisher ID',
      status: 'pending',
      details: [
        'Log into your AdSense account',
        'Navigate to Settings > Account',
        'Copy your Publisher ID (starts with ca-pub-)',
        'Update the configuration file'
      ]
    },
    {
      id: 3,
      title: 'Configure Auto Ads',
      description: 'Enable automatic ad placement for optimal revenue',
      status: 'pending',
      details: [
        'Auto Ads are already configured in the code',
        'Ads will be automatically placed in optimal locations',
        'No manual configuration needed',
        'Google handles ad placement intelligently'
      ]
    },
    {
      id: 4,
      title: 'Set Up Manual Ads (Optional)',
      description: 'Configure specific ad placements for better control',
      status: 'pending',
      details: [
        'Create ad units in AdSense console',
        'Get ad slot IDs for each placement',
        'Update the configuration file',
        'Enable desired ad positions'
      ]
    },
    {
      id: 5,
      title: 'Test and Monitor',
      description: 'Verify ads are working and monitor performance',
      status: 'pending',
      details: [
        'Check that ads appear on your site',
        'Monitor AdSense dashboard',
        'Review revenue and performance metrics',
        'Optimize based on data'
      ]
    }
  ]

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const getCurrentPublisherId = () => {
    return ADSENSE_CONFIG.PUBLISHER_ID
  }

  const getConfigurationCode = () => {
    return `// Update this in frontend/src/config/adsense.js
export const ADSENSE_CONFIG = {
  PUBLISHER_ID: '${getCurrentPublisherId()}',
  AUTO_ADS: {
    enabled: true,
  },
  // ... rest of configuration
}`
  }

  const getHtmlCode = () => {
    return `<!-- Update this in frontend/index.html -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${getCurrentPublisherId()}" crossorigin="anonymous"></script>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: "${getCurrentPublisherId()}"
  });
</script>`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            AdSense Setup Guide
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Follow these steps to set up Google AdSense on your site
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {step.id < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Details */}
      <div className="mb-8">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`${
              step.id === currentStep ? 'block' : 'hidden'
            }`}
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                Step {step.id}: {step.title}
              </h3>
              <p className="text-blue-800 dark:text-blue-200 mb-4">
                {step.description}
              </p>
              
              <div className="space-y-2 mb-4">
                {step.details.map((detail, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-blue-800 dark:text-blue-200">{detail}</span>
                  </div>
                ))}
              </div>

              {/* Step-specific content */}
              {step.id === 2 && (
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Current Publisher ID:
                  </h4>
                  <div className="flex items-center space-x-2">
                    <code className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded text-sm font-mono">
                      {getCurrentPublisherId()}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(getCurrentPublisherId(), 'publisher')}
                      variant="ghost"
                      className="p-2 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {copiedField === 'publisher' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  {getCurrentPublisherId() === 'ca-pub-XXXXXXXXXX' && (
                    <div className="mt-2 flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Please update this with your actual Publisher ID</span>
                    </div>
                  )}
                </div>
              )}

              {step.id === 3 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-800 dark:text-green-200">
                      Auto Ads Already Configured!
                    </span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your site is already set up with AdSense Auto Ads. Google will automatically place ads in optimal locations for maximum revenue.
                  </p>
                </div>
              )}

              {step.id === 4 && (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Configuration File Location:
                    </h4>
                    <code className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded text-sm font-mono block">
                      frontend/src/config/adsense.js
                    </code>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      HTML File Location:
                    </h4>
                    <code className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded text-sm font-mono block">
                      frontend/index.html
                    </code>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="px-4 py-2 text-sm"
                >
                  Previous
                </Button>
                
                {currentStep < steps.length ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-4 py-2 text-sm"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-sm"
                  >
                    Complete Setup
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <a
          href="https://www.google.com/adsense"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            Visit AdSense Console
          </span>
        </a>
        
        <Button
          onClick={() => setCurrentStep(2)}
          variant="outline"
          className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <Settings className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
          <span className="text-green-800 dark:text-green-200 font-medium">
            Configure Publisher ID
          </span>
        </Button>
      </div>

      {/* Configuration Code */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Configuration Code
        </h3>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              JavaScript Configuration:
            </h4>
            <div className="relative">
              <pre className="bg-gray-100 dark:bg-gray-600 p-3 rounded text-xs overflow-x-auto">
                <code>{getConfigurationCode()}</code>
              </pre>
              <Button
                onClick={() => copyToClipboard(getConfigurationCode(), 'config')}
                variant="ghost"
                className="absolute top-2 right-2 p-1 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copiedField === 'config' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HTML Script Tags:
            </h4>
            <div className="relative">
              <pre className="bg-gray-100 dark:bg-gray-600 p-3 rounded text-xs overflow-x-auto">
                <code>{getHtmlCode()}</code>
              </pre>
              <Button
                onClick={() => copyToClipboard(getHtmlCode(), 'html')}
                variant="ghost"
                className="absolute top-2 right-2 p-1 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copiedField === 'html' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdSenseSetupGuide
