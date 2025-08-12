'use client'

import { useState, useEffect } from 'react'
import { Folder, Plus, Search, Edit, Trash2, Eye, Star, Package } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  nameEn?: string
  nameSq?: string
  description?: string
  image?: string
  slug: string
  parentId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    nameSq: '',
    description: '',
    image: '',
    parentId: '',
    isActive: true
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else if (response.status === 401) {
        toast.error('Duhet të bëni login si admin')
        window.location.href = '/admin/login'
      } else {
        toast.error('Gabim në ngarkimin e kategorive')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Gabim në ngarkimin e kategorive')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingCategory ? 'Kategoria u përditësua me sukses!' : 'Kategoria u krijua me sukses!')
        setShowAddModal(false)
        setEditingCategory(null)
        setFormData({
          name: '',
          nameEn: '',
          nameSq: '',
          description: '',
          image: '',
          parentId: '',
          isActive: true
        })
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gabim në ruajtjen e kategorisë')
      }
    } catch (error) {
      toast.error('Gabim në ruajtjen e kategorisë')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      nameEn: category.nameEn || '',
      nameSq: category.nameSq || '',
      description: category.description || '',
      image: category.image || '',
      parentId: category.parentId || '',
      isActive: category.isActive
    })
    setShowAddModal(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('A jeni të sigurt që doni të fshini këtë kategori?')) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Kategoria u fshi me sukses')
        fetchCategories()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Gabim në fshirjen e kategorisë')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Gabim në fshirjen e kategorisë')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const parentCategories = categories.filter(cat => !cat.parentId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategoritë</h1>
          <p className="text-gray-600">Menaxho kategoritë e produkteve</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null)
            setFormData({
              name: '',
              nameEn: '',
              nameSq: '',
              description: '',
              image: '',
              parentId: '',
              isActive: true
            })
            setShowAddModal(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Shto Kategori</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Folder size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kategori Gjithsej</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Star size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktive</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Package size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Me Produkte</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.filter(c => c._count && c._count.products > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Kërko kategoritë..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Categories grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredCategories.length} kategori gjithsej
          </h3>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Folder size={48} className="text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Aktive' : 'Joaktive'}
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{category._count?.products || 0} produkte</span>
                      <span>/{category.slug}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <button 
                        onClick={() => window.open(`/categories/${category.slug}`, '_blank')}
                        className="flex-1 text-blue-600 hover:text-blue-800 border border-blue-600 rounded px-3 py-1 text-sm hover:bg-blue-50"
                        title="Shiko kategorinë"
                      >
                        <Eye size={14} className="inline mr-1" />
                        Shiko
                      </button>
                      <button 
                        onClick={() => handleEdit(category)}
                        className="flex-1 text-green-600 hover:text-green-800 border border-green-600 rounded px-3 py-1 text-sm hover:bg-green-50"
                        title="Edito kategorinë"
                      >
                        <Edit size={14} className="inline mr-1" />
                        Edito
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-800 border border-red-600 rounded px-3 py-1 text-sm hover:bg-red-50"
                        title="Fshi kategorinë"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Folder size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nuk ka kategori</h3>
            <p className="text-gray-500 mb-4">Nuk u gjetën kategori që përputhen me filtrat tuaj.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Shto kategorinë e parë
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCategory ? 'Edito Kategorinë' : 'Shto Kategori të Re'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emri *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Emri i kategorisë..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emri në Anglisht
                  </label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({...formData, nameEn: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="English name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emri në Shqip
                  </label>
                  <input
                    type="text"
                    value={formData.nameSq}
                    onChange={(e) => setFormData({...formData, nameSq: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Emri shqip..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Përshkrimi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Përshkrimi i kategorisë..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL e Imazhit
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoria Prind
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nuk ka kategori prind</option>
                  {parentCategories
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                    .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Kategoria është aktive
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingCategory(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Anulo
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Duke ruajtur...' : (editingCategory ? 'Përditëso' : 'Ruaj')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
