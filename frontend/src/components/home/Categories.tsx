import Link from 'next/link'

const categories = [
  {
    id: 1,
    name: "Elektronikë",
    nameEn: "Electronics",
    slug: "electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400",
    productCount: 1250,
    color: "from-blue-500 to-blue-600"
  },
  {
    id: 2,
    name: "Modë",
    nameEn: "Fashion",
    slug: "fashion",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
    productCount: 890,
    color: "from-pink-500 to-pink-600"
  },
  {
    id: 3,
    name: "Shtëpi & Kopsht",
    nameEn: "Home & Garden",
    slug: "home-garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
    productCount: 675,
    color: "from-green-500 to-green-600"
  },
  {
    id: 4,
    name: "Bukuri & Shëndet",
    nameEn: "Beauty & Health",
    slug: "beauty-health",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    productCount: 420,
    color: "from-purple-500 to-purple-600"
  },
  {
    id: 5,
    name: "Sport & Aktivitete",
    nameEn: "Sports & Activities",
    slug: "sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
    productCount: 315,
    color: "from-orange-500 to-orange-600"
  },
  {
    id: 6,
    name: "Automjete",
    nameEn: "Automotive",
    slug: "automotive",
    image: "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=400",
    productCount: 280,
    color: "from-red-500 to-red-600"
  },
  {
    id: 7,
    name: "Libra & Media",
    nameEn: "Books & Media",
    slug: "books",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400",
    productCount: 180,
    color: "from-indigo-500 to-indigo-600"
  },
  {
    id: 8,
    name: "Lodra & Lojëra",
    nameEn: "Toys & Games",
    slug: "toys",
    image: "https://images.unsplash.com/photo-1558877808-f9ec0e15de3c?w=400",
    productCount: 145,
    color: "from-yellow-500 to-yellow-600"
  }
]

export function Categories() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Blini sipas Kategorisë
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Zbuloni mijëra produkte të organizuara në kategori për t&apos;ju lehtësuar blerjen
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Category Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`} />
                </div>

                {/* Category Info */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90 mb-2">{category.nameEn}</p>
                  <p className="text-sm opacity-75">
                    {category.productCount} produkte
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <Link
            href="/categories"
            className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
          >
            Shikoni të Gjitha Kategoritë
          </Link>
        </div>
      </div>
    </section>
  )
}
