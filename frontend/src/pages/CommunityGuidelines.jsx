import React from 'react'
import PageMeta from '../components/PageMeta'
import { Shield, Users, AlertTriangle, CheckCircle, XCircle, Flag, Heart, Upload, Download } from 'lucide-react'

const CommunityGuidelines = () => {
  return (
    <>
      <PageMeta 
        title="Community Guidelines - 3DShareSpace"
        description="Learn about our community guidelines and content policies. Understand what's allowed on 3DShareSpace and how we maintain a safe, welcoming environment for all creators."
        keywords="community guidelines, content policy, rules, safe community, 3D model sharing, creator guidelines"
        url="/community-guidelines"
        type="website"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Community Guidelines
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Building a safe, welcoming, and creative community for everyone
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Our Mission */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Heart className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                3DShareSpace is a platform where creators can share their passion for 3D modeling, discover inspiring work, and build meaningful connections. We're committed to maintaining a safe, inclusive, and supportive environment where creativity can flourish.
              </p>
            </div>
          </div>

          {/* What's Allowed */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What We Encourage</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Upload className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Original Content</h3>
                </div>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                  <li>• Your own 3D models and creations</li>
                  <li>• Original textures and materials</li>
                  <li>• Tutorials and educational content</li>
                  <li>• Work-in-progress sharing for feedback</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Community Spirit</h3>
                </div>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                  <li>• Constructive feedback and critiques</li>
                  <li>• Helping other creators learn</li>
                  <li>• Respectful discussions and debates</li>
                  <li>• Collaborative projects and partnerships</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Proper Attribution</h3>
                </div>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                  <li>• Clear licensing information</li>
                  <li>• Credit to original creators when required</li>
                  <li>• Accurate descriptions and tags</li>
                  <li>• Honest representation of work</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-5 w-5 text-indigo-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Safe Content</h3>
                </div>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 text-sm">
                  <li>• Family-friendly 3D models</li>
                  <li>• Educational and artistic content</li>
                  <li>• Professional portfolio pieces</li>
                  <li>• Game-ready assets and resources</li>
                </ul>
              </div>
            </div>
          </div>

          {/* What's Not Allowed */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <XCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prohibited Content</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Content Restrictions</h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                    <li>• Adult or sexually explicit content</li>
                    <li>• Violence, gore, or disturbing imagery</li>
                    <li>• Hate speech or discriminatory content</li>
                    <li>• Copyrighted material without permission</li>
                    <li>• Malware or harmful files</li>
                    <li>• Spam or repetitive low-quality uploads</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Behavior Restrictions</h3>
                  <ul className="text-gray-700 dark:text-gray-300 space-y-2 text-sm">
                    <li>• Harassment, bullying, or threats</li>
                    <li>• Impersonation of others</li>
                    <li>• Fake accounts or misleading profiles</li>
                    <li>• Commercial spam or unauthorized advertising</li>
                    <li>• Attempting to hack or exploit the platform</li>
                    <li>• Sharing personal information of others</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Age Requirements */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Users className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Age Requirements & Child Safety</h2>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Age Requirements</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    You must be at least 13 years old to create an account on 3DShareSpace. Users under 18 require parental supervision and consent.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">COPPA Compliance</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    We comply with the Children's Online Privacy Protection Act (COPPA) and do not knowingly collect personal information from children under 13.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Reporting Underage Users</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    If you believe a user is under 13 years old, please report their profile immediately. We take child safety seriously and will investigate all reports promptly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Intellectual Property */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Shield className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Copyright & Intellectual Property</h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Original Work Only</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Only upload 3D models that you created yourself or have explicit permission to share. This includes textures, materials, and any incorporated assets.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">DMCA Compliance</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    We respond to valid DMCA takedown requests. If you believe your copyrighted work has been uploaded without permission, please contact us with details.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fair Use</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    While we support fair use for educational and transformative purposes, always err on the side of caution when using others' intellectual property.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reporting & Enforcement */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <Flag className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reporting & Enforcement</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">How to Report</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Use the "Report" button on any content or profile</p>
                  <p>• Select the appropriate violation category</p>
                  <p>• Provide detailed information about the issue</p>
                  <p>• Our moderation team reviews all reports within 24 hours</p>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Enforcement Actions</h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• <strong>Warning:</strong> First-time minor violations</p>
                  <p>• <strong>Content Removal:</strong> Violating posts deleted</p>
                  <p>• <strong>Temporary Suspension:</strong> 1-30 day account suspension</p>
                  <p>• <strong>Permanent Ban:</strong> Severe or repeated violations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Appeals */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appeals & Contact</h2>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Appeals Process</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                    If you believe your content was removed or your account was suspended in error, you can appeal the decision by contacting our support team with details about your case.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
                  <div className="text-gray-700 dark:text-gray-300 text-sm space-y-1">
                    <p>• Email: support@3dsharespace.com</p>
                    <p>• Response time: 24-48 hours</p>
                    <p>• Include your username and details about the issue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Updates */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Guideline Updates</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              These guidelines may be updated from time to time to reflect changes in our platform, legal requirements, or community feedback. 
              We'll notify users of significant changes through email or platform announcements.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

        </div>
      </div>
    </>
  )
}

export default CommunityGuidelines
