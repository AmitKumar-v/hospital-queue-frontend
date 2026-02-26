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
    email: '', password: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchDepartments()
    fetchDoctors()
  }, [])

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/departments')
      setDepartments(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchDoctors = async () => {
    try {
      const res = await API.get('/doctors')
      setDoctors(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddDepartment = async (e) => {
    e.preventDefault()
    try {
      await API.post('/admin/departments', deptForm)
      setMessage('✅ Department added successfully!')
      setDeptForm({ name: '', description: '' })
      setShowAddDept(false)
      fetchDepartments()
    } catch (err) {
      setMessage('❌ Failed to add department')
    }
  }

  const handleAddDoctor = async (e) => {
    e.preventDefault()
    try {
      await API.post('/admin/doctors', doctorForm)
      setMessage('✅ Doctor added successfully!')
      setDoctorForm({ name: '', specialization: '', departmentId: '', email: '', password: '' })
      setShowAddDoctor(false)
      fetchDoctors()
    } catch (err) {
      setMessage('❌ Failed to add doctor')
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

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Message */}
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 
                          text-blue-700 rounded-lg text-sm">
            {message}
            <button onClick={() => setMessage('')} className="ml-2 font-bold">×</button>
          </div>
        )}

        {/* Stats Cards */}
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
                <p className="text-gray-500 text-sm">System Status</p>
                <p className="text-lg font-bold text-green-600">● Online</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition
              ${activeTab === 'departments'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            🏢 Departments
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition
              ${activeTab === 'doctors'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            👨‍⚕️ Doctors
          </button>
        </div>

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 flex justify-between items-center border-b">
              <h2 className="font-semibold text-gray-800">Departments</h2>
              <button
                onClick={() => setShowAddDept(!showAddDept)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg 
                           text-sm font-medium hover:bg-blue-700 transition"
              >
                + Add Department
              </button>
            </div>

            {/* Add Department Form */}
            {showAddDept && (
              <div className="p-5 bg-blue-50 border-b border-blue-100">
                <form onSubmit={handleAddDepartment} className="flex gap-3 flex-wrap">
                  <input
                    type="text"
                    placeholder="Department name"
                    value={deptForm.name}
                    onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={deptForm.description}
                    onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDept(false)}
                    className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            )}

            {/* Departments List */}
            <div className="divide-y divide-gray-50">
              {departments.length === 0 ? (
                <p className="p-5 text-gray-400 text-sm">No departments yet</p>
              ) : (
                departments.map((dept) => (
                  <div key={dept.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{dept.name}</p>
                      <p className="text-sm text-gray-500">{dept.description}</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-5 flex justify-between items-center border-b">
              <h2 className="font-semibold text-gray-800">Doctors</h2>
              <button
                onClick={() => setShowAddDoctor(!showAddDoctor)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg 
                           text-sm font-medium hover:bg-green-700 transition"
              >
                + Add Doctor
              </button>
            </div>

            {/* Add Doctor Form */}
            {showAddDoctor && (
              <div className="p-5 bg-green-50 border-b border-green-100">
                <form onSubmit={handleAddDoctor} className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Doctor name"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Specialization"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                  <select
                    value={doctorForm.departmentId}
                    onChange={(e) => setDoctorForm({ ...doctorForm, departmentId: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                  <input
                    type="email"
                    placeholder="Login email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Login password"
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex-1"
                    >
                      Save Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddDoctor(false)}
                      className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Doctors List */}
            <div className="divide-y divide-gray-50">
              {doctors.length === 0 ? (
                <p className="p-5 text-gray-400 text-sm">No doctors yet</p>
              ) : (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-800">{doctor.name}</p>
                      <p className="text-sm text-gray-500">
                        {doctor.specialization} • {doctor.departmentName}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full">
                      {doctor.departmentName}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}