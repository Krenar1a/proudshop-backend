'use client'

import { useState, useEffect } from 'react'
import { UserCheck, Plus, Search, Edit, Trash2, Shield, Mail, Calendar, Eye, EyeOff, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

interface Admin {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR'
  status: 'active' | 'inactive'
  lastLogin?: string
  createdAt: string
  permissions: string[]
}

interface AdminFormData {
  name: string
  email: string
  password: string
  role: string
  permissions: string[]
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    password: '',
    role: 'MODERATOR',
    permissions: []
  })

  const allPermissions = [
    { key: 'MANAGE_PRODUCTS', label: 'Menaxho Produktet' },
    { key: 'VIEW_ORDERS', label: 'Shiko Porositë' },
    { key: 'MANAGE_ORDERS', label: 'Menaxho Porositë' },
    { key: 'MANAGE_CUSTOMERS', label: 'Menaxho Klientët' },
    { key: 'VIEW_ANALYTICS', label: 'Shiko Analizat' },
    { key: 'MANAGE_MARKETING', label: 'Menaxho Marketing' },
    { key: 'MANAGE_CHAT', label: 'Menaxho Chat' },
    { key: 'MANAGE_SETTINGS', label: 'Menaxho Cilësimet' },
    { key: 'MANAGE_ADMINS', label: 'Menaxho Adminat' }
  ]

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/admins')
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      } else {
        toast.error('Gabim në ngarkim të adminave')
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error('Gabim në ngarkim të adminave')
    } finally {
      setLoading(false)
    }
  }

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || admin.role === filterRole
    const matchesStatus = filterStatus === 'all' || admin.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'MODERATOR': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin'
      case 'ADMIN': return 'Admin'
      case 'MODERATOR': return 'Moderator'
      default: return role
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '',
      role: admin.role,
      permissions: admin.permissions
    })
    setShowModal(true)
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('A jeni të sigurt që doni të fshini këtë admin?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Admin u fshi me sukses')
        fetchAdmins()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gabim në fshirjen e admin-it')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Gabim në fshirjen e admin-it')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = editingAdmin 
        ? `/api/admin/admins/${editingAdmin.id}`
        : '/api/admin/admins'
      
      const method = editingAdmin ? 'PUT' : 'POST'
      
      const submitData: any = { ...formData }
      if (editingAdmin && !submitData.password) {
        delete submitData.password // Don't send empty password for updates
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        toast.success(editingAdmin ? 'Admin u përditësua me sukses' : 'Admin u krijua me sukses')
        setShowModal(false)
        resetForm()
        fetchAdmins()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gabim në ruajtjen e admin-it')
      }
    } catch (error) {
      console.error('Error saving admin:', error)
      toast.error('Gabim në ruajtjen e admin-it')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'MODERATOR',
      permissions: []
    })
    setEditingAdmin(null)
  }

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked 
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission)
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Adminat</h1>
          <p className="text-gray-600">Menaxho adminat dhe lejet e tyre</p>
        </div>
        <button 
          onClick={() => {
            resetForm()
            setShowModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Shto Admin</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gjithsej admin</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>
            <UserCheck className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktivë</p>
              <p className="text-2xl font-bold text-green-600">
                {admins.filter(a => a.status === 'active').length}
              </p>
            </div>
            <Shield className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admin</p>
              <p className="text-2xl font-bold text-red-600">
                {admins.filter(a => a.role === 'SUPER_ADMIN').length}
              </p>
            </div>
            <Shield className="text-red-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Moderatorë</p>
              <p className="text-2xl font-bold text-green-600">
                {admins.filter(a => a.role === 'MODERATOR').length}
              </p>
            </div>
            <UserCheck className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kërko admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Të gjitha rolet</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Të gjitha statutet</option>
            <option value="active">Aktivë</option>
            <option value="inactive">Joaktivë</option>
          </select>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredAdmins.length} admin
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statusi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kyçja e fundit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veprimet
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserCheck size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                      {getRoleText(admin.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(admin.status)}`}>
                      {admin.status === 'active' ? 'Aktiv' : 'Joaktiv'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString('sq-AL') : 'Asnjëherë'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEdit(admin)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edito"
                      >
                        <Edit size={16} />
                      </button>
                      {admin.role !== 'SUPER_ADMIN' && (
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Fshi"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Admin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAdmin ? 'Edito Admin' : 'Shto Admin të Ri'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emri *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Emri i plotë"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fjalëkalimi {!editingAdmin && '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder={editingAdmin ? 'Lër bosh për të mos ndryshuar' : 'Fjalëkalimi'}
                    required={!editingAdmin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roli *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lejet
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {allPermissions.map((permission) => (
                    <label key={permission.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.key)}
                        onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={submitting}
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{editingAdmin ? 'Ruaj Ndryshimet' : 'Shto Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
