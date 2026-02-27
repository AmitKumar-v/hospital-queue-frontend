import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../../services/api'

export default function DoctorQueue() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [queue, setQueue] = useState([])
  const [currentPatient, setCurrentPatient] = useState(null)
  const [myDoctorId, setMyDoctorId] = useState(null)
  const [myDoctorName, setMyDoctorName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { findMyDoctorProfile() }, [])

  const findMyDoctorProfile = async () => {
    try {
      const res = await API.get('/doctors')
      const email = localStorage.getItem('email')
      const myDoctor = res.data.find(d => d.email === email)
      if (myDoctor) {
        setMyDoctorId(myDoctor.id)
        setMyDoctorName(myDoctor.name)
        fetchQueue(myDoctor.id)
      }
    } catch (err) { console.error(err) }
  }

  const fetchQueue = useCallback(async (doctorId) => {
    try {
      const id = doctorId || myDoctorId
      if (!id) return
      const res = await API.get(`/doctor/queue/${id}`)
      setQueue(res.data)
    } catch (err) { console.error(err) }
  }, [myDoctorId])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchQueue(myDoctorId)
    setTimeout(() => setRefreshing(false), 600)
  }

  const handleCallNext = async () => {
    setLoading(true)
    try {
      const res = await API.put(`/doctor/queue/${myDoctorId}/next`)
      setCurrentPatient(res.data)
      fetchQueue(myDoctorId)
      setMessage('')
    } catch { setMessage('⚠️ No patients waiting in queue') }
    finally { setLoading(false) }
  }

  const handleComplete = async () => {
    if (!currentPatient) return
    setLoading(true)
    try {
      await API.put(`/doctor/tokens/${currentPatient.id}/complete`)
      setCurrentPatient(null)
      fetchQueue(myDoctorId)
      setMessage('✅ Consultation completed!')
    } catch { setMessage('❌ Failed to complete') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="font-bold text-gray-800">Hospital Queue System</h1>
              <p className="text-xs text-gray-500">
                Doctor Panel {myDoctorName && `— ${myDoctorName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">👨‍⚕️ {user?.name}</span>
            <button onClick={handleRefresh}
              className={`bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition ${refreshing ? 'opacity-60' : ''}`}>
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button onClick={() => { logout(); navigate('/login') }}
              className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {!myDoctorId && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
            ⚠️ Your doctor profile was not found. Make sure you are logged in with the correct doctor email.
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
            {message}
            <button onClick={() => setMessage('')} className="ml-2 font-bold">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Patient */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Current Patient</h2>
            </div>
            <div className="p-5">
              {currentPatient ? (
                <div>
                  <div className={`border rounded-xl p-5 mb-4
                    ${currentPatient.priority === 'EMERGENCY'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className={`text-2xl font-bold ${currentPatient.priority === 'EMERGENCY' ? 'text-red-700' : 'text-green-700'}`}>
                          #{currentPatient.tokenNumber}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">{currentPatient.patientName}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium
                        ${currentPatient.priority === 'EMERGENCY'
                          ? 'bg-red-200 text-red-800'
                          : 'bg-green-200 text-green-800'}`}>
                        {currentPatient.priority === 'EMERGENCY' ? '🚨 EMERGENCY' : 'IN PROGRESS'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📞 {currentPatient.patientPhone}</p>
                      <p>🩺 {currentPatient.problem}</p>
                    </div>
                  </div>
                  <button onClick={handleComplete} disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
                    ✅ Mark Complete
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">👨‍⚕️</p>
                  <p className="text-gray-500 mb-4">No patient currently</p>
                  <button onClick={handleCallNext}
                    disabled={loading || !myDoctorId || queue.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50">
                    {loading ? 'Calling...' : '📢 Call Next Patient'}
                  </button>
                  {queue.length === 0 && myDoctorId && (
                    <p className="text-xs text-gray-400 mt-2">No patients waiting</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Waiting Queue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">
                Waiting Queue
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                  {queue.length} waiting
                </span>
              </h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-gray-400">No patients waiting</p>
                </div>
              ) : queue.map((token, index) => (
                <div key={token.id}
                  className={`p-4 flex justify-between items-center
                    ${token.priority === 'EMERGENCY' ? 'bg-red-50' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${token.priority === 'EMERGENCY'
                        ? 'bg-red-600 text-white'
                        : index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{token.patientName}</p>
                      <p className="text-xs text-gray-500">{token.problem}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-700">#{token.tokenNumber}</p>
                    {token.priority === 'EMERGENCY' && (
                      <span className="text-xs text-red-600 font-medium">🚨 Emergency</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {currentPatient && queue.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <button onClick={handleCallNext} disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-50 text-sm">
                  📢 Call Next Patient
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
