'use client'

import { useState } from 'react'
import { Mail, Gift, Sparkles, Check } from 'lucide-react'
import toast from 'react-hot-toast'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Ju lutem vendosni email-in tuaj')
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubscribed(true)
      toast.success('U regjistruat me sukses! Kontrolloni email-in tuaj.')
      setEmail('')
    } catch (error) {
      toast.error('Ndodhi një gabim. Ju lutem provoni përsëri.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse" />
        <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-white rounded-full animate-pulse delay-2000" />
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-white rounded-full animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
                <Mail size={40} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Merrni Ofertat Ekskluzive!
            </h2>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Regjistrohuni në listën tonë dhe merrni 10% zbritje në blerjen e parë
            </p>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              Bëhuni i pari që mëson për produktet e reja, ofertat speciale dhe ngjarjet ekskluzive. 
              Plus, merrni një kod zbritjeje si dhuratë mirëseardhje!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift size={24} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">10% Zbritje</h3>
              <p className="text-sm opacity-80">Në blerjen tuaj të parë</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Ofertat e Para</h3>
              <p className="text-sm opacity-80">Para se t&apos;i shikojë tjetri</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-white" />
              </div>
              <h3 className="font-semibold mb-2">Newsletter Ekskluziv</h3>
              <p className="text-sm opacity-80">Përmbajtje speciale çdo javë</p>
            </div>
          </div>

          {/* Subscription Form */}
          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Vendosni email-in tuaj..."
                      className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Regjistrohu'
                    )}
                  </button>
                </div>
                
                <p className="text-sm opacity-70 mt-4">
                  Duke u regjistruar, ju pranoni{' '}
                  <a href="/privacy" className="underline hover:no-underline">
                    Politikën e Privatësisë
                  </a>{' '}
                  tonë. Mund të çregjistroheni në çdo kohë.
                </p>
              </div>
            </form>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-8 text-center">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Faleminderit!</h3>
                <p className="opacity-90">
                  U regjistruat me sukses në listën tonë. Kontroloni email-in tuaj për kodin e zbritjes!
                </p>
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="text-sm">
              ✓ Pa spam, vetëm përmbajtje cilësore
            </div>
            <div className="text-sm">
              ✓ Çregjistrohuni në çdo kohë
            </div>
            <div className="text-sm">
              ✓ 25,000+ abonentë të kënaqur
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
