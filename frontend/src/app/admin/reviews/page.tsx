'use client'

import { useState } from 'react'
import { Star, StarOff, Search, Filter, Eye, Trash2, MessageSquare } from 'lucide-react'

interface Review {
  id: string
  productName: string
  customerName: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: string
  productId: string
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      productName: 'Laptop Gaming Pro',
      customerName: 'Arben Krasniqi',
      rating: 5,
      comment: 'Produkt i shkëlqyer! Cilësi e lartë dhe shërbim perfekt.',
      isApproved: true,
      createdAt: '2024-01-20',
      productId: 'prod-1'
    },
    {
      id: '2',
      productName: 'Telefon Smartphone X',
      customerName: 'Linda Hoxha',
      rating: 4,
      comment: 'Telefon i mirë, por bateria mund të jetë më e mirë.',
      isApproved: true,
      createdAt: '2024-01-18',
      productId: 'prod-2'
    },
    {
      id: '3',
      productName: 'Kamerë DSLR Pro',
      customerName: 'Besart Berisha',
      rating: 3,
      comment: 'Cilësia e fotografive është mesatare për çmimin.',
      isApproved: false,
      createdAt: '2024-01-15',
      productId: 'prod-3'
    },
    {
      id: '4',
      productName: 'Headphones Wireless',
      customerName: 'Fitore Gashi',
      rating: 1,
      comment: 'Zëri nuk është i qartë dhe ka probleme me lidhjen.',
      isApproved: false,
      createdAt: '2024-01-12',
      productId: 'prod-4'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterRating, setFilterRating] = useState('all')

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && review.isApproved) ||
                         (filterStatus === 'pending' && !review.isApproved)
    const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating
    
    return matchesSearch && matchesStatus && matchesRating
  })

  const handleApprove = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId ? { ...review, isApproved: true } : review
    ))
  }

  const handleReject = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId ? { ...review, isApproved: false } : review
    ))
  }

  const handleDelete = (reviewId: string) => {
    if (confirm('A jeni të sigurt që doni të fshini këtë recensioni?')) {
      setReviews(reviews.filter(review => review.id !== reviewId))
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={`${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getStatusColor = (isApproved: boolean) => {
    return isApproved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recensionet</h1>
          <p className="text-gray-600">Menaxho recensionet e klientëve</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {reviews.filter(r => !r.isApproved).length} në pritje
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gjithsej</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            </div>
            <MessageSquare className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Të miratuara</p>
              <p className="text-2xl font-bold text-green-600">{reviews.filter(r => r.isApproved).length}</p>
            </div>
            <Star className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Në pritje</p>
              <p className="text-2xl font-bold text-yellow-600">{reviews.filter(r => !r.isApproved).length}</p>
            </div>
            <StarOff className="text-yellow-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mesatarja</p>
              <p className="text-2xl font-bold text-gray-900">
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </p>
            </div>
            <Star className="text-yellow-500 fill-current" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kërko recensione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Të gjitha</option>
            <option value="approved">Të miratuara</option>
            <option value="pending">Në pritje</option>
          </select>
          
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Të gjitha vlerësimet</option>
            <option value="5">5 yje</option>
            <option value="4">4 yje</option>
            <option value="3">3 yje</option>
            <option value="2">2 yje</option>
            <option value="1">1 yll</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredReviews.length} recensione
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredReviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h4 className="font-medium text-gray-900">{review.customerName}</h4>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.isApproved)}`}>
                      {review.isApproved ? 'Miratuar' : 'Në pritje'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{review.productName}</p>
                  <p className="text-gray-800 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('sq-AL')}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      {!review.isApproved && (
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Mirато
                        </button>
                      )}
                      {review.isApproved && (
                        <button
                          onClick={() => handleReject(review.id)}
                          className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                        >
                          Çmirато
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredReviews.length === 0 && (
          <div className="p-12 text-center">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nuk u gjetën recensione</p>
          </div>
        )}
      </div>
    </div>
  )
}
