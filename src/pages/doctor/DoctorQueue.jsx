import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../../services/api'

export default function DoctorQueue() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [queue, setQueue] = useState([])
  const [currentPatient, setCurrentPatient] = useState(null)
  const [myDoctorId, setMyDoctorId] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors')
      setDoctors(res.data)

      // Try to auto-match doctor by name
      const myDoctor = res.data.find(
        d => d.name.toLowerCase().includes(user?.name?.toLowerCase()) ||
             user?.name?.toLowerCase().includes(d.name.toLowerCase())
      )
      if (myDoctor) {
        setMyDoctorId(myDoctor.id)
        fetchQueue(myDoctor.id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchQueue = async (doctorId) => {
    try {
      const res = await API.get(`/doctor/queue/${doctorId}`)
      setQueue(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDoctorSelect = (e) => {
    const id = e.target.value
    setMyDoctorId(id)
    if (id) fetchQueue(id)
    else setQueue([])
  }

  const handleCallNext = async () => {
    if (!myDoctorId) {
      setMessage('Please select your profile first')
      return
    }
    setLoading(true)
    try {
      const res = await API.put(`/doctor/queue/${myDoctorId}/next`)
      setCurrentPatient(res.data)
      fetchQueue(myDoctorId)
      setMessage('')
    } catch (err) {
      setMessage('No patients waiting in queue')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!currentPatient) return
    setLoading(true)
    try {
      await API.put(`/doctor/tokens/${currentPatient.id}/complete`)
      setCurrentPatient(null)
      fetchQueue(myDoctorId)
      setMessage('✅ Consultation completed!')
    } catch (err) {
      setMessage('❌ Failed to complete')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="font-bold text-gray-800">Hospital Queue System</h1>
              <p className="text-xs text-gray-500">Doctor Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">👨‍⚕️ {user?.name}</span>
            <button
              onClick={() => fetchQueue(myDoctorId)}
              className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg 
                         text-sm font-medium hover:bg-blue-100 transition"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg 
                         text-sm font-medium hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Doctor Profile Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Your Doctor Profile
          </label>
          <select
            value={myDoctorId || ''}
            onChange={handleDoctorSelect}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 
                       text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your profile</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name} — {doc.specialization} ({doc.departmentName})
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 
                          text-blue-700 rounded-lg text-sm">
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
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-2xl font-bold text-green-700">
                          #{currentPatient.tokenNumber}
                        </p>
                        <p className="text-lg font-semibold text-gray-800">
                          {currentPatient.patientName}
                        </p>
                      </div>
                      <span className="bg-green-200 text-green-800 text-xs 
                                       px-3 py-1 rounded-full font-medium">
                        IN PROGRESS
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📞 {currentPatient.patientPhone}</p>
                      <p>🩺 {currentPatient.problem}</p>
                      <p className={`font-medium ${currentPatient.priority === 'EMERGENCY'
                        ? 'text-red-600' : 'text-gray-600'}`}>
                        ⚡ {currentPatient.priority}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleComplete}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white 
                               font-semibold py-3 rounded-xl transition disabled:opacity-50"
                  >
                    ✅ Mark Complete
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">👨‍⚕️</p>
                  <p className="text-gray-500 mb-4">No patient currently</p>
                  <button
                    onClick={handleCallNext}
                    disabled={loading || !myDoctorId || queue.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold 
                               px-6 py-3 rounded-xl transition disabled:opacity-50"
                  >
                    {loading ? 'Calling...' : '📢 Call Next Patient'}
                  </button>
                  {!myDoctorId && (
                    <p className="text-xs text-gray-400 mt-2">
                      Select your profile above first
                    </p>
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
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs 
                                 px-2 py-0.5 rounded-full">
                  {queue.length} waiting
                </span>
              </h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-3xl mb-2">🎉</p>
                  <p className="text-gray-400">
                    {myDoctorId ? 'No patients waiting' : 'Select your profile to see queue'}
                  </p>
                </div>
              ) : (
                queue.map((token, index) => (
                  <div key={token.id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                      text-sm font-bold
                                      ${index === 0
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-600'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">
                          {token.patientName}
                        </p>
                        <p className="text-xs text-gray-500">{token.problem}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">
                        #{token.tokenNumber}
                      </p>
                      {token.priority === 'EMERGENCY' && (
                        <span className="text-xs text-red-600 font-medium">🚨 Emergency</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            {currentPatient && queue.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleCallNext}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                             font-semibold py-2.5 rounded-xl transition disabled:opacity-50 text-sm"
                >
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