import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import API from '../../services/api'

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showAddDept, setShowAddDept] = useState(false)
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [activeTab, setActiveTab] = useState('departments')
  const [deptForm, setDeptForm] = useState({ name: '', description: '' })
  const [doctorForm, setDoctorForm] = useState({
    name: '', specialization: '', departmentId: '',
    email: '', password: '', availableFrom: '09:00', availableTo: '17:00'
  })
  const [message, setMessage] = useState('')
  const [editTiming, setEditTiming] = useState(null)

  useEffect(() => { fetchDepartments(); fetchDoctors() }, [])

  const fetchDepartments = async () => {
    try { const res = await API.get('/departments'); setDepartments(res.data) }
    catch (err) { console.error(err) }
  }

  const fetchDoctors = async () => {
    try { const res = await API.get('/doctors'); setDoctors(res.data) }
    catch (err) { console.error(err) }
  }

  const handleAddDepartment = async (e) => {
    e.preventDefault()
    try {
      await API.post('/admin/departments', deptForm)
      setMessage('✅ Department added!')
      setDeptForm({ name: '', description: '' })
      setShowAddDept(false)
      fetchDepartments()
    } catch { setMessage('❌ Failed to add department') }
  }

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm('Delete this department?')) return
    try {
      await API.delete(`/admin/departments/${id}`)
      setMessage('✅ Department deleted!')
      fetchDepartments()
    } catch { setMessage('❌ Failed to delete') }
  }

  const handleAddDoctor = async (e) => {
    e.preventDefault()
    try {
      await API.post('/admin/doctors', doctorForm)
      setMessage('✅ Doctor added!')
      setDoctorForm({
        name: '', specialization: '', departmentId: '',
        email: '', password: '', availableFrom: '09:00', availableTo: '17:00'
      })
      setShowAddDoctor(false)
      fetchDoctors()
    } catch { setMessage('❌ Failed to add doctor') }
  }

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor?')) return
    try {
      await API.delete(`/admin/doctors/${id}`)
      setMessage('✅ Doctor deleted!')
      fetchDoctors()
    } catch { setMessage('❌ Failed to delete') }
  }

  const handleToggleAvailability = async (id) => {
    try {
      await API.put(`/admin/doctors/${id}/toggle`)
      fetchDoctors()
    } catch { setMessage('❌ Failed to toggle') }
  }

  const handleUpdateTiming = async (doctorId) => {
    try {
      await API.put(`/admin/doctors/${doctorId}/timing`, null, {
        params: { from: editTiming.from, to: editTiming.to }
      })
      setMessage('✅ Timing updated!')
      setEditTiming(null)
      fetchDoctors()
    } catch { setMessage('❌ Failed to update timing') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏥</span>
            <div>
              <h1 className="font-bold text-gray-800">Hospital Queue System</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
            {message}
            <button onClick={() => setMessage('')} className="ml-2 font-bold">×</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Departments</p>
                <p className="text-3xl font-bold text-blue-600">{departments.length}</p>
              </div>
              <span className="text-4xl">🏢</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Doctors</p>
                <p className="text-3xl font-bold text-green-600">{doctors.length}</p>
              </div>
              <span className="text-4xl">👨‍⚕️</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Available Doctors</p>
                <p className="text-3xl font-bold text-green-600">
                  {doctors.filter(d => d.available).length}
                </p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['departments', 'doctors'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition
                ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              {tab === 'departments' ? '🏢 Departments' : '👨‍⚕️ Doctors'}
            </button>
          ))}
        </div>

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 flex justify-between items-center border-b">
              <h2 className="font-semibold text-gray-800">Departments</h2>
              <button onClick={() => setShowAddDept(!showAddDept)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                + Add Department
              </button>
            </div>
            {showAddDept && (
              <div className="p-5 bg-blue-50 border-b border-blue-100">
                <form onSubmit={handleAddDepartment} className="flex gap-3 flex-wrap">
                  <input type="text" placeholder="Department name" value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1" required />
                  <input type="text" placeholder="Description" value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1" />
                  <button type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">Save</button>
                  <button type="button" onClick={() => setShowAddDept(false)}
                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">Cancel</button>
                </form>
              </div>
            )}
            <div className="divide-y divide-gray-50">
              {departments.length === 0 ? (
                <p className="p-5 text-gray-400 text-sm">No departments yet</p>
              ) : departments.map((dept) => (
                <div key={dept.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-800">{dept.name}</p>
                    <p className="text-sm text-gray-500">{dept.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">Active</span>
                    <button onClick={() => handleDeleteDepartment(dept.id)}
                      className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-lg hover:bg-red-100 transition">
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 flex justify-between items-center border-b">
              <h2 className="font-semibold text-gray-800">Doctors</h2>
              <button onClick={() => setShowAddDoctor(!showAddDoctor)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                + Add Doctor
              </button>
            </div>
            {showAddDoctor && (
              <div className="p-5 bg-green-50 border-b border-green-100">
                <form onSubmit={handleAddDoctor} className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Doctor name" value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                  <input type="text" placeholder="Specialization" value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                  <select value={doctorForm.departmentId}
                    onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required>
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <input type="email" placeholder="Login email" value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                  <input type="text" placeholder="Password (min 8 chars)"
                    value={doctorForm.password} autoComplete="new-password"
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm" required />
                  <div className="flex gap-2 items-center">
                    <label className="text-sm text-gray-600 whitespace-nowrap">From:</label>
                    <input type="time" value={doctorForm.availableFrom}
                      onChange={(e) => setDoctorForm({ ...doctorForm, availableFrom: e.target.value })}
                      className="border border-gray-300 rounded-lg px-2 py-2 text-sm flex-1" />
                    <label className="text-sm text-gray-600 whitespace-nowrap">To:</label>
                    <input type="time" value={doctorForm.availableTo}
                      onChange={(e) => setDoctorForm({ ...doctorForm, availableTo: e.target.value })}
                      className="border border-gray-300 rounded-lg px-2 py-2 text-sm flex-1" />
                  </div>
                  <div className="flex gap-2 col-span-2">
                    <button type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex-1">
                      Save Doctor
                    </button>
                    <button type="button" onClick={() => setShowAddDoctor(false)}
                      className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="divide-y divide-gray-50">
              {doctors.length === 0 ? (
                <p className="p-5 text-gray-400 text-sm">No doctors yet</p>
              ) : doctors.map((doctor) => (
                <div key={doctor.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{doctor.name}</p>
                      <p className="text-sm text-gray-500">
                        {doctor.specialization} • {doctor.departmentName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        🕐 {doctor.availableFrom || '09:00'} – {doctor.availableTo || '17:00'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button onClick={() => handleToggleAvailability(doctor.id)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition
                          ${doctor.available
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {doctor.available ? '● Available' : '○ Unavailable'}
                      </button>
                      <button onClick={() => setEditTiming({
                        id: doctor.id,
                        from: doctor.availableFrom || '09:00',
                        to: doctor.availableTo || '17:00'
                      })}
                        className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-lg hover:bg-blue-100 transition">
                        🕐 Timing
                      </button>
                      <button onClick={() => handleDeleteDoctor(doctor.id)}
                        className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-lg hover:bg-red-100 transition">
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                  {editTiming?.id === doctor.id && (
                    <div className="mt-3 flex gap-2 items-center bg-blue-50 p-3 rounded-lg flex-wrap">
                      <label className="text-sm text-gray-600">From:</label>
                      <input type="time" value={editTiming.from}
                        onChange={(e) => setEditTiming({ ...editTiming, from: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm" />
                      <label className="text-sm text-gray-600">To:</label>
                      <input type="time" value={editTiming.to}
                        onChange={(e) => setEditTiming({ ...editTiming, to: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm" />
                      <button onClick={() => handleUpdateTiming(doctor.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Save</button>
                      <button onClick={() => setEditTiming(null)}
                        className="bg-gray-200 text-gray-600 px-3 py-1 rounded text-sm">Cancel</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}