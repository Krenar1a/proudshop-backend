'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  inStock: number
  category: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (productId: string, quantity?: number) => Promise<void>
  buyNow: (productId: string, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('proudshop_cart')
    if (savedCart) {
      setItems(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('proudshop_cart', JSON.stringify(items))
  }, [items])

  const addToCart = async (productId: string, quantity: number = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gabim në shtimin e produktit')
      }

      const data = await response.json()
      const newItem = data.item

      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.id === productId)
        
        if (existingItem) {
          // Update quantity if item already exists
          return currentItems.map(item =>
            item.id === productId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        } else {
          // Add new item
          return [...currentItems, newItem]
        }
      })

      toast.success('Produkti u shtua në shportë!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(error instanceof Error ? error.message : 'Gabim në shtimin e produktit')
    } finally {
      setIsLoading(false)
    }
  }

  const buyNow = async (productId: string, quantity: number = 1) => {
    setIsLoading(true)
    try {
      // First, check if the item already exists in cart
      const existingItem = items.find(item => item.id === productId)
      
      if (existingItem) {
        // If it exists, just update the quantity to the new value (don't add)
        setItems(currentItems =>
          currentItems.map(item =>
            item.id === productId
              ? { ...item, quantity: quantity }
              : item
          )
        )
      } else {
        // If it doesn't exist, get product details and add to cart
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId, quantity }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Gabim në shtimin e produktit')
        }

        const data = await response.json()
        const newItem = data.item

        // Add new item
        setItems(currentItems => [...currentItems, newItem])
      }

      // Don't show toast for buyNow since user is going to checkout immediately
    } catch (error) {
      console.error('Error in buy now:', error)
      toast.error(error instanceof Error ? error.message : 'Gabim në shtimin e produktit')
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromCart = (productId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== productId))
    toast.success('Produkti u hoq nga shporta')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    toast.success('Shporta u zbraz')
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
