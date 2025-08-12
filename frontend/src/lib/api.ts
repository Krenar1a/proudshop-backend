/// <reference types="node" />
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    cache: 'no-store'
  })
  if (!res.ok) {
    let msg = 'Request failed'
    try { msg = (await res.json()).detail || msg } catch {}
    throw new Error(msg)
  }
  return res.json()
}

export const api = {
  auth: {
    login: (email: string, password: string) => request<{access_token: string}>(`/auth/login`, { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (email: string, password: string, name?: string) => request<{access_token: string}>(`/auth/register`, { method: 'POST', body: JSON.stringify({ email, password, name }) })
  },
  products: {
    list: () => request<any[]>(`/products/`),
    create: (data: any, token: string) => request(`/products/`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
    get: (id: number) => request(`/products/${id}`)
  },
  categories: {
    list: () => request<any[]>(`/categories/`),
    create: (data: any, token: string) => request(`/categories/`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
  },
  orders: {
    list: (token: string) => request<any[]>(`/orders/`, { headers: { Authorization: `Bearer ${token}` } }),
    create: (data: any, token: string) => request(`/orders/`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } })
  },
  customers: {
    list: (token: string) => request<any[]>(`/customers/`, { headers: { Authorization: `Bearer ${token}` } }),
    create: (data: any, token: string) => request(`/customers/`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } })
  },
  cart: {
    list: (customerId?: number) => request<any[]>(`/cart/${customerId ? `?customer_id=${customerId}` : ''}`),
    add: (data: any, token: string, customerId?: number) => request(`/cart/${customerId ? `?customer_id=${customerId}` : ''}`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
    remove: (id: number, token: string) => request(`/cart/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  }
}

export type ApiClient = typeof api
