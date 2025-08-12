'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingCart, Heart, Star, Package, Truck, Shield, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import PlaceholderImage from '@/components/ui/PlaceholderImage'
import { useCart } from '@/contexts/CartContext'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stockQuantity: number
  thumbnail: string
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  specifications: string
  tags: string[]
  weight: number
  dimensions: string
  rating: number
  reviewCount: number
  isActive: boolean
  isFeatured: boolean
}

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart: addToCartContext, buyNow: buyNowContext, items } = useCart()
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products?id=${productId}`)
      
      if (response.ok) {
        const data = await response.json()
        const foundProduct = data.products?.find((p: Product) => p.id === productId)
        
        if (foundProduct) {
          setProduct(foundProduct)
        } else {
          toast.error('Produkti nuk u gjet')
          router.push('/')
        }
      } else {
        toast.error('Gabim në ngarkimin e produktit')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Gabim në ngarkimin e produktit')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!product) return
    await addToCartContext(product.id, quantity)
  }

  const buyNow = async () => {
    if (!product) return
    
    // Use the new buyNow function that handles quantity properly
    await buyNowContext(product.id, quantity)
    
    // Redirect to checkout immediately
    router.push('/checkout')
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

  const images = product.images && product.images.length > 0 
    ? product.images 
    : product.thumbnail 
      ? [product.thumbnail] 
      : ['/placeholder-image.svg']

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Kthehu pas</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <PlaceholderImage
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
              width={500}
              height={500}
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <PlaceholderImage
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                    width={64}
                    height={64}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-blue-600 font-medium">{product.category.name}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating?.toFixed(1)} ({product.reviewCount} vlerësime)
            </span>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              €{product.price.toFixed(2)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600 font-semibold">✅ Çmim i ulët i garantuar</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Përshkrimi</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3">
            <Package size={18} className={product.stockQuantity > 5 ? 'text-green-600' : 'text-orange-600'} />
            <span className={`text-sm font-semibold ${
              product.stockQuantity > 5 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {product.stockQuantity > 0 
                ? `${product.stockQuantity} në stok` 
                : 'Jashtë stokut'
              }
            </span>
            {product.stockQuantity > 0 && (
              <span className="text-xs text-gray-500">• Gati për dërgesë</span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stockQuantity > 0 && (
            <div className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
              <span className="text-sm font-semibold text-gray-700">Sasia:</span>
              <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-white hover:bg-gray-100 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="px-6 py-2 bg-white border-x-2 border-gray-300 font-bold text-lg min-w-[60px] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-4 py-2 bg-white hover:bg-gray-100 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Maksimumi: {product.stockQuantity}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {product.stockQuantity > 0 ? (
            <div className="space-y-3">
              <button
                onClick={addToCart}
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white py-4 px-6 rounded-xl hover:from-purple-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-2 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ShoppingCart size={22} />
                <span>Shto në Shportë</span>
              </button>
              
              <button
                onClick={buyNow}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-2 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <span className="text-xl">⚡</span>
                <span>Blej Tani</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-gray-400 text-white py-4 px-6 rounded-xl cursor-not-allowed font-bold text-lg"
            >
              Jashtë Stokut
            </button>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Truck size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Transporti falas</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Garanci 1 vit</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Kthim 30 ditë</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart size={16} className="text-gray-400" />
              <span className="text-sm text-gray-600">Shtoje në lista</span>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifikacione</h3>
              <div className="prose prose-sm text-gray-600">
                <p className="whitespace-pre-line">{product.specifications}</p>
              </div>
            </div>
          )}

          {/* Additional Info */}
          {(product.weight > 0 || product.dimensions) && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Informacione shtesë</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {product.weight > 0 && (
                  <div className="flex justify-between">
                    <span>Pesha:</span>
                    <span>{product.weight} kg</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between">
                    <span>Dimensionet:</span>
                    <span>{product.dimensions}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
