import { Shield, Truck, CreditCard, Headphones, Award, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: "Dërgim i Shpejtë",
    description: "Dërgim falas për porosi mbi €50. Dërgim në të gjithë Shqipërinë dhe Kosovën brenda 24-48 orëve.",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  {
    icon: Shield,
    title: "Pagesa e Sigurt",
    description: "Sistemi i pageses është 100% i sigurt me enkriptim SSL. Pranojmë të gjitha kartat kryesore dhe PayPal.",
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: Award,
    title: "Cilësi e Garantuar",
    description: "Të gjitha produktet janë origjinale dhe vijnë me garanci. Kemi marrëdhënie direkte me prodhuesit.",
    color: "text-purple-600",
    bgColor: "bg-purple-100"
  },
  {
    icon: Headphones,
    title: "Suport 24/7",
    description: "Ekipi ynë i suportit është në dispozicion çdo ditë të javës për t'ju ndihmuar me çdo pyetje.",
    color: "text-pink-600",
    bgColor: "bg-pink-100"
  },
  {
    icon: RefreshCw,
    title: "Kthim i Lehtë",
    description: "Nëse nuk jeni të kënaqur, mund ta ktheni produktin brenda 30 ditëve pa asnjë pyetje.",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icon: CreditCard,
    title: "Pagesa Fleksibël",
    description: "Mundësi pagese me këste dhe kundërpagesë. Zgjidhni mënyrën që ju përshtatet më së miri.",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100"
  }
]

const stats = [
  {
    number: "50,000+",
    label: "Klientë të Kënaqur",
    description: "Klientë që na besojnë çdo ditë"
  },
  {
    number: "10,000+",
    label: "Produkte",
    description: "Në gjithë kategoritë tona"
  },
  {
    number: "99.5%",
    label: "Kënaqësi",
    description: "Përqindje e kënaqësisë së klientëve"
  },
  {
    number: "24/7",
    label: "Suport",
    description: "Gjithmonë në shërbimin tuaj"
  }
]

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pse të Zgjidhni Proudshop?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Jemi krenarë t&apos;ju ofrojmë përvojën më të mirë të blerjes online në Shqipëri dhe Kosovë. 
            Zbuloni pse mijëra klientë na zgjedhin çdo ditë.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-center group"
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent size={32} className={feature.color} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Në Shifra të Jashtëzakonshme
            </h3>
            <p className="text-lg opacity-90">
              Rezultatet tona flasin për cilësinë e shërbimit tonë
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold mb-1 opacity-95">
                  {stat.label}
                </div>
                <div className="text-sm opacity-80">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Çfarë Thonë Klientët Tanë
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b772ad55?w=50"
                  alt="Ana Hoxha"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Ana Hoxha</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;Shërbim i shkëlqyer! Produktet arritën shpejt dhe cilësia është e jashtëzakonshme. 
                Definitivt do të blej përsëri.&quot;
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50"
                  alt="Arian Krasniqi"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Arian Krasniqi</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;Çmimet janë shumë konkurruese dhe suporti për klientë është i mrekullueshëm. 
                Më ndihmuan me të gjitha pyetjet e mia.&quot;
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50"
                  alt="Valdete Mustafa"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">Valdete Mustafa</h4>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                &quot;Faqja është shumë e lehtë për t&apos;u përdorur dhe procesi i blerjes është i thjeshtë. 
                Faleminderit Proudshop!&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
