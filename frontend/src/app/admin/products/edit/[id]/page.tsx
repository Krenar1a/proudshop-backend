'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Package, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  nameEn: string
  nameSq: string
  description: string
  descriptionEn: string
  descriptionSq: string
  price: number
  stockQuantity: number
  categoryId: string
  thumbnail: string
  images: string[]
  isActive: boolean
  isFeatured: boolean
  specifications: string
  tags: string[]
  weight: number
  dimensions: string
  category: {
    id: string
    name: string
  }
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    nameSq: '',
    description: '',
    descriptionEn: '',
    descriptionSq: '',
    price: 0,
    stockQuantity: 0,
    categoryId: '',
    thumbnail: '',
    images: [] as string[],
    isActive: true,
    isFeatured: false,
    specifications: '',
    tags: [] as string[],
    weight: 0,
    dimensions: ''
  })

  useEffect(() => {
    if (productId) {
      fetchProduct()
      fetchCategories()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const productData = data.product
        setProduct(productData)
        setFormData({
          name: productData.name || '',
          nameEn: productData.nameEn || '',
          nameSq: productData.nameSq || '',
          description: productData.description || '',
          descriptionEn: productData.descriptionEn || '',
          descriptionSq: productData.descriptionSq || '',
          price: productData.price || 0,
          stockQuantity: productData.stockQuantity || 0,
          categoryId: productData.categoryId || '',
          thumbnail: productData.thumbnail || '',
          images: Array.isArray(productData.images) ? productData.images : [],
          isActive: productData.isActive !== false,
          isFeatured: productData.isFeatured || false,
          specifications: productData.specifications || '',
          tags: Array.isArray(productData.tags) ? productData.tags : [],
          weight: productData.weight || 0,
          dimensions: productData.dimensions || ''
        })
      } else if (response.status === 401) {
        toast.error('Duhet të bëni login si admin')
        router.push('/admin/login')
      } else {
        toast.error('Produkti nuk u gjet')
        router.push('/admin/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Gabim në ngarkimin e produktit')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Produkti u përditësua me sukses!')
        router.push('/admin/products')
      } else if (response.status === 401) {
        toast.error('Duhet të bëni login si admin')
        router.push('/admin/login')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Gabim në përditësimin e produktit')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Gabim në përditësimin e produktit')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Produkti nuk u gjet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edito Produktin</h1>
            <p className="text-gray-600">Përditëso informacionet e produktit</p>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
        >
          <Save size={20} />
          <span>{saving ? 'Po ruhet...' : 'Ruaj Ndryshimet'}</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emri i Produktit
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategoria
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Zgjidh kategorinë</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Çmimi (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sasia në Stok
            </label>
            <input
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Përshkrimi
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL e Imazhit
          </label>
          <input
            type="url"
            value={formData.thumbnail}
            onChange={(e) => handleInputChange('thumbnail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Status Options */}
        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Aktiv</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">I Veçantë</span>
          </label>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesha (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensionet
            </label>
            <input
              type="text"
              value={formData.dimensions}
              onChange={(e) => handleInputChange('dimensions', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="20cm x 30cm x 10cm"
            />
          </div>
        </div>

        {/* Specifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specifikacione
          </label>
          <textarea
            value={formData.specifications}
            onChange={(e) => handleInputChange('specifications', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Specifikacione teknike të produktit..."
          />
        </div>
      </form>
    </div>
  )
}
