'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, MessageCircle, Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto px-2 md:px-4 py-2 md:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-3 group">
            <div className="relative">
              {/* Logo icon */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-3 group-hover:scale-110">
                <span className="text-lg md:text-xl">🛍️</span>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg md:rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
            </div>
            
            {/* Brand name */}
            <div>
              <h1 className="text-xl md:text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform group-hover:scale-105">
                Proud<span className="text-orange-500">Shop</span>
              </h1>
            </div>
          </Link>

          {/* Search Bar - Centered */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Kërkoni produkte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-16 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-pink-500 text-white p-2 rounded-lg hover:bg-pink-600">
                <Search size={24} />
              </button>
            </div>
          </div>

          {/* Right Side - Chat/Viber and Cart */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Chat/Viber Support */}
            <Link 
              href="viber://chat?number=%2B38344123456"
              className="hidden md:flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <MessageCircle size={20} />
              <span className="font-medium">Chat</span>
            </Link>
            
            {/* Mini Cart */}
            <Link href="/kosarica" className="relative">
              {/* Desktop Cart */}
              <div className="hidden md:flex items-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors">
                <ShoppingCart size={20} />
                <div className="text-right">
                  <div className="text-sm font-medium">0 €</div>
                  <div className="text-xs opacity-90">Shporta</div>
                </div>
              </div>
              
              {/* Mobile Cart - Simple Icon */}
              <div className="md:hidden bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors">
                <ShoppingCart size={20} />
              </div>
              
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center font-bold">
                0
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg border border-gray-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Kërkoni produkte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="hidden md:flex justify-center items-center space-x-8 text-sm">
            <div className="flex items-center space-x-2 text-green-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <span className="font-medium">Dërgesë e shpejtë</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="font-medium">Kundërpagesë</span>
            </div>
            <div className="flex items-center space-x-2 text-purple-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
              </svg>
              <span className="font-medium">Depo në Kosovë</span>
            </div>
          </div>
          
          {/* Mobile info - simplified */}
          <div className="md:hidden flex justify-center">
            <div className="flex items-center space-x-1 text-green-600 text-xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <span className="font-medium">Dërgesë e shpejtë • Kundërpagesë • Depo në Kosovë</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="space-y-4">
              <Link 
                href="/" 
                className="block py-2 text-lg font-medium text-gray-800 hover:text-purple-600 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Faqja kryesore
              </Link>
              <Link 
                href="/products" 
                className="block py-2 text-lg font-medium text-gray-800 hover:text-purple-600 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                🛍️ Të gjitha produktet
              </Link>
              <Link 
                href="/offers" 
                className="block py-2 text-lg font-medium text-gray-800 hover:text-purple-600 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                🔥 Ofertat
              </Link>
              <Link 
                href="/kosarica" 
                className="block py-2 text-lg font-medium text-gray-800 hover:text-purple-600 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                🛒 Shporta
              </Link>
              <Link 
                href="viber://chat?number=%2B38344123456"
                className="block py-2 text-lg font-medium text-purple-600 hover:text-purple-800"
                onClick={() => setIsMenuOpen(false)}
              >
                💬 Kontakto në Viber
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
