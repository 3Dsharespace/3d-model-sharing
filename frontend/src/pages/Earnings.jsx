import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'

const Earnings = () => {
  const { user, profile, loading } = useAuth()
  const [stats, setStats] = useState({ downloads: 0, verified: false, paymentLink: '' })
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('upi')
  const [accountDetails, setAccountDetails] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      const res = await firebaseHelpers.getDownloadsAndVerification(user.uid)
      if (res.success) {
        setStats({
          downloads: res.downloads || 0,
          verified: res.verified || false,
          paymentLink: res.paymentLink || ''
        })
      }
      setBalance(profile?.availableBalance ?? 0)
    }
    load()
  }, [user, profile])

  const submitWithdraw = async (e) => {
    e.preventDefault()
    if (!user) return
    const amt = Number(amount)
    if (!amt || amt <= 0) {
      setStatus('Enter a valid amount')
      return
    }
    try {
      setBusy(true)
      setStatus('Submitting withdraw request...')
      const res = await firebaseHelpers.createWithdrawRequest({
        userId: user.uid,
        amount: amt,
        method,
        accountDetails
      })
      if (res.success) {
        setStatus('Withdrawal requested. Processing 2-5 business days.')
        setAmount('')
        setAccountDetails('')
      } else {
        setStatus(res.error || 'Failed to submit request')
      }
    } catch (err) {
      setStatus(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return null
  if (!user) return <div className="p-6">Please log in.</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Earnings</h1>
      <div className="rounded-lg border p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span>Total downloads</span>
          <span>{stats.downloads}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span>Verified for earnings</span>
          <span>{stats.verified ? 'Yes' : 'No (need 1000 downloads)'}</span>
        </div>
        <div className="flex justify-between">
          <span>Available balance</span>
          <span>₹{Number(balance).toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={submitWithdraw} className="rounded-lg border p-4">
        <h2 className="text-lg font-medium mb-3">Withdraw</h2>
        <div className="mb-3">
          <label className="block text-sm mb-1">Amount (INR)</label>
          <input className="w-full border rounded px-3 py-2" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1">Method</label>
          <select className="w-full border rounded px-3 py-2" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Account details</label>
          <input className="w-full border rounded px-3 py-2" value={accountDetails} onChange={e => setAccountDetails(e.target.value)} placeholder="your@upi" />
        </div>
        <button disabled={busy} className="h-10 px-4 rounded bg-blue-600 text-white">{busy ? 'Submitting...' : 'Request Withdraw'}</button>
        {status && <div className="mt-3 text-sm">{status}</div>}
      </form>
    </div>
  )
}

export default Earnings


