"use client"

import { useState, useEffect } from 'react'
import { Settings, User, Mail, Save, Eye, EyeOff } from 'lucide-react'

interface StoreSettings {
  storeName: string
  contactEmail: string
  phone: string
  address: string
  description: string
  currency: string
  language: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [pwCurrent, setPwCurrent] = useState('')
  const [pwNew, setPwNew] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const tabs = [
    { id: 'general', label: 'Të përgjithshme', icon: Settings },
    { id: 'account', label: 'Llogaria', icon: User },
    { id: 'notifications', label: 'Njoftimet', icon: Mail },
    { id: 'security', label: 'Siguria', icon: Eye }
  ]

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/settings')
        if (res.ok) {
          const data = await res.json()
            const list: any[] = data.settings || []
            const findVal = (k: string, def="") => list.find(s => s.key === k)?.value || def
            setSettings({
              storeName: findVal('site_name','ProudShop'),
              contactEmail: findVal('admin_email','contact@proudshop.com'),
              phone: findVal('site_phone','+383 44 123 456'),
              address: findVal('site_address','Prishtinë, Kosovë'),
              description: findVal('site_description',''),
              currency: findVal('site_currency','EUR'),
              language: findVal('site_language','sq')
            })
        }
      } catch (e) {
        console.error('Failed to load settings', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setMessage(null)
    try {
      const pairs: Record<string,string> = {
        site_name: settings.storeName,
        admin_email: settings.contactEmail,
        site_phone: settings.phone,
        site_address: settings.address,
        site_description: settings.description,
        site_currency: settings.currency,
        site_language: settings.language
      }
      for (const key of Object.keys(pairs)) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: pairs[key] })
        })
      }
      setMessage('U ruajt me sukses')
    } catch (e) {
      setMessage('Gabim gjatë ruajtjes')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async () => {
    if (!pwCurrent || !pwNew || pwNew !== pwConfirm) {
      setMessage('Kontrollo fjalëkalimet')
      return
    }
    setPwSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: pwCurrent, new_password: pwNew })
      })
      if (res.ok) {
        setMessage('Fjalëkalimi u ndryshua')
        setPwCurrent(''); setPwNew(''); setPwConfirm('')
      } else {
        setMessage('Gabim në ndryshim')
      }
    } catch (e) {
      setMessage('Gabim rrjeti')
    } finally {
      setPwSaving(false)
    }
  }

  return (
    <div className="space-y-6 overflow-y-auto max-h-screen pr-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parametrat</h1>
        <p className="text-gray-600">Menaxho parametrat e dyqanit dhe llogarisë</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} className="mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Parametrat e përgjithshme</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emri i dyqanit</label>
                    <input type="text" value={settings?.storeName || ''} onChange={e=>setSettings(s=>s?{...s,storeName:e.target.value}:s)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email i kontaktit</label>
                    <input type="email" value={settings?.contactEmail || ''} onChange={e=>setSettings(s=>s?{...s,contactEmail:e.target.value}:s)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefoni</label>
                    <input type="tel" value={settings?.phone || ''} onChange={e=>setSettings(s=>s?{...s,phone:e.target.value}:s)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresa</label>
                    <input type="text" value={settings?.address || ''} onChange={e=>setSettings(s=>s?{...s,address:e.target.value}:s)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Përshkrimi i dyqanit</label>
                  <textarea rows={4} value={settings?.description || ''} onChange={e=>setSettings(s=>s?{...s,description:e.target.value}:s)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valuta kryesore</label>
                    <select value={settings?.currency || 'EUR'} onChange={e=>setSettings(s=>s?{...s,currency:e.target.value}:s)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="EUR">EUR (€)</option>
                      <option value="ALL">ALL (LEK)</option>
                      <option value="USD">USD ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gjuha</label>
                    <select value={settings?.language || 'sq'} onChange={e=>setSettings(s=>s?{...s,language:e.target.value}:s)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="sq">Shqip</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Parametrat e llogarisë</h2>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Ngarko foto</button>
                    <p className="text-sm text-gray-500 mt-1">JPG, PNG deri në 5MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emri</label>
                    <input type="text" defaultValue="Admin" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mbiemri</label>
                    <input type="text" defaultValue="User" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input type="email" defaultValue={settings?.contactEmail || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefoni</label>
                    <input type="tel" defaultValue={settings?.phone || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roli</label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">Super Admin</div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Parametrat e njoftimeve</h2>
                <div className="space-y-4">
                  {['Porosi të reja','Stoku i ulët','Përdorues të rinj','Raporte javore'].map((label,i)=> (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{label}</h3>
                        <p className="text-sm text-gray-500">Njoftim: {label.toLowerCase()}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-4">Metoda e njoftimit</h3>
                  <div className="space-y-3">
                    {['Email','SMS','Email dhe SMS'].map((m,i)=> (
                      <label key={i} className="flex items-center"><input type="radio" name="notification-method" defaultChecked={i===0} className="mr-3" /><span className="text-gray-700">{m}</span></label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Parametrat e sigurisë</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-4">Ndrysho fjalëkalimin</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fjalëkalimi aktual</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} value={pwCurrent} onChange={e=>setPwCurrent(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fjalëkalimi i ri</label>
                        <input type={showPassword ? 'text' : 'password'} value={pwNew} onChange={e=>setPwNew(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmo fjalëkalimin</label>
                        <input type={showPassword ? 'text' : 'password'} value={pwConfirm} onChange={e=>setPwConfirm(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t space-y-4">
              {message && <p className="text-sm text-gray-600">{message}</p>}
              <div className="flex flex-wrap gap-4">
                <button onClick={handleSave} disabled={saving || loading || !settings} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center">{saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <Save size={18} className="mr-2" />}{saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}</button>
                {activeTab === 'security' && (
                  <button onClick={handlePasswordSave} disabled={pwSaving} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center">{pwSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> : <Eye size={18} className="mr-2" />}{pwSaving ? 'Duke ndryshuar...' : 'Ndrysho Fjalëkalimin'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
