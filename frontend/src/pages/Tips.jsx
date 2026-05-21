import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import TipHistory from '../components/ui/TipHistory'
import CreatorEarnings from '../components/ui/CreatorEarnings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import Switch from '../components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Badge } from '../components/ui/Badge'
import { Progress } from '../components/ui/Progress'
import { useToast } from '../hooks/use-toast'
import { 
  Heart, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Users,
  Download, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  CreditCard,
  Building2 as Bank,
  Smartphone,
  BarChart3,
  Eye,
  Star
} from 'lucide-react'

const Tips = () => {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'history', 'earnings', 'withdraw', 'analytics'
  
  // Advanced earnings state
  const [earnings, setEarnings] = useState(null)
  const [withdrawalHistory, setWithdrawalHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    paymentMethod: 'upi',
    schedule: 'instant',
    upiId: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    name: '',
    email: '',
    phone: ''
  })
  const [processing, setProcessing] = useState(false)
  const [analytics, setAnalytics] = useState({
    thisMonth: 0,
    lastMonth: 0,
    totalTips: 0,
    avgTipAmount: 0,
    topModels: []
  })

  // Fetch all data on component mount
  useEffect(() => {
    if (user) {
      fetchEarningsData()
      fetchWithdrawalHistory()
      fetchAnalytics()
    }
  }, [user])

  const fetchEarningsData = async () => {
    try {
      const result = await firebaseHelpers.getCreatorEarnings(user.uid)
      setEarnings(result)
    } catch (error) {
      console.error('Error fetching earnings:', error)
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchWithdrawalHistory = async () => {
    try {
      const result = await firebaseHelpers.getWithdrawalHistory({ userId: user.uid })
      setWithdrawalHistory(result.withdrawals || [])
    } catch (error) {
      console.error('Error fetching withdrawal history:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const result = await firebaseHelpers.getCreatorAnalytics(user.uid)
      setAnalytics(result)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const handleWithdrawal = async () => {
    if (!earnings?.availableBalance || earnings.availableBalance < 100) {
      toast({
        title: "Insufficient Balance",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive"
      })
      return
    }

    if (parseFloat(withdrawalForm.amount) < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal amount is ₹100",
        variant: "destructive"
      })
      return
    }

    setProcessing(true)
    try {
      await firebaseHelpers.processWithdrawal({
        userId: user.uid,
        amount: parseFloat(withdrawalForm.amount),
        paymentMethod: withdrawalForm.paymentMethod,
        details: withdrawalForm
      })

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted and will be processed within 24-48 hours.",
      })

      // Reset form and refresh data
      setWithdrawalForm({
        amount: '',
        paymentMethod: 'upi',
        schedule: 'instant',
        upiId: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        name: '',
        email: '',
        phone: ''
      })
      
      fetchEarningsData()
      fetchWithdrawalHistory()
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      toast({
        title: "Withdrawal Failed",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to view tips
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to view your tip history and earnings
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tips & Earnings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your tip history and view your creator earnings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Tip History</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`flex-1 py-3 px-6 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'earnings'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Creator Earnings</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'history' ? (
              <TipHistory />
            ) : (
              <CreatorEarnings />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tips
