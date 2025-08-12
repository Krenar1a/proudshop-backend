'use client'

import { useState, useEffect } from 'react'
import { Facebook, TrendingUp, Eye, MousePointer, DollarSign, Users, Sparkles, Target, BarChart3, Settings, Play, Pause, Edit, Trash2, Plus, Shield, User } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Product {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  category?: string
}

interface FacebookAccount {
  id: string
  name: string
  accountId: string
  accessToken: string
  pageId: string
  isActive: boolean
  assignedAdmins: string[]
  createdBy: string
  createdAt: string
  lastUsed?: string
  totalSpent: number
  activeCampaigns: number
}

interface FacebookCampaign {
  id: string
  name: string
  objective: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT'
  budget: number
  dailyBudget: number
  targetAudience: string
  productId?: string
  productName?: string
  adText: string
  adHeadline: string
  startDate: string
  endDate?: string
  impressions: number
  clicks: number
  conversions: number
  spent: number
  ctr: number
  cpc: number
  roas: number
  createdBy: string
  createdByName?: string
  createdAt: string
  canEdit?: boolean
  facebookAccountId: string
  facebookAccountName?: string
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  campaignCount: number
  totalSpent: number
  permissions: string[]
  assignedFacebookAccounts: string[]
}

export default function FacebookAdsPage() {
  const [campaigns, setCampaigns] = useState<FacebookCampaign[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [facebookAccounts, setFacebookAccounts] = useState<FacebookAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('campaigns')
  const [userRole, setUserRole] = useState<string>('')
  const [currentUserId, setCurrentUserId] = useState<string>('')
  
  // Create Campaign Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedFacebookAccount, setSelectedFacebookAccount] = useState('')
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: 'CONVERSIONS',
    budget: 50,
    dailyBudget: 10,
    targetAudience: 'adults_18_65_albania_kosovo',
    duration: 7,
    adText: '',
    adHeadline: '',
    facebookAccountId: ''
  })

  // Facebook Account Management states
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<FacebookAccount | null>(null)
  const [accountData, setAccountData] = useState({
    name: '',
    accountId: '',
    accessToken: '',
    pageId: ''
  })

  // AI Suggestions states
  const [showAISuggestions, setShowAISuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<{
    headlines: string[]
    descriptions: string[]
    audiences: string[]
    budgetRecommendation: number
  } | null>(null)

  // Admin Management states
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null)
  const [adminPermissions, setAdminPermissions] = useState<string[]>([])

  useEffect(() => {
    checkUserRole()
    fetchCampaigns()
    fetchProducts()
    fetchFacebookAccounts()
  }, [])

  useEffect(() => {
    if (userRole === 'SUPER_ADMIN') {
      fetchAdminUsers()
    }
  }, [userRole])

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/admin/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.admin.role)
        setCurrentUserId(data.admin.id)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/marketing/facebook-ads', {
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

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchFacebookAccounts = async () => {
    try {
      const response = await fetch('/api/admin/marketing/facebook-ads/accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setFacebookAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error('Error fetching Facebook accounts:', error)
    }
  }

  const createFacebookAccount = async () => {
    if (!accountData.name || !accountData.accountId || !accountData.accessToken || !accountData.pageId) {
      toast.error('Të gjitha fushat janë të detyrueshme')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/marketing/facebook-ads/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(accountData)
      })

      if (response.ok) {
        toast.success('Facebook account u shtua me sukses!')
        setShowAccountModal(false)
        setAccountData({ name: '', accountId: '', accessToken: '', pageId: '' })
        fetchFacebookAccounts()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gabim në shtimin e Facebook account')
      }
    } catch (error) {
      toast.error('Gabim në komunikim me serverin')
    } finally {
      setLoading(false)
    }
  }

  const assignAdminToAccount = async (accountId: string, adminIds: string[]) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/marketing/facebook-ads/accounts/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ accountId, adminIds })
      })

      if (response.ok) {
        toast.success('Adminat u caktuan me sukses!')
        setShowAssignModal(false)
        fetchFacebookAccounts()
        fetchAdminUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Gabim në caktimin e adminave')
      }
    } catch (error) {
      toast.error('Gabim në komunikim me serverin')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('/api/admin/facebook-ads/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAdminUsers(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching admin users:', error)
    }
  }

  const generateAISuggestions = async () => {
    if (!selectedProduct) {
      toast.error('Zgjidhni një produkt')
      return
    }

    setLoading(true)
    try {
      const product = products.find(p => p.id === selectedProduct)
      const response = await fetch('/api/admin/ai/facebook-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          product,
          objective: campaignData.objective,
          budget: campaignData.budget
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAiSuggestions(data.suggestions)
        setShowAISuggestions(true)
        toast.success('AI suggestions u gjeneruan!')
      } else {
        toast.error(data.error || 'Gabim në gjenerimin e suggestions')
      }
    } catch (error) {
      toast.error('Gabim në gjenerimin e suggestions')
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async () => {
    if (!campaignData.name || !selectedProduct) {
      toast.error('Plotësoni të gjitha fushat e detyrueshme')
      return
    }

    setLoading(true)
    try {
      const product = products.find(p => p.id === selectedProduct)
      const response = await fetch('/api/admin/marketing/facebook-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...campaignData,
          productId: selectedProduct,
          productName: product?.name
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Facebook campaign u krijua!')
        setShowCreateModal(false)
        fetchCampaigns()
        resetForm()
      } else {
        toast.error(data.error || 'Gabim në krijimin e campaign')
      }
    } catch (error) {
      toast.error('Gabim në krijimin e campaign')
    } finally {
      setLoading(false)
    }
  }

  const toggleCampaignStatus = async (campaignId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    
    try {
      const response = await fetch(`/api/admin/marketing/facebook-ads/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        toast.success(`Campaign ${newStatus === 'ACTIVE' ? 'aktivizuar' : 'pauzuar'}`)
        fetchCampaigns()
      } else {
        toast.error('Gabim në ndryshimin e statusit')
      }
    } catch (error) {
      toast.error('Gabim në ndryshimin e statusit')
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Jeni të sigurt që dëshironi të fshini këtë campaign?')) return

    try {
      const response = await fetch(`/api/admin/marketing/facebook-ads/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      if (response.ok) {
        toast.success('Campaign u fshi!')
        fetchCampaigns()
      } else {
        toast.error('Gabim në fshirjen e campaign')
      }
    } catch (error) {
      toast.error('Gabim në fshirjen e campaign')
    }
  }

  const updateAdminPermissions = async () => {
    if (!selectedAdmin) return

    try {
      const response = await fetch(`/api/admin/facebook-ads/users/${selectedAdmin.id}/permissions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ permissions: adminPermissions })
      })

      if (response.ok) {
        toast.success('Permissions u përditësuan!')
        setShowPermissionsModal(false)
        fetchAdminUsers()
      } else {
        toast.error('Gabim në përditësimin e permissions')
      }
    } catch (error) {
      toast.error('Gabim në përditësimin e permissions')
    }
  }

  const resetForm = () => {
    setCampaignData({
      name: '',
      objective: 'CONVERSIONS',
      budget: 50,
      dailyBudget: 10,
      targetAudience: 'adults_18_65_albania_kosovo',
      duration: 7,
      adText: '',
      adHeadline: '',
      facebookAccountId: ''
    })
    setSelectedProduct('')
    setSelectedFacebookAccount('')
    setAiSuggestions(null)
    setShowAISuggestions(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
      case 'ADMIN': return 'bg-blue-100 text-blue-800'
      case 'MANAGER': return 'bg-green-100 text-green-800'
      case 'STAFF': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const totalStats = campaigns.reduce((acc, campaign) => ({
    impressions: acc.impressions + campaign.impressions,
    clicks: acc.clicks + campaign.clicks,
    conversions: acc.conversions + campaign.conversions,
    spent: acc.spent + campaign.spent
  }), { impressions: 0, clicks: 0, conversions: 0, spent: 0 })

  const avgCTR = totalStats.impressions > 0 ? (totalStats.clicks / totalStats.impressions * 100) : 0
  const avgCPC = totalStats.clicks > 0 ? (totalStats.spent / totalStats.clicks) : 0
  const avgROAS = totalStats.spent > 0 ? (totalStats.conversions * 50 / totalStats.spent) : 0

  // For demo purposes, allow all users to create campaigns if no role is set
  const canCreateCampaigns = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN' || userRole === '' || !userRole
  const canManageAllCampaigns = userRole === 'SUPER_ADMIN'
  const canViewAdminStats = userRole === 'SUPER_ADMIN'

  console.log('Current userRole:', userRole, 'canCreateCampaigns:', canCreateCampaigns)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Facebook className="mr-3 text-blue-600" size={28} />
            Facebook Ads Manager
          </h1>
          <p className="text-gray-600">Menaxhoni campaignet tuaja të Facebook Ads me AI assistance</p>
        </div>
        
        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-2">
          User Role: {userRole || 'Loading...'} | Can Create: {canCreateCampaigns ? 'Yes' : 'No'}
        </div>
        
        {canCreateCampaigns && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Krijo Campaign</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'campaigns'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Facebook size={16} className="inline mr-2" />
            Campaigns
          </button>
          
          {canManageAllCampaigns && (
            <button
              onClick={() => setActiveTab('facebook-accounts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'facebook-accounts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings size={16} className="inline mr-2" />
              Facebook Accounts
            </button>
          )}
          
          {canViewAdminStats && (
            <button
              onClick={() => setActiveTab('admin-management')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admin-management'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={16} className="inline mr-2" />
              Admin Management
            </button>
          )}
          
          {canViewAdminStats && (
            <button
              onClick={() => setActiveTab('admin-stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admin-stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield size={16} className="inline mr-2" />
              Statistics
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'campaigns' && (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.impressions.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MousePointer className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.clicks.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">CTR: {avgCTR.toFixed(2)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversions</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.conversions}</p>
                  <p className="text-xs text-gray-500">ROAS: {avgROAS.toFixed(2)}x</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">€{totalStats.spent.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">CPC: €{avgCPC.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Campaigns</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.productName}</div>
                          <div className="text-xs text-gray-400">{campaign.objective}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>€{campaign.budget} total</div>
                        <div className="text-xs text-gray-500">€{campaign.dailyBudget}/day</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Impressions:</span>
                            <span className="text-xs">{campaign.impressions.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Clicks:</span>
                            <span className="text-xs">{campaign.clicks}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">CTR:</span>
                            <span className="text-xs">{campaign.ctr.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">Spent:</span>
                            <span className="text-xs">€{campaign.spent.toFixed(2)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{campaign.createdByName || campaign.createdBy}</div>
                          <div className="text-xs">{new Date(campaign.createdAt).toLocaleDateString('sq-AL')}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(canManageAllCampaigns || campaign.createdBy === currentUserId) && (
                            <>
                              <button
                                onClick={() => toggleCampaignStatus(campaign.id, campaign.status)}
                                className={`p-1 rounded ${
                                  campaign.status === 'ACTIVE' 
                                    ? 'text-yellow-600 hover:bg-yellow-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={campaign.status === 'ACTIVE' ? 'Pause' : 'Play'}
                              >
                                {campaign.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
                              </button>
                              <button
                                onClick={() => deleteCampaign(campaign.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {campaigns.length === 0 && (
              <div className="p-12 text-center">
                <Facebook size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nuk ka campaigns ende</p>
                {canCreateCampaigns && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                  >
                    Krijo campaign e parë
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Facebook Accounts Tab */}
      {activeTab === 'facebook-accounts' && canManageAllCampaigns && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Facebook Accounts</h2>
              <p className="text-gray-600">Menaxhoni Facebook accounts për reklama</p>
            </div>
            <button
              onClick={() => setShowAccountModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Shto Facebook Account</span>
            </button>
          </div>

          {/* Facebook Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facebookAccounts.map((account) => (
              <div key={account.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Account ID:</span> {account.accountId}</p>
                  <p><span className="font-medium">Page ID:</span> {account.pageId}</p>
                  <p><span className="font-medium">Total Spent:</span> €{account.totalSpent}</p>
                  <p><span className="font-medium">Active Campaigns:</span> {account.activeCampaigns}</p>
                  <p><span className="font-medium">Assigned Admins:</span> {account.assignedAdmins.length}</p>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedAccount(account)
                      setShowAssignModal(true)
                    }}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 text-sm"
                  >
                    Manage Admins
                  </button>
                  <button className="flex-1 bg-gray-50 text-gray-600 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
                    Edit Account
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Management Tab */}
      {activeTab === 'admin-management' && canViewAdminStats && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Admin Management</h2>
              <p className="text-gray-600">Kontrolloni dhe menaxhoni adminat dhe Facebook access-in e tyre</p>
            </div>
          </div>

          {/* Admin Management Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Adminat dhe Facebook Account Access</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facebook Accounts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminUsers.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                          admin.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.assignedFacebookAccounts?.length || 0} accounts
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.campaignCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{admin.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAdmin(admin)
                              setShowPermissionsModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Manage Permissions
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            Assign Accounts
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin-stats' && canViewAdminStats && (
        <div className="space-y-6">
          {/* Admin Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Admin Users & Facebook Ads Permissions</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaigns Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {adminUsers.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={16} className="text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            <div className="text-sm text-gray-500">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {admin.campaignCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{admin.totalSpent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.slice(0, 2).map((permission, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {permission}
                            </span>
                          ))}
                          {admin.permissions.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              +{admin.permissions.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin)
                            setAdminPermissions(admin.permissions)
                            setShowPermissionsModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Manage Permissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Krijo Facebook Campaign të Re</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emri i Campaign
                    </label>
                    <input
                      type="text"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="p.sh. Summer Collection Campaign"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Produkti
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Zgjidhni produktin</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - €{product.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook Account
                    </label>
                    <select
                      value={selectedFacebookAccount}
                      onChange={(e) => {
                        setSelectedFacebookAccount(e.target.value)
                        setCampaignData({...campaignData, facebookAccountId: e.target.value})
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Zgjidhni Facebook Account</option>
                      {facebookAccounts
                        .filter(account => account.isActive && (
                          userRole === 'SUPER_ADMIN' || 
                          account.assignedAdmins.includes(currentUserId)
                        ))
                        .map(account => (
                          <option key={account.id} value={account.id}>
                            {account.name} (Account: {account.accountId})
                          </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Vetëm account-at që ju janë caktuar ose të gjitha nëse jeni Super Admin
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objektivi
                    </label>
                    <select
                      value={campaignData.objective}
                      onChange={(e) => setCampaignData({...campaignData, objective: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="CONVERSIONS">Conversions</option>
                      <option value="TRAFFIC">Traffic</option>
                      <option value="AWARENESS">Brand Awareness</option>
                      <option value="ENGAGEMENT">Engagement</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Total (€)
                      </label>
                      <input
                        type="number"
                        value={campaignData.budget}
                        onChange={(e) => setCampaignData({...campaignData, budget: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Budget Ditor (€)
                      </label>
                      <input
                        type="number"
                        value={campaignData.dailyBudget}
                        onChange={(e) => setCampaignData({...campaignData, dailyBudget: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="5"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Assistance Panel */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Sparkles className="mr-2 text-blue-600" size={18} />
                      AI Campaign Assistant
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Merrni sugjerime të personalizuara për campaign tuaj
                    </p>
                    <button
                      onClick={generateAISuggestions}
                      disabled={loading || !selectedProduct}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Duke gjeneruar...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Gjeneroni Sugjerime</span>
                        </>
                      )}
                    </button>
                  </div>

                  {showAISuggestions && aiSuggestions && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI Suggested Headlines
                        </label>
                        <div className="space-y-2">
                          {aiSuggestions.headlines.map((headline, index) => (
                            <button
                              key={index}
                              onClick={() => setCampaignData({...campaignData, adHeadline: headline})}
                              className="w-full text-left p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 text-sm"
                            >
                              {headline}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI Suggested Descriptions
                        </label>
                        <div className="space-y-2">
                          {aiSuggestions.descriptions.map((desc, index) => (
                            <button
                              key={index}
                              onClick={() => setCampaignData({...campaignData, adText: desc})}
                              className="w-full text-left p-2 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 text-sm"
                            >
                              {desc}
                            </button>
                          ))}
                        </div>
                      </div>

                      {aiSuggestions.budgetRecommendation && (
                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-800">
                            <strong>AI Recommendation:</strong> Budget optimal për këtë produkt: €{aiSuggestions.budgetRecommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ad Content */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={campaignData.adHeadline}
                    onChange={(e) => setCampaignData({...campaignData, adHeadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Shkruani headline tërheqës..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Text
                  </label>
                  <textarea
                    value={campaignData.adText}
                    onChange={(e) => setCampaignData({...campaignData, adText: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Shkruani përshkrimin e reklamës..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    value={campaignData.targetAudience}
                    onChange={(e) => setCampaignData({...campaignData, targetAudience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="adults_18_65_albania_kosovo">Adults 18-65 (Albania & Kosovo)</option>
                    <option value="young_adults_18_35">Young Adults 18-35</option>
                    <option value="women_25_45_fashion">Women 25-45 (Fashion Interested)</option>
                    <option value="men_20_40_shopping">Men 20-40 (Shopping Interested)</option>
                    <option value="custom">Custom Audience</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulo
              </button>
              <button
                onClick={createCampaign}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Duke krijuar...' : 'Krijo Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Permissions Modal */}
      {showPermissionsModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Manage Permissions - {selectedAdmin.name}</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {['CREATE_CAMPAIGNS', 'EDIT_CAMPAIGNS', 'DELETE_CAMPAIGNS', 'VIEW_ALL_CAMPAIGNS', 'MANAGE_BUDGETS'].map((permission) => (
                  <label key={permission} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={adminPermissions.includes(permission)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAdminPermissions([...adminPermissions, permission])
                        } else {
                          setAdminPermissions(adminPermissions.filter(p => p !== permission))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{permission.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulo
              </button>
              <button
                onClick={updateAdminPermissions}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Update Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Shto Facebook Account të Re</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emri i Account-it
                </label>
                <input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => setAccountData({...accountData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="p.sh: Proudshop Main Account"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook Account ID
                </label>
                <input
                  type="text"
                  value={accountData.accountId}
                  onChange={(e) => setAccountData({...accountData, accountId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="act_xxxxxxxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <input
                  type="password"
                  value={accountData.accessToken}
                  onChange={(e) => setAccountData({...accountData, accessToken: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="EAAG..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook Page ID
                </label>
                <input
                  type="text"
                  value={accountData.pageId}
                  onChange={(e) => setAccountData({...accountData, pageId: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="xxxxxxxxxxxxxxx"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Shënim:</strong> Access Token-i duhet të ketë lejet e duhura për menaxhimin e reklamave në Facebook.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAccountModal(false)
                  setAccountData({ name: '', accountId: '', accessToken: '', pageId: '' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulo
              </button>
              <button
                onClick={createFacebookAccount}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Duke ruajtur...' : 'Ruaj Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Admin Modal */}
      {showAssignModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Cakto Adminat për: {selectedAccount.name}
              </h3>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Zgjidhni cilët admin mund të përdorin këtë Facebook account për reklama:
                </p>

                {adminUsers.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <User size={14} className="text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                        <div className="text-xs text-gray-500">{admin.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedAccount.assignedAdmins.includes(admin.id)}
                        onChange={(e) => {
                          const updatedAccount = {
                            ...selectedAccount,
                            assignedAdmins: e.target.checked
                              ? [...selectedAccount.assignedAdmins, admin.id]
                              : selectedAccount.assignedAdmins.filter(id => id !== admin.id)
                          }
                          setSelectedAccount(updatedAccount)
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">
                        {selectedAccount.assignedAdmins.includes(admin.id) ? 'Assigned' : 'Not Assigned'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedAccount(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Anulo
              </button>
              <button
                onClick={() => assignAdminToAccount(selectedAccount.id, selectedAccount.assignedAdmins)}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
