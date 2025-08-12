import Link from 'next/link'

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header që do të përdoret për kategorit */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 text-white text-sm py-3">
          <div className="container mx-auto px-4 flex justify-center">
            <div className="flex space-x-8">
              <span className="hover:text-yellow-300 transition-colors">📞 Viber/WhatsApp: +383 44 123 456</span>
              <span className="hover:text-yellow-300 transition-colors">✉️ info@proudshop.com</span>
              <span className="hover:text-yellow-300 transition-colors">🚚 Dërgesë e shpejtë 24-48h</span>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  {/* Logo icon */}
                  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:rotate-3 group-hover:scale-110">
                    <span className="text-xl">🛍️</span>
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur-lg"></div>
                </div>
                
                {/* Brand name */}
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform group-hover:scale-105">
                    Proud<span className="text-orange-500">Shop</span>
                  </h1>
                </div>
              </Link>
            </div>
            
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Kërkoni produktet..."
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 focus:border-purple-500 transition-all duration-300"
                />
                <button className="absolute right-3 top-3 text-purple-500 hover:text-purple-700 transition-colors">
                  🔍
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-all duration-300 font-medium">
                <span>🛒</span>
                <span>Shporta</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative group">
              {/* Logo icon */}
              <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-xl">🛍️</span>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-lg"></div>
            </div>
            
            {/* Brand name */}
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Proud<span className="text-orange-400">Shop</span>
              </h1>
            </div>
          </div>
          <p className="text-gray-300 mb-6">Dyqani juaj online më i besueshëm në Kosovë dhe Shqipëri.</p>
          <div className="flex justify-center space-x-6 mb-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">Kryefaqja</Link>
            <a href="/produktet" className="text-gray-300 hover:text-white transition-colors">Produktet</a>
            <a href="/kontakti" className="text-gray-300 hover:text-white transition-colors">Kontakti</a>
          </div>
          <p className="text-gray-400 text-sm">© 2025 ProudShop. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </footer>
    </div>
  )
}
