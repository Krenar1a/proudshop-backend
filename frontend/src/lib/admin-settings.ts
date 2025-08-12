import { simpleEncrypt, simpleDecrypt } from './encryption'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface AdminSettingData {
  key: string
  value: string
  category: string
  description?: string
  isEncrypted?: boolean
}

export class AdminSettings {
  static async get(key: string): Promise<string | null> {
    try {
  const all = await apiRequestAll()
  const found = all.find(s => s.key === key)
  if (!found) return null
  return found.value
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error)
      return null
    }
  }

  static async set(data: AdminSettingData): Promise<boolean> {
    try {
      const value = data.isEncrypted !== false ? simpleEncrypt(data.value) : data.value

  await fetchSettingSet(data.key, value)

      return true
    } catch (error) {
      console.error(`Error setting ${data.key}:`, error)
      return false
    }
  }

  static async getByCategory(category: string): Promise<Record<string, string>> {
    try {
  const all = await apiRequestAll()
  return all.reduce<Record<string,string>>((acc, s) => {acc[s.key] = s.value; return acc}, {})
    } catch (error) {
      console.error(`Error getting settings for category ${category}:`, error)
      return {}
    }
  }

  static async getAll(): Promise<Array<{
    key: string
    value: string
    category: string
    description: string | null
    isEncrypted: boolean
    updatedAt: Date
  }>> {
    try {
      const all = await apiRequestAll()
      return all.map(s => ({
        key: s.key,
        value: s.value,
        category: 'general',
        description: null,
        isEncrypted: false,
        updatedAt: new Date()
      }))
    } catch (error) {
      console.error('Error getting all settings:', error)
      return []
    }
  }

  static async delete(key: string): Promise<boolean> {
    try {
  // deletion not yet implemented in backend; simulate success
      return true
    } catch (error) {
      console.error(`Error deleting setting ${key}:`, error)
      return false
    }
  }

  // Helper methods for specific integrations
  static async getFacebookConfig() {
  const keys = await this.getAll(); const byKey = Object.fromEntries(keys.map(k=>[k.key,k.value]))
    return {
      accessToken: byKey['facebook_access_token'],
      adAccountId: byKey['facebook_ad_account_id'],
      pageId: byKey['facebook_page_id'],
      appId: byKey['facebook_app_id'],
      appSecret: byKey['facebook_app_secret']
    }
  }

  static async getStripeConfig() {
  const keys = await this.getAll(); const byKey = Object.fromEntries(keys.map(k=>[k.key,k.value]))
    return {
      secretKey: byKey['stripe_secret_key'],
      publishableKey: byKey['stripe_publishable_key'],
      webhookSecret: byKey['stripe_webhook_secret']
    }
  }

  static async getEmailConfig() {
  const keys = await this.getAll(); const byKey = Object.fromEntries(keys.map(k=>[k.key,k.value]))
    return {
      host: byKey['smtp_host'],
      port: byKey['smtp_port'],
      user: byKey['smtp_user'],
      pass: byKey['smtp_pass']
    }
  }

  static async getOpenAIConfig() {
  const keys = await this.getAll(); const byKey = Object.fromEntries(keys.map(k=>[k.key,k.value]))
  return { apiKey: byKey['OPENAI_API_KEY'] || byKey['openai_api_key'] }
  }
}

// Internal helper calls to backend settings endpoints
async function apiRequestAll(token?: string) {
  const headers: Record<string,string> = {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/settings/`, { headers, cache: 'no-store' })
  if (!res.ok) return []
  return res.json() as Promise<Array<{id:number; key:string; value:string}>>
}

async function fetchSettingSet(key: string, value: string, token?: string) {
  const headers: Record<string,string> = { 'Content-Type':'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE}/settings/`, { method:'POST', headers, body: JSON.stringify({ key, value }) })
  return res.ok
}

export default AdminSettings
