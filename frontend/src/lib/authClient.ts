const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export class AuthClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private refreshing: Promise<void> | null = null

  setTokens(access: string, refresh: string) {
    this.accessToken = access
    this.refreshToken = refresh
  }

  private async refresh() {
    if (!this.refreshToken) throw new Error('No refresh token')
    if (this.refreshing) return this.refreshing
    this.refreshing = (async () => {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      })
      if (!res.ok) throw new Error('Refresh failed')
      const data = await res.json()
      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token
      this.refreshing = null
    })()
    return this.refreshing
  }

  async fetch<T=unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const doFetch = async () => fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        'Content-Type':'application/json',
        ...(init.headers||{}),
        ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {})
      }
    })
    let res = await doFetch()
    if (res.status === 401 && this.refreshToken) {
      await this.refresh()
      res = await doFetch()
    }
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  }
}

export const authClient = new AuthClient()
