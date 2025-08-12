'use client'

import { useState, useEffect } from 'react'
import { Settings, Key, Eye, EyeOff, Save, Plus, Trash2, Shield, Mail, CreditCard, Bot, Share2, Copy, Check, RefreshCw, Search, Filter, BarChart3 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AdminSetting {
  key: string
  value: string
  category: string
  description: string | null
  isEncrypted: boolean
  updatedAt: Date
}

interface NewSetting {
  key: string
  value: string
  category: string
  description: string
}

const CATEGORIES = {
  smtp: { name: 'Email SMTP', icon: Mail, color: 'green', description: 'Konfigurimet për dërgimin e email-ave përmes SMTP' },
  stripe: { name: 'Stripe Payment', icon: CreditCard, color: 'purple', description: 'Konfigurimet për pagesën Stripe' },
  facebook: { name: 'Facebook Ads', icon: Share2, color: 'blue', description: 'Konfigurimet për Facebook Marketing API' },
  openai: { name: 'OpenAI', icon: Bot, color: 'orange', description: 'Konfigurimet për OpenAI API dhe AI' },
  system: { name: 'System', icon: Settings, color: 'gray', description: 'Konfigurimet e përgjithshme të sistemit' }
}

const COMMON_SETTINGS = {
  smtp: [
    { key: 'smtp_host', description: 'SMTP Server Host (p.sh. smtp.gmail.com)', defaultValue: 'smtp.gmail.com', type: 'text' },
    { key: 'smtp_port', description: 'SMTP Port (p.sh. 587 për TLS, 465 për SSL)', defaultValue: '587', type: 'number' },
    { key: 'smtp_user', description: 'SMTP Username/Email', defaultValue: '', type: 'email' },
    { key: 'smtp_password', description: 'SMTP Password ose App Password', defaultValue: '', type: 'password' },
    { key: 'smtp_secure', description: 'SMTP Security (true për SSL, false për TLS)', defaultValue: 'true', type: 'boolean' },
    { key: 'smtp_from_email', description: 'Email-i dërgues (From address)', defaultValue: '', type: 'email' },
    { key: 'smtp_from_name', description: 'Emri i dërguesit (p.sh. ProudShop Support)', defaultValue: 'ProudShop', type: 'text' }
  ],
  stripe: [
    { key: 'stripe_public_key', description: 'Stripe Publishable Key', defaultValue: '', type: 'text' },
    { key: 'stripe_secret_key', description: 'Stripe Secret Key', defaultValue: '', type: 'password' },
    { key: 'stripe_webhook_secret', description: 'Stripe Webhook Secret', defaultValue: '', type: 'password' }
  ],
  facebook: [
    { key: 'facebook_app_id', description: 'Facebook App ID për integrim', defaultValue: '', type: 'text' },
    { key: 'facebook_app_secret', description: 'Facebook App Secret', defaultValue: '', type: 'password' },
    { key: 'facebook_access_token', description: 'Facebook Access Token për API', defaultValue: '', type: 'password' },
    { key: 'facebook_ad_account_id', description: 'ID i llogarisë së reklamave', defaultValue: '', type: 'text' }
  ],
  openai: [
    { key: 'openai_api_key', description: 'OpenAI API Key për GPT dhe DALL-E', defaultValue: '', type: 'password' },
    { key: 'openai_organization', description: 'OpenAI Organization ID (opsional)', defaultValue: '', type: 'text' }
  ],
  system: [
    { key: 'app_name', description: 'Emri i aplikacionit', defaultValue: 'ProudShop', type: 'text' },
    { key: 'app_url', description: 'URL e aplikacionit', defaultValue: 'https://proudshop.com', type: 'text' },
    { key: 'maintenance_mode', description: 'Moda e mirëmbajtjes', defaultValue: 'false', type: 'boolean' }
  ]
}

export default function ApiSettingsPage() {
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [newSetting, setNewSetting] = useState<NewSetting>({
    key: '',
    value: '',
    category: 'system',
    description: ''
  })
  const [openAIKeyMasked, setOpenAIKeyMasked] = useState<string | null>(null)
  const [openAIKeyExists, setOpenAIKeyExists] = useState<boolean>(false)
  const [smtpCheck, setSmtpCheck] = useState<any | null>(null)
  const [checkingSmtp, setCheckingSmtp] = useState(false)
  const [authMatrix, setAuthMatrix] = useState<any | null>(null)
  const [loadingMatrix, setLoadingMatrix] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchOpenAIKeyMeta()
  }, [])

  const fetchOpenAIKeyMeta = async () => {
    try {
      const res = await fetch('/api/admin/openai/key', { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } })
      if (res.ok) {
        const j = await res.json()
        setOpenAIKeyExists(Boolean(j.exists))
        setOpenAIKeyMasked(j.masked && j.last4 ? `••••••••••••${j.last4}` : null)
      }
    } catch {}
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setSettings(data.settings || [])
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Gabim në ngarkimin e konfigurimit')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    setSaving(key)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ key, value })
      })

      if (!response.ok) {
        throw new Error('Failed to update setting')
      }

      await fetchSettings()
      setEditValues(prev => ({ ...prev, [key]: '' }))
      toast.success('Konfigurimi u përditësua me sukses!')
    } catch (error) {
      console.error('Error updating setting:', error)
      toast.error('Gabim në përditësimin e konfigurimit')
    } finally {
      setSaving(null)
    }
  }

  const deleteSetting = async (key: string) => {
    if (!confirm('A jeni të sigurt që doni të fshini këtë konfigurimi?')) return

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ key })
      })

      if (!response.ok) {
        throw new Error('Failed to delete setting')
      }

      await fetchSettings()
      toast.success('Konfigurimi u fshi me sukses!')
    } catch (error) {
      console.error('Error deleting setting:', error)
      toast.error('Gabim në fshirjen e konfigurimit')
    }
  }

  const createAllSMTPSettings = async () => {
    // Get all SMTP values from the form
    const smtpHost = (document.getElementById('smtp_host') as HTMLInputElement)?.value
    const smtpPort = (document.getElementById('smtp_port') as HTMLInputElement)?.value
    const smtpUser = (document.getElementById('smtp_user') as HTMLInputElement)?.value
    const smtpPassword = (document.getElementById('smtp_password') as HTMLInputElement)?.value
    const smtpFromEmail = (document.getElementById('smtp_from_email') as HTMLInputElement)?.value
    const smtpFromName = (document.getElementById('smtp_from_name') as HTMLInputElement)?.value
    const smtpSecure = (document.getElementById('smtp_secure') as HTMLInputElement)?.checked

    // Validate required fields
    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
      toast.error('Ju lutemi plotësoni fushat e kërkuara (Host, Port, Username, Password)')
      return
    }

    try {
      // Prepare all SMTP settings
      const smtpSettings = [
        { key: 'smtp_host', value: smtpHost, description: 'SMTP Server Host' },
        { key: 'smtp_port', value: smtpPort, description: 'SMTP Port' },
        { key: 'smtp_user', value: smtpUser, description: 'SMTP Username/Email' },
        { key: 'smtp_password', value: smtpPassword, description: 'SMTP Password' },
        { key: 'smtp_secure', value: smtpSecure ? 'true' : 'false', description: 'SMTP Security (TLS/SSL)' }
      ]

      // Add optional fields if provided
      if (smtpFromEmail) {
        smtpSettings.push({ key: 'smtp_from_email', value: smtpFromEmail, description: 'Email dërgues' })
      }
      if (smtpFromName) {
        smtpSettings.push({ key: 'smtp_from_name', value: smtpFromName, description: 'Emri i dërguesit' })
      }

      // Save all settings
      for (const setting of smtpSettings) {
        const response = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({
            key: setting.key,
            value: setting.value,
            category: 'smtp',
            description: setting.description
          })
        })

        if (!response.ok) {
          throw new Error(`Failed to save ${setting.key}`)
        }
      }

      await fetchSettings()
      setIsAddModalOpen(false)
      toast.success(`🎉 Të gjitha konfigurimet SMTP u ruajtën me sukses! (${smtpSettings.length} konfigurime)`)
    } catch (error) {
      console.error('Error saving SMTP settings:', error)
      toast.error('❌ Gabim në ruajtjen e konfigurimit SMTP')
    }
  }

  const createSetting = async () => {
    if (!newSetting.key || !newSetting.value) {
      toast.error('Ju lutemi plotësoni të gjitha fushat e kërkuara')
      return
    }

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          key: newSetting.key,
          value: newSetting.value,
          category: newSetting.category,
          description: newSetting.description
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create setting')
      }

      await fetchSettings()
      setNewSetting({ key: '', value: '', category: 'system', description: '' })
      setIsAddModalOpen(false)
      toast.success('Konfigurimi u krijua me sukses!')
    } catch (error) {
      console.error('Error creating setting:', error)
      toast.error('Gabim në krijimin e konfigurimit')
    }
  }

  const saveOpenAIKey = async () => {
    const val = (document.getElementById('openai_api_key_input') as HTMLInputElement)?.value || ''
    if (!val) { toast.error('Vendosni OPENAI_API_KEY'); return }
    try {
      const res = await fetch('/api/admin/openai/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ key: 'OPENAI_API_KEY', value: val })
      })
      if (!res.ok) throw new Error('Fail')
      toast.success('OPENAI_API_KEY u ruajt!')
      ;(document.getElementById('openai_api_key_input') as HTMLInputElement).value = ''
      fetchOpenAIKeyMeta(); fetchSettings()
    } catch {
      toast.error('Gabim në ruajtjen e OPENAI_API_KEY')
    }
  }

  const quickSetup = async (category: string, key: string) => {
    const setting = COMMON_SETTINGS[category as keyof typeof COMMON_SETTINGS]?.find(s => s.key === key)
    if (!setting) return
    
    const value = window.prompt(`Vendosni vlerën për ${setting.key}:`, setting.defaultValue || '')
    if (value === null) return
    
    try {
      setSaving(setting.key)
      // Include auth + category so backend can store properly.
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({
          key: setting.key,
          value,
            category,
          isEncrypted: setting.type === 'password',
          description: setting.description
        })
      })
      
      if (!response.ok) throw new Error('Gabim në ruajtje')
      
      await fetchSettings()
      toast.success(`✅ ${setting.key} u shtua me sukses!`)
    } catch (error) {
      toast.error('❌ Gabim në shtimin e konfigurimit')
    } finally {
      setSaving('')
    }
  }

  const runSmtpCheck = async () => {
    setCheckingSmtp(true)
    setSmtpCheck(null)
    try {
      const res = await fetch('/api/admin/marketing/emails?check=1', { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } })
      const data = await res.json()
      setSmtpCheck({ status: res.status, data })
      if (data?.ok) toast.success('SMTP konfigurimi duket në rregull (credentials të pranishme).')
      else toast.error('SMTP jo i plotë ose problem. Shikoni diagnostikimin poshtë.')
    } catch (e) {
      toast.error('Gabim gjatë kontrollit SMTP')
    } finally {
      setCheckingSmtp(false)
    }
  }

  const runAuthMatrix = async () => {
    setLoadingMatrix(true)
    setAuthMatrix(null)
    try {
      const res = await fetch('/api/admin/marketing/emails?authMatrix=1', { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` } })
      const data = await res.json()
      setAuthMatrix({ status: res.status, data })
      if (data?.attempts) {
        const success = data.attempts.find((a: any) => a.success)
        success ? toast.success('U gjet një strategji e suksesshme') : toast.error('Asnjë strategji nuk funksionoi')
      }
    } catch {
      toast.error('Gabim në Auth Matrix')
    } finally {
      setLoadingMatrix(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKeys(prev => ({ ...prev, [key]: true }))
      toast.success('U kopjua në clipboard!')
      setTimeout(() => {
        setCopiedKeys(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      toast.error('Gabim në kopjim')
    }
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getButtonColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      green: 'bg-green-600 hover:bg-green-700',
      orange: 'bg-orange-600 hover:bg-orange-700',
      gray: 'bg-gray-600 hover:bg-gray-700'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const filteredSettings = settings.filter(setting => {
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (setting.description && setting.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const groupedSettings = filteredSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, AdminSetting[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Duke ngarkuar konfigurimin...</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center">
              <Settings className="h-10 w-10 mr-4" />
              API & Integration Management
            </h1>
            <p className="text-blue-100 text-lg">Menaxhoni të gjitha API-të dhe integrimet tuaja nga një vend</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{settings.length}</div>
            <div className="text-blue-100">Total Konfigurime</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {Object.entries(CATEGORIES).map(([key, category]) => {
          const Icon = category.icon
          const categorySettings = settings.filter(s => s.category === key)
          const hasConfigured = categorySettings.length > 0
          const isComplete = categorySettings.length >= (COMMON_SETTINGS[key as keyof typeof COMMON_SETTINGS]?.length || 1)
          
          return (
            <div key={key} className={`relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer ${getColorClasses(category.color)}`}
                 onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}>
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8" />
                <div className="flex items-center space-x-2">
                  {hasConfigured && (
                    <div className={`w-3 h-3 rounded-full ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  )}
                  <span className="text-sm font-bold">{categorySettings.length}</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-2">{category.name}</h3>
              <p className="text-sm opacity-75 mb-3">{category.description}</p>
              
              {/* Status indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">
                  {isComplete ? '✅ I konfiguruar' : hasConfigured ? '⚠️ Pjesërisht' : '❌ Pa konfiguruar'}
                </span>
                <span className="text-xs opacity-60">
                  {categorySettings.length}/{COMMON_SETTINGS[key as keyof typeof COMMON_SETTINGS]?.length || 0}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 bg-white/20 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-400' : hasConfigured ? 'bg-yellow-400' : 'bg-gray-300'}`}
                  style={{ width: `${Math.min((categorySettings.length / (COMMON_SETTINGS[key as keyof typeof COMMON_SETTINGS]?.length || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Kërkoni konfigurime, çelësa ose përshkrime..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </div>
              </div>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="all">🌐 Të gjitha kategoritë</option>
              {Object.entries(CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.name} ({settings.filter(s => s.category === key).length})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => fetchSettings()}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center font-medium"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Rifresko
            </button>
            <button
              onClick={runSmtpCheck}
              disabled={checkingSmtp}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center font-medium disabled:opacity-50"
            >
              {checkingSmtp ? <RefreshCw className="h-4 w-4 mr-2 animate-spin"/> : <Mail className="h-4 w-4 mr-2"/>}
              Testo SMTP
            </button>
            <button
              onClick={runAuthMatrix}
              disabled={loadingMatrix}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center font-medium disabled:opacity-50"
            >
              {loadingMatrix ? <RefreshCw className="h-4 w-4 mr-2 animate-spin"/> : <Shield className="h-4 w-4 mr-2"/>}
              Auth Matrix
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all flex items-center font-medium shadow-lg"
            >
              <Mail className="h-4 w-4 mr-2" />
              Konfiguro SMTP
            </button>
          </div>
        </div>
        {smtpCheck && (
          <div className="mt-4 p-4 rounded-xl border bg-gray-50 text-sm font-mono overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">SMTP Diagnostics</span>
              <button onClick={() => setSmtpCheck(null)} className="text-xs text-gray-500 hover:text-gray-700">Mbyll</button>
            </div>
            <pre className="whitespace-pre-wrap leading-snug">{JSON.stringify(smtpCheck.data, null, 2)}</pre>
            <div className="mt-2 text-xs text-gray-600">
              {smtpCheck.data?.config?.port && `Port: ${smtpCheck.data.config.port} | Secure: ${smtpCheck.data.config.secure}`}
              <div className="mt-1">Sugjerim: Gmail 587 -&gt; smtp_secure false (STARTTLS) ose përdorni App Password me 2FA.</div>
            </div>
          </div>
        )}
        {authMatrix && (
          <div className="mt-4 p-4 rounded-xl border bg-white text-sm overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">SMTP Auth Matrix</span>
              <button onClick={() => setAuthMatrix(null)} className="text-xs text-gray-500 hover:text-gray-700">Mbyll</button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {authMatrix.data?.attempts?.map((a: any) => (
                <div key={a.name} className={`p-3 rounded-lg border text-xs ${a.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="font-mono font-semibold">{a.name}</div>
                  <div>mode: {a.mode}{a.starttls ? '+STARTTLS' : ''}</div>
                  <div>port: {a.port}</div>
                  <div>success: {a.success ? '✅' : '❌'}</div>
                  {!a.success && <div className="mt-1 text-[10px] text-red-700 break-all">{a.error}</div>}
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-600">{authMatrix.data?.hint}</div>
          </div>
        )}
        
        {/* Filter indicators */}
        {(selectedCategory !== 'all' || searchTerm) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                📁 {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.name}
                <button onClick={() => setSelectedCategory('all')} className="ml-2 hover:text-blue-600">✕</button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                🔍 &quot;{searchTerm}&quot;
                <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-green-600">✕</button>
              </span>
            )}
            <span className="text-sm text-gray-500">
              {filteredSettings.length} rezultate
            </span>
          </div>
        )}
      </div>

      {/* Settings List */}
      <div className="space-y-8">
        {/* OpenAI quick card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-8 py-6 border-l-8 bg-orange-50 border-orange-200 text-orange-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 mr-4"><Bot className="h-6 w-6"/></div>
                <div>
                  <div className="font-bold text-lg">OpenAI (ChatGPT)</div>
                  <div className="text-sm opacity-75">Vendosni OPENAI_API_KEY për të përdorur AI (gjenerimi i emaileve, imazheve)</div>
                </div>
              </div>
              <div className="text-sm">
                {openAIKeyExists ? <span className="text-green-700">✅ Çelësi ekziston</span> : <span className="text-red-600">❌ Pa çelës</span>}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">OPENAI_API_KEY</label>
                <input id="openai_api_key_input" type="password" placeholder={openAIKeyMasked || 'sk-...'} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                {openAIKeyMasked && <div className="text-xs text-gray-500 mt-1">Aktuale: {openAIKeyMasked}</div>}
              </div>
              <div className="flex gap-2">
                <button onClick={saveOpenAIKey} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center">
                  <Save className="h-4 w-4 mr-2"/> Ruaj
                </button>
                {openAIKeyExists && (
                  <button onClick={() => copyToClipboard(openAIKeyMasked || '', 'OPENAI_API_KEY')} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
                    <Copy className="h-4 w-4 mr-2"/> Kopjo maskuar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {Object.entries(groupedSettings).map(([category, categorySettings]) => {
          const categoryInfo = CATEGORIES[category as keyof typeof CATEGORIES]
          if (!categoryInfo) return null
          
          const Icon = categoryInfo.icon
          const isComplete = categorySettings.length >= (COMMON_SETTINGS[category as keyof typeof COMMON_SETTINGS]?.length || 1)
          
          return (
            <div key={category} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Category Header */}
              <div className={`px-8 py-6 border-l-8 ${getColorClasses(categoryInfo.color)} border-l-current`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-xl ${getColorClasses(categoryInfo.color)} mr-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold flex items-center">
                        {categoryInfo.name}
                        {isComplete && <span className="ml-3 text-green-500">✅</span>}
                      </h2>
                      <p className="text-sm opacity-75 mt-1">{categoryInfo.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-700">{categorySettings.length}</div>
                    <div className="text-sm text-gray-500">konfigurime</div>
                    
                    {/* Quick Setup Buttons */}
                    {COMMON_SETTINGS[category as keyof typeof COMMON_SETTINGS] && (
                      <div className="mt-3">
                        <p className="text-xs font-medium opacity-75 mb-2">Konfigurim i shpejtë:</p>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {COMMON_SETTINGS[category as keyof typeof COMMON_SETTINGS]
                            .filter(setting => !categorySettings.find(cs => cs.key === setting.key))
                            .slice(0, 3)
                            .map((setting) => (
                            <button
                              key={setting.key}
                              onClick={() => quickSetup(category, setting.key)}
                              className={`px-3 py-1 text-xs rounded-full text-white ${getButtonColorClasses(categoryInfo.color)} transition-all hover:scale-105`}
                              title={setting.description}
                            >
                              + {setting.key.replace(`${category}_`, '').replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Settings Items */}
              <div className="divide-y divide-gray-100">
                {categorySettings.map((setting, index) => (
                  <div key={setting.key} className={`p-8 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-all`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Setting Header */}
                        <div className="flex items-center mb-4">
                          <div className="flex items-center bg-white rounded-lg px-3 py-2 shadow-sm border">
                            <Key className="h-4 w-4 mr-2 text-gray-500" />
                            <code className="text-sm font-mono font-semibold text-gray-800">
                              {setting.key}
                            </code>
                          </div>
                          
                          <div className="ml-4 flex items-center space-x-2">
                            {setting.isEncrypted && (
                              <div title="Të dhënat janë të enkriptuara" className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Encrypted
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                              Përditësuar: {new Date(setting.updatedAt).toLocaleDateString('sq-AL')}
                            </div>
                          </div>
                        </div>
                        
                        {/* Description */}
                        {setting.description && (
                          <div className="bg-blue-50 border-l-4 border-blue-300 p-3 mb-4 rounded-r-lg">
                            <p className="text-blue-800 text-sm">{setting.description}</p>
                          </div>
                        )}
                        
                        {/* Value Input */}
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 relative">
                            <input
                              type={showValues[setting.key] ? 'text' : 'password'}
                              value={editValues[setting.key] !== undefined ? editValues[setting.key] : setting.value}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono text-sm"
                              placeholder="Vendosni vlerën..."
                            />
                            {(editValues[setting.key] !== undefined && editValues[setting.key] !== setting.value) && (
                              <div className="absolute -top-2 -right-2">
                                <span className="bg-yellow-400 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                  Ka ndryshime
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setShowValues(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                              title={showValues[setting.key] ? 'Fshih vlerën' : 'Shfaq vlerën'}
                            >
                              {showValues[setting.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            
                            <button
                              onClick={() => copyToClipboard(setting.value, setting.key)}
                              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                              title="Kopjo në clipboard"
                            >
                              {copiedKeys[setting.key] ? 
                                <Check className="h-4 w-4 text-green-600" /> : 
                                <Copy className="h-4 w-4" />
                              }
                            </button>
                            
                            <button
                              onClick={() => updateSetting(setting.key, editValues[setting.key] !== undefined ? editValues[setting.key] : setting.value)}
                              disabled={saving === setting.key}
                              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium transition-all shadow-lg hover:shadow-xl"
                            >
                              {saving === setting.key ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                  Duke ruajtur...
                                </>
                              ) : (
                                <>
                                  <Save className="h-4 w-4 mr-2" />
                                  Ruaj
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => deleteSetting(setting.key)}
                              className="p-3 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl transition-all"
                              title="Fshi konfigurimin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Empty State for Category */}
                {categorySettings.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <Icon className="h-16 w-16 mx-auto opacity-50" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Asnjë konfigurimi për {categoryInfo.name}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Filloni duke shtuar konfigurime të reja për këtë kategori
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className={`px-6 py-3 text-white rounded-xl transition-all ${getButtonColorClasses(categoryInfo.color)}`}
                    >
                      <Plus className="h-4 w-4 mr-2 inline" />
                      Shtoni të parën
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        
        {/* Global Empty State */}
        {Object.keys(groupedSettings).length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <div className="text-gray-400 mb-6">
              <Settings className="h-24 w-24 mx-auto opacity-50" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' ? 'Asnjë rezultat' : 'Asnjë konfigurimi'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Provojni me kritere të tjera kërkimi ose filtri'
                : 'Filloni duke shtuar konfigurimet e para për API-të tuaja'
              }
            </p>
            <div className="flex justify-center space-x-4">
              {(searchTerm || selectedCategory !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all') }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Pastro filtrat
                </button>
              )}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all"
              >
                <Mail className="h-4 w-4 mr-2 inline" />
                Konfiguro SMTP
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add New Setting Modal - SMTP BULK SETUP */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Konfigurimi SMTP</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  📧 Vendosni të gjitha konfigurimet SMTP njëherësh. Lini bosh nëse nuk keni nevojë për disa nga to.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* SMTP Host */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    id="smtp_host"
                  />
                </div>

                {/* SMTP Port */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    placeholder="587"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    id="smtp_port"
                  />
                </div>

                {/* SMTP Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Username/Email *
                  </label>
                  <input
                    type="email"
                    placeholder="your-email@gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    id="smtp_user"
                  />
                </div>

                {/* SMTP Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Password *
                  </label>
                  <input
                    type="password"
                    placeholder="password ose app password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    id="smtp_password"
                  />
                </div>

                {/* From Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Email
                  </label>
                  <input
                    type="email"
                    placeholder="noreply@proudshop.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    id="smtp_from_email"
                  />
                </div>

                {/* From Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Name
                  </label>
                  <input
                    type="text"
                    placeholder="ProudShop Support"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    id="smtp_from_name"
                  />
                </div>
              </div>

              {/* Security Option */}
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="smtp_secure"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Përdor TLS/SSL (rekomandohet)</span>
                </label>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Anulo
                </button>
                <button
                  onClick={createAllSMTPSettings}
                  className="flex-1 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📧 Ruaj të gjitha SMTP konfigurimet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
