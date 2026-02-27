import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../../services/api'

export default function ReceptionistPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [generatedToken, setGeneratedToken] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [form, setForm] = useState({
    patientName: '', patientPhone: '', patientAge: '',
    patientGender: 'MALE', problem: '',
    departmentId: '', doctorId: '', priority: 'NORMAL'
  })

  useEffect(() => { fetchDepartments() }, [])

  const fetchDepartments = async () => {
    try { const res = await API.get('/departments'); setDepartments(res.data) }
    catch (err) { console.error(err) }
  }

  const fetchDoctorsByDepartment = async (departmentId) => {
    try { const res = await API.get(`/doctors/department/${departmentId}`); setDoctors(res.data) }
    catch (err) { console.error(err) }
  }

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value
    setForm({ ...form, departmentId: deptId, doctorId: '' })
    if (deptId) fetchDoctorsByDepartment(deptId)
    else setDoctors([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await API.post('/receptionist/tokens/generate', form)
      setGeneratedToken(res.data)
      setForm({
        patientName: '', patientPhone: '', patientAge: '',
        patientGender: 'MALE', problem: '',
        departmentId: '', doctorId: '', priority: 'NORMAL'
      })
      setDoctors([])
    } catch { setMessage('❌ Failed to generate token. Please try again.') }
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
              <p className="text-xs text-gray-500">Receptionist Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">👤 {user?.name}</span>
            <button onClick={() => { logout(); navigate('/login') }}
              className="bg-red-50 text-red-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {generatedToken ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Token Generated!</h2>
            <p className="text-gray-500 mb-6">Patient has been added to the queue</p>
            <div className={`text-white rounded-2xl p-6 mb-6 max-w-xs mx-auto
              ${generatedToken.priority === 'EMERGENCY' ? 'bg-red-600' : 'bg-blue-600'}`}>
              <p className="text-sm opacity-80 mb-1">Token Number</p>
              <p className="text-6xl font-bold">{generatedToken.tokenNumber}</p>
              {generatedToken.priority === 'EMERGENCY' && (
                <p className="text-sm mt-2 font-semibold">🚨 EMERGENCY</p>
              )}
            </div>
            <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-gray-400">Patient Name</p>
                  <p className="font-semibold text-gray-800">{generatedToken.patientName}</p></div>
                <div><p className="text-gray-400">Doctor</p>
                  <p className="font-semibold text-gray-800">{generatedToken.doctorName}</p></div>
                <div><p className="text-gray-400">Department</p>
                  <p className="font-semibold text-gray-800">{generatedToken.departmentName}</p></div>
                <div><p className="text-gray-400">Priority</p>
                  <p className={`font-semibold ${generatedToken.priority === 'EMERGENCY' ? 'text-red-600' : 'text-green-600'}`}>
                    {generatedToken.priority}</p></div>
                <div><p className="text-gray-400">Status</p>
                  <p className="font-semibold text-orange-500">{generatedToken.status}</p></div>
                <div><p className="text-gray-400">Est. Wait</p>
                  <p className="font-semibold text-gray-800">{generatedToken.estimatedWaitMinutes} mins</p></div>
              </div>
            </div>
            <button onClick={() => setGeneratedToken(null)}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              + Register Next Patient
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Patient Registration</h2>
              <p className="text-gray-500 text-sm mt-1">Fill in patient details to generate queue token</p>
            </div>
            {message && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
                  <input type="text" value={form.patientName}
                    onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input type="text" value={form.patientPhone}
                    onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                  <input type="number" value={form.patientAge}
                    onChange={(e) => setForm({ ...form, patientAge: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter age" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select value={form.patientGender}
                    onChange={(e) => setForm({ ...form, patientGender: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                  <select value={form.departmentId} onChange={handleDepartmentChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                  <select value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required disabled={!form.departmentId}>
                    <option value="">{form.departmentId ? 'Select Doctor' : 'Select department first'}</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} {!doc.available ? '(Unavailable)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Buttons */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
                  <div className="flex gap-3">
                    <button type="button"
                      onClick={() => setForm({ ...form, priority: 'NORMAL' })}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition
                        ${form.priority === 'NORMAL'
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      🟢 Normal
                    </button>
                    <button type="button"
                      onClick={() => setForm({ ...form, priority: 'EMERGENCY' })}
                      className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition
                        ${form.priority === 'EMERGENCY'
                          ? 'border-red-600 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                      🚨 Emergency
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Problem Description *</label>
                  <textarea value={form.problem}
                    onChange={(e) => setForm({ ...form, problem: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of patient's problem" rows={3} required />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50">
                {loading ? 'Generating Token...' : '🎫 Generate Token'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}