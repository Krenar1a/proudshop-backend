'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Star, ArrowRight } from 'lucide-react'

const specialOffers = [
  {
    id: 1,
    title: "Ditët e Çmendura të Proudshop",
    subtitle: "Zbritje deri në 70% për produktet e përzgjedhura",
    description: "Mos e humbisni këtë ofertë të mrekullueshme! Kohë e kufizuar.",
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    discountPercentage: 70,
    buttonText: "Shiko Ofertat",
    buttonLink: "/offers/crazy-days",
    bgColor: "from-red-500 to-pink-600"
  },
  {
    id: 2,
    title: "Elektronikë me 50% Zbritje",
    subtitle: "Telefonë, laptop, kamera dhe shumë më tepër",
    description: "Azhurnoni teknologjinë tuaj me çmime të pabesueshme.",
    image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600",
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    discountPercentage: 50,
    buttonText: "Eksploro Elektronikën",
    buttonLink: "/categories/electronics?offer=true",
    bgColor: "from-blue-500 to-purple-600"
  }
]

const flashDeals = [
  {
    id: 1,
    name: "Kufje Gaming Pro",
    originalPrice: 89,
    salePrice: 39,
    discount: 56,
    image: "https://images.unsplash.com/photo-1599669454699-248893623440?w=300",
    rating: 4.7,
    soldCount: 45,
    totalStock: 100,
    endTime: new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours from now
  },
  {
    id: 2,
    name: "Orë Inteligjente Sport",
    originalPrice: 199,
    salePrice: 99,
    discount: 50,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300",
    rating: 4.5,
    soldCount: 23,
    totalStock: 50,
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000) // 3 hours from now
  },
  {
    id: 3,
    name: "Çantë Udhëtimi Premium",
    originalPrice: 129,
    salePrice: 79,
    discount: 39,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300",
    rating: 4.8,
    soldCount: 67,
    totalStock: 80,
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours from now
  }
]

export function SpecialOffers() {
  const [timeLeft, setTimeLeft] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const newTimeLeft: {[key: string]: string} = {}

      // Calculate time left for main offers
      specialOffers.forEach(offer => {
        const distance = offer.endDate.getTime() - now
        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24))
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          
          newTimeLeft[offer.id] = `${days}d ${hours}h ${minutes}m ${seconds}s`
        } else {
          newTimeLeft[offer.id] = "Përfundoi"
        }
      })

      // Calculate time left for flash deals
      flashDeals.forEach(deal => {
        const distance = deal.endTime.getTime() - now
        if (distance > 0) {
          const hours = Math.floor(distance / (1000 * 60 * 60))
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((distance % (1000 * 60)) / 1000)
          
          newTimeLeft[`flash-${deal.id}`] = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        } else {
          newTimeLeft[`flash-${deal.id}`] = "Përfundoi"
        }
      })

      setTimeLeft(newTimeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Main Special Offers */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ofertat e Veçanta
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Mos i humbisni ofertat tona ekskluzive me zbritje të mëdha
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {specialOffers.map((offer) => (
              <div
                key={offer.id}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${offer.bgColor} text-white`}
              >
                <div className="relative z-10 p-8 lg:p-12">
                  <div className="flex flex-col lg:flex-row items-center">
                    <div className="flex-1 mb-6 lg:mb-0 lg:pr-8">
                      <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                        {offer.title}
                      </h3>
                      <p className="text-xl mb-4 opacity-90">
                        {offer.subtitle}
                      </p>
                      <p className="mb-6 opacity-80">
                        {offer.description}
                      </p>
                      
                      {/* Countdown Timer */}
                      <div className="flex items-center mb-6">
                        <Clock size={20} className="mr-2" />
                        <span className="text-lg font-mono">
                          {timeLeft[offer.id] || "Loading..."}
                        </span>
                      </div>

                      <Link
                        href={offer.buttonLink}
                        className="inline-flex items-center bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors group"
                      >
                        {offer.buttonText}
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-64 h-64 object-cover rounded-lg shadow-xl"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flash Deals */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              ⚡ Flash Deals
            </h3>
            <p className="text-lg text-gray-600">
              Ofertat e shkurtra me zbritje të mëdha - nxitoni!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {flashDeals.map((deal) => {
              const soldPercentage = (deal.soldCount / deal.totalStock) * 100
              
              return (
                <div key={deal.id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-red-200">
                  {/* Timer Header */}
                  <div className="bg-red-500 text-white px-4 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <Clock size={16} className="mr-2" />
                      <span className="font-mono font-bold">
                        {timeLeft[`flash-${deal.id}`] || "Loading..."}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <img
                      src={deal.image}
                      alt={deal.name}
                      className="w-full h-32 object-cover rounded-lg mb-4"
                    />
                    
                    <h4 className="font-semibold text-gray-900 mb-2">{deal.name}</h4>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${
                              i < Math.floor(deal.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        ({deal.rating})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="mb-3">
                      <span className="text-xl font-bold text-red-600">
                        €{deal.salePrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through ml-2">
                        €{deal.originalPrice}
                      </span>
                      <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2">
                        -{deal.discount}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Shitur: {deal.soldCount}</span>
                        <span>Mbetur: {deal.totalStock - deal.soldCount}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <button className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors">
                      Blej Tani
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
