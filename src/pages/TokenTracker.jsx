import { useState } from 'react'
import API from '../services/api'

export default function TokenTracker() {
  const [tokenNumber, setTokenNumber] = useState('')
  const [tokenData, setTokenData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTokenData(null)
    try {
      const res = await API.get(`/tokens/track/${tokenNumber}`)
      setTokenData(res.data)
    } catch (err) {
      setError('Token not found. Please check your token number.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'WAITING') return 'bg-yellow-100 text-yellow-700'
    if (status === 'IN_PROGRESS') return 'bg-green-100 text-green-700'
    if (status === 'COMPLETED') return 'bg-gray-100 text-gray-600'
    return 'bg-blue-100 text-blue-700'
  }

  const getStatusIcon = (status) => {
    if (status === 'WAITING') return '⏳'
    if (status === 'IN_PROGRESS') return '✅'
    if (status === 'COMPLETED') return '🎉'
    return '📋'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto pt-10">

        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-5xl">🏥</span>
          <h1 className="text-2xl font-bold text-gray-800 mt-3">Token Tracker</h1>
          <p className="text-gray-500 mt-1">Track your queue position</p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <form onSubmit={handleTrack}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Your Token Number
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={tokenNumber}
                onChange={(e) => setTokenNumber(e.target.value)}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 
                           text-lg font-bold text-center focus:outline-none 
                           focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 5"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 
                           rounded-xl font-semibold transition disabled:opacity-50"
              >
                {loading ? '...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 
                            text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Token Result */}
        {tokenData && (
          <div className="bg-white rounded-2xl shadow-sm p-6">

            {/* Token Number Big */}
            <div className="text-center mb-5">
              <p className="text-gray-500 text-sm">Your Token</p>
              <p className="text-6xl font-bold text-blue-600">
                {tokenData.tokenNumber}
              </p>
              <span className={`inline-block mt-2 px-4 py-1 rounded-full text-sm font-medium
                              ${getStatusColor(tokenData.status)}`}>
                {getStatusIcon(tokenData.status)} {tokenData.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Patient Name</span>
                <span className="font-semibold text-gray-800">{tokenData.patientName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Doctor</span>
                <span className="font-semibold text-gray-800">{tokenData.doctorName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Department</span>
                <span className="font-semibold text-gray-800">{tokenData.departmentName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Priority</span>
                <span className={`font-semibold ${tokenData.priority === 'EMERGENCY' 
                  ? 'text-red-600' : 'text-green-600'}`}>
                  {tokenData.priority}
                </span>
              </div>
              {tokenData.status === 'WAITING' && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Est. Wait Time</span>
                  <span className="font-semibold text-orange-500">
                    ~{tokenData.estimatedWaitMinutes} mins
                  </span>
                </div>
              )}
            </div>

            {tokenData.status === 'WAITING' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 
                              rounded-xl text-center text-sm text-yellow-700">
                ⏳ Please wait. You will be called soon.
              </div>
            )}
            {tokenData.status === 'IN_PROGRESS' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 
                              rounded-xl text-center text-sm text-green-700">
                ✅ It's your turn! Please proceed to the doctor.
              </div>
            )}
            {tokenData.status === 'COMPLETED' && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 
                              rounded-xl text-center text-sm text-gray-600">
                🎉 Your consultation is complete. Thank you!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}