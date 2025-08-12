'use client'

import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'

interface Product {
  id: number
  name: string
  originalPrice: number
  salePrice: number
  discount: number
  image: string
  rating: number
  reviews: number
  inStock: boolean
}

// Mock product data
const products = [
  {
    id: 1,
    name: 'Kuti për ruajtjen e ushqimeve',
    originalPrice: 29.99,
    salePrice: 12.99,
    discount: 57,
    image: '/images/products/food-storage.jpg',
    rating: 4.7,
    reviews: 2507,
    inStock: true
  },
  {
    id: 2,
    name: 'Set thyerësh për kuzhinë',
    originalPrice: 45.00,
    salePrice: 19.99,
    discount: 56,
    image: '/images/products/kitchen-knives.jpg',
    rating: 4.5,
    reviews: 1856,
    inStock: true
  },
  {
    id: 3,
    name: 'Organizues për dollap',
    originalPrice: 24.99,
    salePrice: 14.99,
    discount: 40,
    image: '/images/products/organizer.jpg',
    rating: 4.6,
    reviews: 942,
    inStock: true
  },
  {
    id: 4,
    name: 'Bluetooth Speaker portativ',
    originalPrice: 59.99,
    salePrice: 24.99,
    discount: 58,
    image: '/images/products/bluetooth-speaker.jpg',
    rating: 4.8,
    reviews: 3421,
    inStock: true
  },
  {
    id: 5,
    name: 'LED Drita e natës',
    originalPrice: 19.99,
    salePrice: 9.99,
    discount: 50,
    image: '/images/products/night-light.jpg',
    rating: 4.4,
    reviews: 756,
    inStock: true
  },
  {
    id: 6,
    name: 'Çantë për laptops',
    originalPrice: 39.99,
    salePrice: 19.99,
    discount: 50,
    image: '/images/products/laptop-bag.jpg',
    rating: 4.6,
    reviews: 1284,
    inStock: true
  },
  {
    id: 7,
    name: 'Wireless Charger',
    originalPrice: 34.99,
    salePrice: 15.99,
    discount: 54,
    image: '/images/products/wireless-charger.jpg',
    rating: 4.5,
    reviews: 967,
    inStock: true
  },
  {
    id: 8,
    name: 'Smart Watch',
    originalPrice: 149.99,
    salePrice: 69.99,
    discount: 53,
    image: '/images/products/smart-watch.jpg',
    rating: 4.7,
    reviews: 2156,
    inStock: true
  }
]

export function FeaturedProducts() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Dyqan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Zbuloni produktet më të mira me çmime të shkëlqyera dhe zbritje të mëdha
          </p>
        </div>

        {/* Products Grid - 4 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Link
            href="/dyqan"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Shikoni të gjitha produktet
            <svg className="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produkti/${product.id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-200 hover:border-pink-300 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Discount Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              –{product.discount}%
            </span>
          </div>
          
          {/* Stock Badge */}
          {product.inStock && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Në stok
              </span>
            </div>
          )}

          {/* Placeholder for product image */}
          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
            📦
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={`${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {product.rating} ({product.reviews.toLocaleString()})
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-red-600">
                  {product.salePrice.toFixed(2)} €
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {product.originalPrice.toFixed(2)} €
                </span>
              </div>
              <div className="text-xs text-green-600 font-medium">
                Kurseni {(product.originalPrice - product.salePrice).toFixed(2)} €
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2">
            <ShoppingCart size={18} />
            <span>Shtoje në shportë</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
