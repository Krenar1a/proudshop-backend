'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { CategorySlider } from '@/components/home/CategorySlider'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, ShoppingCart } from 'lucide-react'

// Mock categories data
const categories = {
  'me-i-shitur': {
    name: 'Më i shitur',
    description: 'Produktet më të kërkuara dhe të bliruara nga klientët tanë'
  },
  'bukuria-shendeti': {
    name: 'Bukuria & Shëndeti',
    description: 'Produkte për bukurinë dhe mirëqenien tuaj'
  },
  'makine': {
    name: 'Makine',
    description: 'Aksesorë dhe pajisje për automjetet'
  },
  'pastrim': {
    name: 'Pastrim',
    description: 'Produkte pastrimi për shtëpinë dhe zyrën'
  },
  'beje-vete': {
    name: 'Bëje vetë',
    description: 'Mjete dhe materiale për punë të ndryshme'
  },
  'elektronike': {
    name: 'Elektronikë',
    description: 'Pajisje elektronike dhe gadgete teknologjike'
  },
  'mode': {
    name: 'Modë',
    description: 'Veshje dhe aksesorë modë'
  },
  'kuzhine': {
    name: 'Kuzhinë',
    description: 'Pajisje dhe aksesorë për kuzhinën'
  },
  'kafshet-shtepiake': {
    name: 'Kafshët shtëpiake',
    description: 'Produkte për kafshët tuaja të dashura'
  },
  'vere-summer': {
    name: 'Verë/Summer',
    description: 'Produkte për verën dhe aktivitete në natyrë'
  },
  'lodra': {
    name: 'Lodra',
    description: 'Lodra dhe lojëra për fëmijë'
  },
  'krishtlindje': {
    name: 'Krishtlindje',
    description: 'Dekorime dhe dhurata për Krishtlindje'
  }
}

// Mock products for each category
const mockProducts = [
  {
    id: 1,
    name: 'Produkt i shkëlqyer për kategorinë',
    originalPrice: 29.99,
    salePrice: 19.99,
    discount: 33,
    rating: 4.7,
    reviews: 1507,
    inStock: true
  },
  {
    id: 2,
    name: 'Tjetër produkt i mirë',
    originalPrice: 45.00,
    salePrice: 29.99,
    discount: 33,
    rating: 4.5,
    reviews: 856,
    inStock: true
  },
  {
    id: 3,
    name: 'Produkt cilësor me çmim të mirë',
    originalPrice: 39.99,
    salePrice: 24.99,
    discount: 38,
    rating: 4.6,
    reviews: 642,
    inStock: true
  },
  {
    id: 4,
    name: 'Produkt i rekomanduar',
    originalPrice: 59.99,
    salePrice: 39.99,
    discount: 33,
    rating: 4.8,
    reviews: 1921,
    inStock: true
  }
]

interface CategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params
  const categoryData = categories[category as keyof typeof categories]
  
  if (!categoryData) {
    notFound()
  }

  return (
    <>
      <Header />
      <main>
        <CategorySlider />
        
        <div className="container mx-auto px-4 py-8">
          {/* Category Header */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-pink-500">Kryefaqja</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{categoryData.name}</span>
            </nav>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{categoryData.name}</h1>
            <p className="text-gray-600 text-lg">{categoryData.description}</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              Ngarko më shumë produkte
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProductCard({ product }: { product: any }) {
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
