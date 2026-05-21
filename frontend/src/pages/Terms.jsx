import React from 'react'
import PageMeta from '../components/PageMeta'
import { FileText, Shield, Users, Upload, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const Terms = () => {
  return (
    <>
      <PageMeta 
        title="Terms of Use - 3DShareSpace"
        description="Read our terms of use to understand the rules and guidelines for using 3DShareSpace. Learn about user rights, content policies, and platform rules."
        keywords="terms of use, user agreement, platform rules, content policies, 3D models, legal terms"
        url="/terms"
        type="website"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Use
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
              These Terms of Use ("Terms") govern your use of the 3DShareSpace platform ("Service") operated by 3DShareSpace ("we," "our," or "us"). By accessing or using our Service, you agree to be bound by these Terms.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              If you disagree with any part of these terms, then you may not access the Service.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acceptance of Terms
            </h2>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  By using our Service, you confirm that you:
                </p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 ml-6">
                  <li>• Are at least 13 years old</li>
                  <li>• Have the legal capacity to enter into these Terms</li>
                  <li>• Will comply with all applicable laws and regulations</li>
                  <li>• Accept responsibility for your actions on the platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              User Accounts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Account Creation
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Provide accurate and complete information</li>
                  <li>• Maintain the security of your account</li>
                  <li>• Notify us immediately of any unauthorized use</li>
                  <li>• You are responsible for all activities under your account</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Account Security
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li>• Use strong, unique passwords</li>
                  <li>• Enable two-factor authentication if available</li>
                  <li>• Keep your login credentials confidential</li>
                  <li>• Log out when using shared devices</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Acceptable Use Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our platform is designed for sharing 3D models in a respectful and legal manner. You agree to use the Service only for lawful purposes and in accordance with these Terms.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  What You CAN Do
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Upload original 3D models you created</li>
                  <li>• Share models under appropriate licenses</li>
                  <li>• Download models for personal/commercial use</li>
                  <li>• Provide constructive feedback and comments</li>
                  <li>• Build a portfolio and connect with creators</li>
                </ul>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-red-700 dark:text-red-300">
                  <XCircle className="h-5 w-5 mr-2" />
                  What You CANNOT Do
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Upload copyrighted material you don't own</li>
                  <li>• Share inappropriate or offensive content</li>
                  <li>• Attempt to hack or disrupt the platform</li>
                  <li>• Impersonate others or create fake accounts</li>
                  <li>• Use the platform for illegal activities</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center text-yellow-700 dark:text-yellow-300">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Prohibited Content
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                The following types of content are strictly prohibited:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                <li>• Content that infringes on intellectual property rights</li>
                <li>• Explicit, violent, or inappropriate material</li>
                <li>• Content promoting hate speech or discrimination</li>
                <li>• Malware, viruses, or harmful code</li>
                <li>• Content that violates applicable laws or regulations</li>
              </ul>
            </div>
          </section>

          {/* Content Upload Guidelines */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Content Upload Guidelines
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Requirements</h3>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                    <li>• Only upload 3D models you created or have rights to share</li>
                    <li>• Provide accurate descriptions and appropriate tags</li>
                    <li>• Include preview images that represent your model accurately</li>
                    <li>• Choose appropriate categories and licenses</li>
                    <li>• Ensure your content complies with our community guidelines</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Download Guidelines</h3>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                    <li>• Respect the license terms specified by creators</li>
                    <li>• Give proper attribution when required</li>
                    <li>• Use models responsibly and ethically</li>
                    <li>• Report any issues or violations you encounter</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Intellectual Property Rights
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Content</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  You retain ownership of the 3D models and content you upload. By uploading content, you grant us a license to:
                </p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                  <li>• Host and display your content on our platform</li>
                  <li>• Distribute your content to other users</li>
                  <li>• Use your content for platform promotion and improvement</li>
                </ul>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Platform Rights</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Our platform, including its design, functionality, and content (excluding user uploads), is protected by intellectual property laws. You may not:
                </p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                  <li>• Copy, modify, or distribute our platform code</li>
                  <li>• Reverse engineer our platform</li>
                  <li>• Use our trademarks or branding without permission</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy and Data Protection
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Usage</h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                <li>• We collect data necessary to provide our services</li>
                <li>• Your data is protected using industry-standard security measures</li>
                <li>• We do not sell your personal information to third parties</li>
                <li>• You have control over your data and can request deletion</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services and Advertising */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Third-Party Services and Advertising
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Google AdSense</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  We use Google AdSense to display advertisements on our platform. By using our Service, you acknowledge and agree that:
                </p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-2 ml-6">
                  <li>• Third-party vendors, including Google, use cookies to serve ads based on your prior visits to our website</li>
                  <li>• Google's use of advertising cookies enables it and its partners to serve ads based on your visits to our site and/or other sites on the Internet</li>
                  <li>• You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google Ads Settings</a></li>
                  <li>• Third-party ad servers or networks may also use cookies and similar technologies in their advertisements</li>
                </ul>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Third-Party Links and Services</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  Our Service may contain links to third-party websites, services, or advertisements. We are not responsible for:
                </p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                  <li>• The content or privacy practices of third-party websites</li>
                  <li>• The accuracy or reliability of third-party advertisements</li>
                  <li>• Any transactions between you and third-party advertisers</li>
                  <li>• The terms and conditions of third-party services</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-400 mt-3">
                  We recommend reviewing the privacy policies and terms of any third-party services before engaging with them.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Account Termination
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">We May Terminate If:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• You violate these Terms</li>
                  <li>• You engage in fraudulent activity</li>
                  <li>• Your account poses security risks</li>
                  <li>• Required by law or regulation</li>
                </ul>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">You May Terminate:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• At any time by closing your account</li>
                  <li>• By contacting our support team</li>
                  <li>• Your content will be removed upon request</li>
                  <li>• Some data may be retained for legal purposes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Disclaimers and Limitations
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Service Availability</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  We strive to provide a reliable service, but we cannot guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Content Accuracy</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  We do not verify the accuracy, completeness, or usefulness of user-uploaded content. Users are responsible for their own content and its use.
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Limitation of Liability</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Governing Law and Disputes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of the Service will be subject to the exclusive jurisdiction of the courts in India.
            </p>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Dispute Resolution</h4>
              <ul className="text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                <li>• We encourage resolving issues through direct communication</li>
                <li>• Disputes will be resolved through binding arbitration</li>
                <li>• Arbitration will be conducted in English</li>
                <li>• You waive your right to a jury trial or class action</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Changes to These Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes through the platform or email. Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              If you have any questions about these Terms of Use, please contact us:
            </p>
            <div className="space-y-2 text-gray-600 dark:text-gray-400">
              <p>• <strong>Email:</strong> legal@3dsharespace.com</p>
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

export default Terms
