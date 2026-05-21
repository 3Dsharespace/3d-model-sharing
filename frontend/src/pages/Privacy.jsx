import React from 'react'
import PageMeta from '../components/PageMeta'
import { Shield, Eye, Lock, Database, Users, Globe, Calendar } from 'lucide-react'

const Privacy = () => {
  return (
    <>
      <PageMeta 
        title="Privacy Policy - 3DShareSpace"
        description="Read our comprehensive privacy policy to understand how 3DShareSpace collects, uses, and protects your personal information. GDPR and CCPA compliant."
        keywords="privacy policy, data protection, GDPR, CCPA, user privacy, 3D models, data security"
        url="/privacy"
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
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Introduction
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              At 3DShareSpace ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 3D model sharing platform.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              By using our service, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Information We Collect
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                  <ul className="text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• Email address and username</li>
                    <li>• Display name and profile information</li>
                    <li>• Avatar images and bio content</li>
                    <li>• Location and website information</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Database className="h-3 w-3 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Usage Information</h3>
                  <ul className="text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• 3D models and preview images you upload</li>
                    <li>• Download and view statistics</li>
                    <li>• Likes, comments, and interactions</li>
                    <li>• Platform usage patterns and preferences</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Technical Information</h3>
                  <ul className="text-gray-600 dark:text-gray-400 mt-2 space-y-1">
                    <li>• IP address and device information</li>
                    <li>• Browser type and version</li>
                    <li>• Operating system and device identifiers</li>
                    <li>• Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              How We Use Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service Provision</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Provide and maintain our platform</li>
                  <li>• Process uploads and downloads</li>
                  <li>• Enable user interactions and features</li>
                  <li>• Send important service notifications</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Improvement & Analytics</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Analyze platform usage patterns</li>
                  <li>• Improve user experience</li>
                  <li>• Develop new features</li>
                  <li>• Ensure platform security</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Information Sharing and Disclosure
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
            </p>
            <ul className="text-gray-600 dark:text-gray-400 space-y-2 ml-6">
              <li>• <strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform, including hosting, analytics, and customer support services</li>
              <li>• <strong>Advertising Partners:</strong> We use Google AdSense and other advertising partners who may collect and use information about your visits to our site and other websites to provide advertisements about goods and services of interest to you. These partners use cookies and similar technologies as described in our Advertising section</li>
              <li>• <strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
              <li>• <strong>Public Content:</strong> 3D models and profile information you choose to make public are visible to all users</li>
              <li>• <strong>Business Transfers:</strong> In the event of a merger or acquisition, user information may be transferred</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Data Security
            </h2>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 ml-6">
                  <li>• Encryption of data in transit and at rest</li>
                  <li>• Regular security assessments and updates</li>
                  <li>• Access controls and authentication measures</li>
                  <li>• Secure hosting infrastructure</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your Rights and Choices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Access & Control</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Access your personal information</li>
                  <li>• Update or correct your data</li>
                  <li>• Delete your account and data</li>
                  <li>• Export your data</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy Settings</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Control profile visibility</li>
                  <li>• Manage notification preferences</li>
                  <li>• Opt-out of analytics</li>
                  <li>• Control cookie settings</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Cookies and Tracking Technologies
            </h2>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Eye className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, provide personalized content, and serve advertisements. You can control cookie settings through your browser preferences or our cookie consent tool.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white">Essential</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Required for platform functionality</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white">Analytics</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Help improve our service</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white">Advertising</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Serve relevant ads via Google AdSense</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <div className="font-semibold text-gray-900 dark:text-white">Preferences</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Remember your settings</div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">
                  <strong>Note:</strong> Third-party advertising partners like Google may also use cookies to serve ads based on your browsing activity. See the "Advertising and Third-Party Services" section below for more information about how to opt out of personalized advertising.
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Data Retention
            </h2>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. Data retention periods vary based on the type of information:
                </p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 ml-6">
                  <li>• <strong>Account Data:</strong> Retained while your account is active</li>
                  <li>• <strong>Uploaded Models:</strong> Retained until you delete them or close your account</li>
                  <li>• <strong>Usage Analytics:</strong> Aggregated and anonymized after 2 years</li>
                  <li>• <strong>Log Data:</strong> Retained for security purposes for up to 1 year</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Advertising and Third-Party Services */}
          <section className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6 border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Advertising and Third-Party Services
            </h2>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Google AdSense</h3>
                <p className="mb-2">
                  We use Google AdSense to display advertisements on our platform. Google AdSense uses cookies and web beacons to serve ads based on your prior visits to our website or other websites on the Internet.
                </p>
                <p>
                  Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet. These cookies collect information about your browsing behavior to make advertising more relevant to you and your interests.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Third-Party Vendors</h3>
                <p className="mb-2">
                  Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website. These vendors may collect information such as:
                </p>
                <ul className="ml-6 space-y-1">
                  <li>• Pages you visit on our site</li>
                  <li>• Time spent on our site</li>
                  <li>• Links and ads you click on</li>
                  <li>• Browser type and IP address</li>
                  <li>• Referring website or app</li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Opt-Out of Personalized Advertising</h3>
                <p className="mb-3">
                  You have control over personalized advertising. You may opt out of personalized advertising by visiting the following links:
                </p>
                <ul className="space-y-2">
                  <li>
                    • <strong>Google Ads Settings:</strong>{' '}
                    <a 
                      href="https://www.google.com/settings/ads" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      www.google.com/settings/ads
                    </a>
                  </li>
                  <li>
                    • <strong>Network Advertising Initiative (NAI):</strong>{' '}
                    <a 
                      href="https://optout.networkadvertising.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      optout.networkadvertising.org
                    </a>
                  </li>
                  <li>
                    • <strong>Digital Advertising Alliance (DAA):</strong>{' '}
                    <a 
                      href="https://optout.aboutads.info/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      optout.aboutads.info
                    </a>
                  </li>
                  <li>
                    • <strong>European Interactive Digital Advertising Alliance (EDAA):</strong>{' '}
                    <a 
                      href="https://www.youronlinechoices.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      www.youronlinechoices.com
                    </a>
                  </li>
                </ul>
                <p className="mt-3 text-sm">
                  Note: Opting out of personalized ads does not mean you will see fewer ads; it means the ads you see will not be tailored to your interests.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Additional Information</h3>
                <p className="mb-2">
                  For more information about how Google uses data when you use our site, please visit:
                </p>
                <ul className="space-y-1">
                  <li>
                    • <a 
                      href="https://policies.google.com/privacy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Google Privacy Policy
                    </a>
                  </li>
                  <li>
                    • <a 
                      href="https://policies.google.com/technologies/partner-sites" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      How Google uses data when you use our partners' sites or apps
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Children's Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              International Users
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our platform is hosted in India with additional global infrastructure. Your information may be transferred to, stored, and processed in India where our primary servers are located, as well as other jurisdictions for optimal performance and service delivery.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>• <strong>Email:</strong> privacy@3dsharespace.com</p>
              <p>• <strong>Contact Form:</strong> <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Visit our Contact page</a></p>
              <p>• <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours</p>
            </div>
          </section>

        </div>
      </div>
    </div>
    </>
  )
}

export default Privacy
