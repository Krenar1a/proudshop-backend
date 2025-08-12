'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, Truck, Shield, CreditCard } from 'lucide-react'

const heroSlides = [
  {
    id: 1,
    title: "Mirë se erdhët në Proudshop!",
    subtitle: "Dyqani më i mirë online për Shqipërinë dhe Kosovën",
    description: "Zbuloni mijëra produkte me cilësi të lartë dhe çmime të mira. Dërgim falas për porosi mbi €50.",
    buttonText: "Blej Tani",
    buttonLink: "/products",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800",
    bgColor: "from-pink-500 to-purple-600"
  },
  {
    id: 2,
    title: "Ofertat më të Mira!",
    subtitle: "Zbritje deri në 70% për produkte të përzgjedhura",
    description: "Mos i humbisni ofertat tona të mrekullueshme. Kohë e kufizuar!",
    buttonText: "Shiko Ofertat",
    buttonLink: "/offers",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    bgColor: "from-blue-500 to-cyan-600"
  },
  {
    id: 3,
    title: "Produktet më të Reja",
    subtitle: "Zbuloni trendet e fundit në modë dhe teknologji",
    description: "Qëndroni të përditësuar me produktet më të reja në dyqanin tonë.",
    buttonText: "Eksploroni",
    buttonLink: "/new-arrivals",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    bgColor: "from-green-500 to-teal-600"
  }
]

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <section className="relative overflow-hidden">
      {/* Hero Slider */}
      <div className="relative h-[500px] md:h-[600px] lg:h-[700px]">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`bg-gradient-to-r ${slide.bgColor} h-full flex items-center`}>
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                      {slide.title}
                    </h1>
                    <h2 className="text-xl md:text-2xl mb-6 opacity-90">
                      {slide.subtitle}
                    </h2>
                    <p className="text-lg mb-8 opacity-80">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.buttonLink}
                      className="inline-block bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                      {slide.buttonText}
                    </Link>
                  </div>
                  <div className="hidden lg:block">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronRight size={24} />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-4 text-center md:text-left">
              <div className="bg-pink-100 p-3 rounded-full">
                <Truck className="text-pink-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dërgim Falas</h3>
                <p className="text-gray-600 text-sm">Për porosi mbi €50</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-center md:text-left">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Garantë 100%</h3>
                <p className="text-gray-600 text-sm">Produkte origjinale</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-center md:text-left">
              <div className="bg-green-100 p-3 rounded-full">
                <CreditCard className="text-green-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pagesa e Sigurt</h3>
                <p className="text-gray-600 text-sm">SSL enkriptim</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-center md:text-left">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Cilësi e Lartë</h3>
                <p className="text-gray-600 text-sm">Produkte të përzgjedhura</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
