import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, Share2, Shield, Truck, RotateCcw, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'

// Mock product data
const product = {
  id: 1,
  name: 'Kuti për ruajtjen e ushqimeve me teknologji të avancuar',
  originalPrice: 29.99,
  salePrice: 12.99,
  discount: 57,
  rating: 4.7,
  reviews: 2507,
  inStock: true,
  stockQuantity: 15,
  images: [
    '/images/products/food-storage-1.jpg',
    '/images/products/food-storage-2.jpg',
    '/images/products/food-storage-3.jpg',
    '/images/products/food-storage-4.jpg'
  ],
  features: [
    '🔒 Mbron ushqimet nga myku dhe bakteret',
    '🌿 E bërë nga materiale natyrale',
    '❄️ E përshtatshme për frigorifer dhe ngrirës',
    '🍃 Ruan freskësinë deri në një javë',
    '♻️ E riciklueshme dhe miqësore me mjedisin',
    '🔧 E lehtë për t\'u pastruar'
  ],
  quantities: [
    { count: 1, price: 12.99, discount: 57 },
    { count: 2, price: 11.99, discount: 60 },
    { count: 3, price: 10.99, discount: 63 }
  ],
  description: {
    main: 'Mbani ushqimet e freskëta deri në një javë!',
    sections: [
      {
        title: 'Teknologji e avancuar për ruajtje',
        content: 'Kjo kuti e veçantë përdor teknologji të avancuar për të mbajtur ushqimet tuaja të freskëta për një kohë më të gjatë. Materialet e përdorura janë të sigurta për ushqimin dhe nuk lëshojnë kimikate të dëmshme.',
        image: '/images/products/technology.jpg'
      },
      {
        title: 'Mbron ushqimet nga myku dhe bakteret',
        content: 'Sistemi i vulosjes së kësaj kutie krijon një mjedis të kontrolluar që parandalon rritjen e mikrobeve dhe baktereve që shkaktojnë prishjen e ushqimeve.',
        image: '/images/products/protection.jpg'
      },
      {
        title: 'E thjeshtë për përdorim',
        content: 'Dizajni ergonomik dhe i thjeshtë e bën shumë të lehtë përdorimin e përditshëm. Mund të përdoret në frigorifer, ngrirës dhe në temperaturë dhome.',
        image: '/images/products/usage.jpg'
      }
    ]
  },
  policies: [
    {
      title: 'Garanci për çmimin më të ulët',
      content: 'Nëse gjeni të njëjtin produkt me çmim më të ulët diku tjetër, ne do ta përputhim çmimin dhe do t\'ju japim 5% zbritje shtesë.'
    },
    {
      title: 'Dërgesa',
      content: 'Porositë dërgohen nga Mik Mik brenda territorit të Kosovës. Ofrojmë dërgim standard (2-3 ditë) dhe prioritar (1-2 ditë). Çmimet e dërgimit shfaqen në arkë. Kundërpagesa e mundshme.'
    },
    {
      title: 'Garancia',
      content: 'Të gjitha produktet vijnë me garanci të plotë prej 24 muajsh. Garancia mbulon të gjitha defektet e prodhimit dhe problemet teknike.'
    },
    {
      title: 'Udhëzime',
      content: 'Udhëzime të detajuara për përdorim dhe mirëmbajtje janë të përfshira me produktin. Gjithashtu mund t\'i gjeni në faqen tonë të internetit.'
    }
  ],
  customerReviews: [
    {
      id: 1,
      name: 'Albana K.',
      rating: 5,
      comment: 'Produkt i shkëlqyer! Vërtet ruan ushqimet shumë më gjatë.',
      image: '/images/reviews/customer1.jpg',
      verified: true
    },
    {
      id: 2,
      name: 'Driton M.',
      rating: 5,
      comment: 'Cilësi perfekte, ashtu siç përshkruhej. Rekomandoj!',
      image: '/images/reviews/customer2.jpg',
      verified: true
    },
    {
      id: 3,
      name: 'Fatmira S.',
      rating: 4,
      comment: 'Shumë i dobishëm, më ka kursyer shumë ushqim.',
      image: '/images/reviews/customer3.jpg',
      verified: true
    }
  ]
}

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  if (id !== '1') {
    notFound()
  }

  const timeLeft = {
    hours: 6,
    minutes: 41
  }

  return (
    <>
      <Header />
      <main className="bg-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-pink-500">Kryefaqja</Link>
            <span>/</span>
            <Link href="/dyqan" className="hover:text-pink-500">Dyqan</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden">
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  –{product.discount}%
                </div>
                <div className="w-full h-full flex items-center justify-center text-8xl text-gray-400">
                  📦
                </div>
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((_, index) => (
                  <div key={index} className="h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center text-2xl cursor-pointer hover:ring-2 hover:ring-pink-500">
                    📦
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-medium">{product.rating} / 5</span>
                <span className="text-gray-600">(Vlerësime: {product.reviews.toLocaleString()})</span>
              </div>

              {/* Features */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Karakteristikat kryesore:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>

              {/* Quantity & Pricing */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Zgjidhni sasinë:</h3>
                <div className="space-y-2">
                  {product.quantities.map((qty, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-pink-500 hover:bg-pink-50">
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="quantity" defaultChecked={index === 0} className="text-pink-500" />
                        <span className="font-medium">{qty.count}× kuti</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-red-600">{qty.price.toFixed(2)} € / copa</span>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">–{qty.discount}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Price Display */}
              <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-bold text-red-600">{product.salePrice.toFixed(2)} €</span>
                      <span className="text-lg text-gray-500 line-through">{product.originalPrice.toFixed(2)} €</span>
                    </div>
                    <div className="text-green-600 font-medium">
                      Kurseni {(product.originalPrice - product.salePrice).toFixed(2)} € ({product.discount}%)
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-3 mb-4">
                <ShoppingCart size={24} />
                <span className="text-lg">Shtoje në shportë</span>
              </button>

              {/* Action Buttons */}
              <div className="flex space-x-3 mb-6">
                <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
                  <Heart size={20} />
                  <span>Dëshira</span>
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2">
                  <Share2 size={20} />
                  <span>Ndaje</span>
                </button>
              </div>

              {/* Urgency & Assurance */}
              <div className="space-y-3">
                {/* Stock Countdown */}
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-orange-700">
                    <Clock size={16} />
                    <span className="font-medium">
                      Në stok – bëni porosinë brenda {timeLeft.hours} h {timeLeft.minutes} m për dërgim të njëjtën ditë
                    </span>
                  </div>
                </div>

                {/* Assurance Messages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2 text-green-600">
                    <Truck size={16} />
                    <span className="text-sm font-medium">Dërgesë e shpejtë</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Shield size={16} />
                    <span className="text-sm font-medium">Kundërpagesë e mundshme</span>
                  </div>
                </div>

                {/* Return Guarantee */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700">
                    <RotateCcw size={16} />
                    <span className="font-medium">Mundësi kthimi brenda 14 ditëve</span>
                  </div>
                </div>

                {/* Trustpilot Badge */}
                <div className="flex items-center justify-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-bold">★★★★★</span>
                    <span className="text-sm text-gray-600">Trustpilot vlerësim i shkëlqyer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{product.description.main}</h2>
            <div className="space-y-8">
              {product.description.sections.map((section, index) => (
                <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{section.content}</p>
                  </div>
                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-6xl">
                      📊
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accordion Panels */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Informacione shtesë</h2>
            <div className="space-y-4">
              {product.policies.map((policy, index) => (
                <PolicyAccordion key={index} title={policy.title} content={policy.content} />
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pse klientët tanë thjesht e duan</h2>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-xl font-bold">{product.rating}</span>
              <span className="text-gray-600">nga {product.reviews.toLocaleString()} vlerësime</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.customerReviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{review.name}</div>
                      <div className="flex items-center space-x-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={14} className="text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">&quot;{review.comment}&quot;</p>
                  {review.verified && (
                    <div className="mt-3 flex items-center space-x-1 text-green-600 text-sm">
                      <Shield size={14} />
                      <span>Blerës i verifikuar</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function PolicyAccordion({ title, content }: { title: string; content: string }) {
  return (
    <details className="group border border-gray-200 rounded-lg">
      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
        <span className="font-medium text-gray-900">{title}</span>
        <span className="transform group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="p-4 pt-0 text-gray-700">
        {content}
      </div>
    </details>
  )
}
