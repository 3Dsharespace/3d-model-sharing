import React from 'react'
import { BarChart3, TrendingUp, Users, Download, Eye, Calendar, FileText, AlertCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'

const AdminReports = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Reports & Analytics
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Comprehensive reporting and analytics dashboard for monitoring platform performance, user engagement, and content statistics.
            </p>
          </div>

          {/* Coming Soon Section */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200">
                Advanced Reporting Coming Soon
              </h2>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              We're currently developing comprehensive reporting features that will provide detailed insights into platform performance, user behavior, and content analytics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700 dark:text-yellow-300">
              <div>• Real-time user activity tracking</div>
              <div>• Content performance metrics</div>
              <div>• Revenue and monetization reports</div>
              <div>• User engagement analytics</div>
            </div>
          </div>

          {/* Current Available Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Statistics</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Track user registrations, active users, and user engagement metrics across the platform.
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div>• Total registered users</div>
                <div>• Daily/monthly active users</div>
                <div>• User retention rates</div>
                <div>• Geographic distribution</div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Download className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Content Analytics</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Monitor 3D model uploads, downloads, and content performance across different categories.
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div>• Total models uploaded</div>
                <div>• Download statistics</div>
                <div>• Popular categories</div>
                <div>• Content quality metrics</div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Analyze platform performance, server metrics, and user experience indicators.
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <div>• Page load times</div>
                <div>• Server response times</div>
                <div>• Error rates</div>
                <div>• User satisfaction scores</div>
              </div>
            </div>
          </div>

          {/* Report Types */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Available Report Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time-based Reports</h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Daily activity summaries</li>
                  <li>• Weekly performance reports</li>
                  <li>• Monthly growth analytics</li>
                  <li>• Quarterly trend analysis</li>
                  <li>• Annual platform overview</li>
                </ul>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Custom Reports</h3>
                </div>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• User behavior analysis</li>
                  <li>• Content performance reports</li>
                  <li>• Revenue and monetization data</li>
                  <li>• Security and compliance reports</li>
                  <li>• Export capabilities (CSV, PDF)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Implementation Timeline */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Implementation Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Phase 1: Basic Analytics</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">User counts, content statistics, and basic performance metrics</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Phase 2: Advanced Reporting</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Detailed analytics, custom reports, and data visualization</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-4"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Phase 3: Real-time Dashboard</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Live monitoring, alerts, and automated reporting</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports
