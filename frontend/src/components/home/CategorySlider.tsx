'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const categories = [
  {
    id: 'me-i-shitur',
    name: 'Më i shitur',
    image: '/images/categories/bestseller.jpg',
    href: '/kategori/me-i-shitur'
  },
  {
    id: 'bukuria-shendeti',
    name: 'Bukuria & Shëndeti',
    image: '/images/categories/beauty-health.jpg',
    href: '/kategori/bukuria-shendeti'
  },
  {
    id: 'makine',
    name: 'Makine',
    image: '/images/categories/automotive.jpg',
    href: '/kategori/makine'
  },
  {
    id: 'pastrim',
    name: 'Pastrim',
    image: '/images/categories/cleaning.jpg',
    href: '/kategori/pastrim'
  },
  {
    id: 'beje-vete',
    name: 'Bëje vetë',
    image: '/images/categories/diy.jpg',
    href: '/kategori/beje-vete'
  },
  {
    id: 'elektronike',
    name: 'Elektronikë',
    image: '/images/categories/electronics.jpg',
    href: '/kategori/elektronike'
  },
  {
    id: 'mode',
    name: 'Modë',
    image: '/images/categories/fashion.jpg',
    href: '/kategori/mode'
  },
  {
    id: 'kuzhine',
    name: 'Kuzhinë',
    image: '/images/categories/kitchen.jpg',
    href: '/kategori/kuzhine'
  },
  {
    id: 'kafshet-shtepiake',
    name: 'Kafshët shtëpiake',
    image: '/images/categories/pets.jpg',
    href: '/kategori/kafshet-shtepiake'
  },
  {
    id: 'vere-summer',
    name: 'Verë/Summer',
    image: '/images/categories/summer.jpg',
    href: '/kategori/vere-summer'
  },
  {
    id: 'lodra',
    name: 'Lodra',
    image: '/images/categories/toys.jpg',
    href: '/kategori/lodra'
  },
  {
    id: 'krishtlindje',
    name: 'Krishtlindje',
    image: '/images/categories/christmas.jpg',
    href: '/kategori/krishtlindje'
  }
]

export function CategorySlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 border"
            style={{ marginLeft: '-20px' }}
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          {/* Categories Container */}
          <div
            ref={scrollRef}
            className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="flex-shrink-0 group"
              >
                <div className="bg-white rounded-xl border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all duration-300 p-4 w-40">
                  <div className="relative h-24 mb-3 overflow-hidden rounded-lg bg-gradient-to-br from-pink-50 to-purple-50">
                    {/* Placeholder for category image */}
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      {getCategoryEmoji(category.id)}
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-800 text-center group-hover:text-pink-600 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 border"
            style={{ marginRight: '-20px' }}
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to get emoji for each category
function getCategoryEmoji(categoryId: string): string {
  const emojiMap: { [key: string]: string } = {
    'me-i-shitur': '🔥',
    'bukuria-shendeti': '💄',
    'makine': '🚗',
    'pastrim': '🧽',
    'beje-vete': '🔨',
    'elektronike': '📱',
    'mode': '👗',
    'kuzhine': '🍳',
    'kafshet-shtepiake': '🐕',
    'vere-summer': '☀️',
    'lodra': '🧸',
    'krishtlindje': '🎄'
  }
  return emojiMap[categoryId] || '📦'
}
