import Link from 'next/link'
import { MessageCircle, Mail, Shield, Truck, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
          <div className="flex-1">
            <p className="text-sm">
              Përdorim cookies për të përmirësuar përvojën tuaj. Duke vazhduar të përdorni faqen, ju pranoni përdorimin e cookies.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
              Refuzo
            </button>
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm transition-colors">
              Prano të gjitha
            </button>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white">
        {/* Top Section - Service Icons */}
        <div className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Truck size={24} />
                </div>
                <div>
                  <div className="font-semibold">Dërgesë e shpejtë</div>
                  <div className="text-sm text-gray-400">Brenda 24-48 orëve</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield size={24} />
                </div>
                <div>
                  <div className="font-semibold">Kundërpagesë</div>
                  <div className="text-sm text-gray-400">Pagesë në dorëzim</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="font-semibold">Depo në Kosovë</div>
                  <div className="text-sm text-gray-400">Stok lokal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Logo & Support */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="relative group">
                  {/* Logo icon */}
                  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                    <span className="text-lg">🛍️</span>
                  </div>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300 blur-md"></div>
                </div>
                
                {/* Brand name */}
                <div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Proud<span className="text-orange-400">Shop</span>
                  </h1>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-3">Keni nevojë për ndihmë?</h3>
                <p className="text-gray-400 mb-4">Kontaktoni ekipin tonë të suportit:</p>
                
                <div className="space-y-2">
                  <Link 
                    href="viber://chat?number=%2B38344123456"
                    className="flex items-center justify-center md:justify-start space-x-2 text-purple-400 hover:text-purple-300"
                  >
                    <MessageCircle size={16} />
                    <span>Viber: +383 44 123 456</span>
                  </Link>
                  <Link 
                    href="mailto:info@proudshop.com"
                    className="flex items-center justify-center md:justify-start space-x-2 text-blue-400 hover:text-blue-300"
                  >
                    <Mail size={16} />
                    <span>info@proudshop.com</span>
                  </Link>
                </div>
                
                <div className="mt-4 text-sm text-gray-400">
                  <div className="font-medium mb-1">Orari i punës:</div>
                  <div>E hënë - E premte: 08:00 - 20:00</div>
                  <div>E shtunë: 09:00 - 18:00</div>
                  <div>E diel: 10:00 - 16:00</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold mb-4">Lidhje të shpejta</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    Kryefaqja
                  </Link>
                </li>
                <li>
                  <Link href="/dyqan" className="text-gray-400 hover:text-white transition-colors">
                    Dyqan
                  </Link>
                </li>
                <li>
                  <Link href="/kategori/me-i-shitur" className="text-gray-400 hover:text-white transition-colors">
                    Më të shitura
                  </Link>
                </li>
                <li>
                  <Link href="/kosarica" className="text-gray-400 hover:text-white transition-colors">
                    Shporta
                  </Link>
                </li>
                <li>
                  <Link href="/rreth-nesh" className="text-gray-400 hover:text-white transition-colors">
                    Rreth nesh
                  </Link>
                </li>
                <li>
                  <Link href="/kontakti" className="text-gray-400 hover:text-white transition-colors">
                    Kontakti
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Information */}
            <div>
              <h3 className="font-semibold mb-4">Informacione të dobishme</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/kushtet-dhe-afatet-e-pergjithshme.pdf" 
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                  >
                    Kushtet dhe afatet e përgjithshme
                  </Link>
                </li>
                <li>
                  <Link href="/politika-e-sigurise" className="text-gray-400 hover:text-white transition-colors">
                    Politika e sigurisë
                  </Link>
                </li>
                <li>
                  <Link href="/politika-e-cookies" className="text-gray-400 hover:text-white transition-colors">
                    Politika e cookie-ve
                  </Link>
                </li>
                <li>
                  <Link href="/e-drejta-per-tu-terhequr" className="text-gray-400 hover:text-white transition-colors">
                    E drejta për t&apos;u tërhequr nga blerja
                  </Link>
                </li>
                <li>
                  <Link href="/ankesat-dhe-apelimet" className="text-gray-400 hover:text-white transition-colors">
                    Ankesat dhe apelimet
                  </Link>
                </li>
                <li>
                  <Link href="/zevendesim-garancie" className="text-gray-400 hover:text-white transition-colors">
                    Zëvendësim garancie
                  </Link>
                </li>
                <li>
                  <Link href="/informacioni-i-kompanise" className="text-gray-400 hover:text-white transition-colors">
                    Informacioni i kompanisë
                  </Link>
                </li>
                <li>
                  <Link href="/udhezime-per-perdorim" className="text-gray-400 hover:text-white transition-colors">
                    Udhëzime për përdorim
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-gray-400 text-sm">
                  © 2025 ProudShop. Të gjitha të drejtat e rezervuara.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Ndërtuar me ❤️ për tregun shqiptar
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Security Badges */}
                <div className="flex items-center space-x-2 text-green-400">
                  <Shield size={16} />
                  <span className="text-xs">SSL 256-bit</span>
                </div>
                <div className="text-xs text-gray-400">
                  100% Blerje e sigurt
                </div>
                
                {/* Back to Top */}
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-pink-400 hover:text-pink-300 text-sm underline"
                >
                  Kthehu në fillim
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
