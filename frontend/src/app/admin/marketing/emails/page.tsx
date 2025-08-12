'use client'

import { useState, useEffect } from 'react'
import { Mail, Plus, Send, Users, Eye, Edit, Trash2, Calendar, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sent'
  recipients: number
  openRate: number
  clickRate: number
  scheduledDate?: string
  sentDate?: string
  createdAt: string
}

export default function EmailCampaignsPage() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: '',
    content: '',
    recipients: ''
  })

  // Fetch campaigns from API
  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/marketing/emails', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    }
  }

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content || !newCampaign.recipients) {
      toast.error('Të gjitha fushat janë të detyrueshëm')
      return
    }

    setLoading(true)
    try {
      const recipients = newCampaign.recipients.split(',').map(email => email.trim()).filter(email => email)
      
      const response = await fetch('/api/admin/marketing/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          campaignName: newCampaign.name,
          subject: newCampaign.subject,
          content: newCampaign.content,
          recipients
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setShowCreateModal(false)
        setNewCampaign({ name: '', subject: '', content: '', recipients: '' })
        fetchCampaigns() // Refresh campaigns
      } else {
        toast.error(data.error || 'Gabim në dërgimin e kampanjës')
      }
    } catch (error) {
      toast.error('Gabim në dërgimin e kampanjës')
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Dërguar'
      case 'scheduled': return 'Planifikuar'
      case 'draft': return 'Draft'
      default: return status
    }
  }

  const handleDuplicate = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId)
    if (campaign) {
      const newCampaign = {
        ...campaign,
        id: Date.now().toString(),
        name: `${campaign.name} (Kopje)`,
        status: 'draft' as const,
        recipients: 0,
        openRate: 0,
        clickRate: 0,
        scheduledDate: undefined,
        sentDate: undefined,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setCampaigns([newCampaign, ...campaigns])
    }
  }

  const handleDelete = (campaignId: string) => {
    if (confirm('A jeni të sigurt që doni të fshini këtë fushatë?')) {
      setCampaigns(campaigns.filter(c => c.id !== campaignId))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
          <p className="text-gray-600">Menaxho fushatat e email marketing</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Krijo Fushatë</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gjithsej fushata</p>
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
            </div>
            <Mail className="text-blue-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Email të dërguar</p>
              <p className="text-2xl font-bold text-green-600">
                {campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + c.recipients, 0)}
              </p>
            </div>
            <Send className="text-green-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mesatarja e hapjes</p>
              <p className="text-2xl font-bold text-purple-600">
                {(campaigns.filter(c => c.status === 'sent').reduce((acc, c) => acc + c.openRate, 0) / 
                  campaigns.filter(c => c.status === 'sent').length || 0).toFixed(1)}%
              </p>
            </div>
            <Eye className="text-purple-500" size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Planifikuara</p>
              <p className="text-2xl font-bold text-blue-600">
                {campaigns.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
            <Calendar className="text-blue-500" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Kërko fushata..."
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
            <option value="draft">Draft</option>
            <option value="scheduled">Planifikuara</option>
            <option value="sent">Dërguara</option>
          </select>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filteredCampaigns.length} fushata
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fushata
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statusi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marrës
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performanca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veprimet
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-sm text-gray-500">{campaign.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                      {getStatusText(campaign.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{campaign.recipients}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {campaign.status === 'sent' ? (
                      <div className="text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">Hapja: {campaign.openRate}%</span>
                          <span className="text-gray-600">Klikime: {campaign.clickRate}%</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {campaign.sentDate && `Dërguar: ${new Date(campaign.sentDate).toLocaleDateString('sq-AL')}`}
                    {campaign.scheduledDate && `Planifikuar: ${new Date(campaign.scheduledDate).toLocaleDateString('sq-AL')}`}
                    {campaign.status === 'draft' && `Krijuar: ${new Date(campaign.createdAt).toLocaleDateString('sq-AL')}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Eye size={16} />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(campaign.id)}
                        className="text-purple-600 hover:text-purple-800 text-xs"
                      >
                        Kopjo
                      </button>
                      <button 
                        onClick={() => handleDelete(campaign.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="p-12 text-center">
            <Mail size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Nuk u gjetën fushata</p>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Krijo Email Campaign</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emri i kampanjës *
                </label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="p.sh. Newsletter Javor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="p.sh. Produktet e reja të javës!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Përmbajtja e email-it *
                </label>
                <textarea
                  value={newCampaign.content}
                  onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Shkruani përmbajtjen e email-it..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email adresat (të ndara me presje) *
                </label>
                <textarea
                  value={newCampaign.recipients}
                  onChange={(e) => setNewCampaign({...newCampaign, recipients: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="test@example.com, user2@test.com, ..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Anulo
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Duke dërguar...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Dërgo Campaign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
