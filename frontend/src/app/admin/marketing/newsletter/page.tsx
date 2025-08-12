'use client'

import { useState } from 'react'
import { Mail, Users, TrendingUp, Send, Plus, Download } from 'lucide-react'

export default function NewsletterPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const subscribers = [
    { email: 'arben@email.com', name: 'Arben Krasniqi', subscribed: '2024-01-15', status: 'active' },
    { email: 'linda@email.com', name: 'Linda Hoxha', subscribed: '2024-01-12', status: 'active' },
    { email: 'besart@email.com', name: 'Besart Berisha', subscribed: '2024-01-10', status: 'unsubscribed' },
    { email: 'fitore@email.com', name: 'Fitore Gashi', subscribed: '2024-01-08', status: 'active' }
  ]

  const activeSubscribers = subscribers.filter(s => s.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-gray-600">Menaxho newsletter dhe subscriber</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Send size={20} />
          <span>Dërgo Newsletter</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subscriber aktivë</p>
              <p className="text-2xl font-bold text-gray-900">{activeSubscribers}</p>
            </div>
            <Users className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Newsletter dërguar</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
            <Mail className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mesatarja e hapjes</p>
              <p className="text-2xl font-bold text-gray-900">32.5%</p>
            </div>
            <TrendingUp className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regjistrimet e reja</p>
              <p className="text-2xl font-bold text-gray-900">+12</p>
            </div>
            <Plus className="text-orange-500" size={32} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Përmbledhje' },
              { id: 'subscribers', label: 'Subscriber' },
              { id: 'campaigns', label: 'Kampania' },
              { id: 'templates', label: 'Template' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Regjistrimet e fundit</h3>
                  <div className="space-y-3">
                    {subscribers.slice(0, 5).map((subscriber, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{subscriber.name}</p>
                          <p className="text-xs text-gray-500">{subscriber.email}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(subscriber.subscribed).toLocaleDateString('sq-AL')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Newsletter të fundit</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'Produktet e reja të javës', sent: '2024-01-20', opens: '28%' },
                      { title: 'Zbritje të veçanta', sent: '2024-01-15', opens: '35%' },
                      { title: 'Newsletter vjetore', sent: '2024-01-01', opens: '42%' }
                    ].map((newsletter, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{newsletter.title}</p>
                          <p className="text-xs text-gray-500">Dërguar: {newsletter.sent}</p>
                        </div>
                        <span className="text-xs font-medium text-green-600">{newsletter.opens}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Lista e Subscriber</h3>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                  <Download size={16} />
                  <span>Eksporto</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emri</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Regjistruar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statusi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {subscribers.map((subscriber, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{subscriber.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{subscriber.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(subscriber.subscribed).toLocaleDateString('sq-AL')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscriber.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subscriber.status === 'active' ? 'Aktiv' : 'Çregjistruar'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="text-center py-12">
              <Mail size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Krijimi i kampanisë</h3>
              <p className="text-gray-500 mb-4">Krijo dhe menaxho kampania të newsletter</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Krijo Kampani të Re
              </button>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="text-center py-12">
              <Mail size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Template për Newsletter</h3>
              <p className="text-gray-500 mb-4">Krijo dhe menaxho template për newsletter</p>
              <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                Krijo Template të Re
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
