import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
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
  DollarSign, 
  Download, 
  TrendingUp, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  CreditCard,
  Building2 as Bank,
  Smartphone,
  Calendar,
  BarChart3,
  Eye,
  Users,
  Star
} from 'lucide-react'

export default function AdvancedEarnings() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State management
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

  // Fetch earnings data
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

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const { amount, paymentMethod, schedule, ...accountDetails } = withdrawalForm
      
      if (!amount || amount < 100) {
        throw new Error('Minimum withdrawal amount is ₹100')
      }

      if (paymentMethod === 'upi' && !accountDetails.upiId) {
        throw new Error('UPI ID is required')
      }

      if (paymentMethod === 'bank_account' && (!accountDetails.accountNumber || !accountDetails.ifscCode)) {
        throw new Error('Bank account details are required')
      }

      const result = await firebaseHelpers.createWithdrawalRequest({
        userId: user.uid,
        amount: parseFloat(amount),
        paymentMethod,
        schedule,
        accountDetails: {
          ...accountDetails,
          name: user.displayName || accountDetails.name,
          email: user.email || accountDetails.email
        }
      })

      toast({
        title: "Withdrawal Request Created",
        description: `Your withdrawal of ₹${amount} has been submitted. Net amount: ₹${result.netAmount}`,
      })

      // Reset form and refresh data
      setWithdrawalForm({ ...withdrawalForm, amount: '' })
      fetchEarningsData()
      fetchWithdrawalHistory()

    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'rejected': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || colors.pending
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'failed': 
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'processing': return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">No Earnings Data</h2>
            <p className="text-gray-600">Start uploading 3D models to begin earning!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const availableBalance = (earnings.totalEarnings || 0) - (earnings.totalWithdrawn || 0) - (earnings.pendingWithdrawals || 0)
  const isEligible = earnings.isEligible && earnings.totalDownloads >= 1000
  const progressToEligibility = Math.min((earnings.totalDownloads / 1000) * 100, 100)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Creator Earnings Dashboard</h1>
        <p className="text-gray-600">Manage your earnings, withdrawals, and analytics</p>
      </div>

      {/* Eligibility Status */}
      {!isEligible && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Download className="w-8 h-8 text-orange-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800">Complete 1000 Downloads to Start Earning</h3>
                <p className="text-orange-600 text-sm">Current downloads: {earnings.totalDownloads}</p>
                <Progress value={progressToEligibility} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">₹{availableBalance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">₹{(earnings.totalEarnings || 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Withdrawn</p>
                <p className="text-2xl font-bold">₹{(earnings.totalWithdrawn || 0).toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold">{earnings.totalDownloads || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdraw" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="withdraw">Withdraw Funds</TabsTrigger>
          <TabsTrigger value="history">Withdrawal History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Withdrawal Tab */}
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Earnings</CardTitle>
              <CardDescription>
                Request a withdrawal of your available earnings. Processing fee: 2%
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEligible ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Withdrawals Not Available</h3>
                  <p className="text-gray-600">Complete 1000 downloads to unlock withdrawals</p>
                </div>
              ) : availableBalance < 100 ? (
                <div className="text-center py-8">
                  <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Insufficient Balance</h3>
                  <p className="text-gray-600">Minimum withdrawal amount is ₹100</p>
                </div>
              ) : (
                <form onSubmit={handleWithdrawalSubmit} className="space-y-6">
                  {/* Amount */}
                  <div>
                    <Label htmlFor="amount">Withdrawal Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="100"
                      max={availableBalance}
                      value={withdrawalForm.amount}
                      onChange={(e) => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })}
                      placeholder="Enter amount"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Available: ₹{availableBalance.toFixed(2)} | Min: ₹100 | Max: ₹2,00,000
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={withdrawalForm.paymentMethod} onValueChange={(value) => 
                      setWithdrawalForm({ ...withdrawalForm, paymentMethod: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upi">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="w-4 h-4" />
                            <span>UPI (Instant)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="bank_account">
                          <div className="flex items-center space-x-2">
                            <Bank className="w-4 h-4" />
                            <span>Bank Account (NEFT)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* UPI Details */}
                  {withdrawalForm.paymentMethod === 'upi' && (
                    <div>
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        value={withdrawalForm.upiId}
                        onChange={(e) => setWithdrawalForm({ ...withdrawalForm, upiId: e.target.value })}
                        placeholder="yourname@upi"
                        required
                      />
                    </div>
                  )}

                  {/* Bank Account Details */}
                  {withdrawalForm.paymentMethod === 'bank_account' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="accountHolderName">Account Holder Name</Label>
                        <Input
                          id="accountHolderName"
                          value={withdrawalForm.accountHolderName}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountHolderName: e.target.value })}
                          placeholder="Full name as per bank"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={withdrawalForm.accountNumber}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, accountNumber: e.target.value })}
                          placeholder="Bank account number"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          value={withdrawalForm.ifscCode}
                          onChange={(e) => setWithdrawalForm({ ...withdrawalForm, ifscCode: e.target.value })}
                          placeholder="IFSC code"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Processing Schedule */}
                  <div>
                    <Label htmlFor="schedule">Processing Schedule</Label>
                    <Select value={withdrawalForm.schedule} onValueChange={(value) => 
                      setWithdrawalForm({ ...withdrawalForm, schedule: value })
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instant">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Instant (2-4 hours)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="weekly">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Weekly (Next Monday)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="monthly">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>Monthly (1st of next month)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Processing Fee Info */}
                  {withdrawalForm.amount && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span>Withdrawal Amount:</span>
                        <span>₹{parseFloat(withdrawalForm.amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Processing Fee (2%):</span>
                        <span>₹{(parseFloat(withdrawalForm.amount || 0) * 0.02).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                        <span>Net Amount:</span>
                        <span>₹{(parseFloat(withdrawalForm.amount || 0) * 0.98).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={processing} className="w-full">
                    {processing ? 'Processing...' : 'Submit Withdrawal Request'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>Track all your withdrawal requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawalHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Withdrawals Yet</h3>
                  <p className="text-gray-600">Your withdrawal history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {withdrawalHistory.map((withdrawal) => (
                    <div key={withdrawal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">₹{withdrawal.amount}</h4>
                          <p className="text-sm text-gray-600">
                            Net: ₹{withdrawal.netAmount} (Fee: ₹{withdrawal.processingFee})
                          </p>
                        </div>
                        <Badge className={getStatusColor(withdrawal.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(withdrawal.status)}
                            <span className="capitalize">{withdrawal.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Method:</span>
                          <span className="ml-2 capitalize">{withdrawal.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Schedule:</span>
                          <span className="ml-2 capitalize">{withdrawal.schedule}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Requested:</span>
                          <span className="ml-2">{new Date(withdrawal.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Est. Time:</span>
                          <span className="ml-2">{withdrawal.estimatedProcessingTime}</span>
                        </div>
                      </div>
                      
                      {withdrawal.failureReason && (
                        <div className="mt-2 p-2 bg-red-50 text-red-800 text-sm rounded">
                          <strong>Reason:</strong> {withdrawal.failureReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Monthly Earnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">₹{analytics.thisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Month</span>
                    <span className="font-semibold">₹{analytics.lastMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Growth</span>
                    <span className={`font-semibold ${analytics.thisMonth >= analytics.lastMonth ? 'text-green-600' : 'text-red-600'}`}>
                      {analytics.lastMonth > 0 ? 
                        `${(((analytics.thisMonth - analytics.lastMonth) / analytics.lastMonth) * 100).toFixed(1)}%` : 
                        'N/A'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5" />
                  <span>Tip Statistics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Tips</span>
                    <span className="font-semibold">{analytics.totalTips}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Tip</span>
                    <span className="font-semibold">₹{analytics.avgTipAmount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tip Revenue</span>
                    <span className="font-semibold">₹{(analytics.totalTips * analytics.avgTipAmount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
