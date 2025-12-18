"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { productsApi } from "../lib/api"

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [products, setProducts] = useState({}) // Cache products by ID

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("glassware-cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        setItems([])
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("glassware-cart", JSON.stringify(items))
  }, [items])

  const fetchProductDetails = async (productId) => {
    if (products[productId]) return products[productId]

    try {
      const product = await productsApi.getById(productId)
      setProducts((prev) => ({ ...prev, [productId]: product }))
      return product
    } catch (error) {
      console.error("[FETCH_PRODUCT_DETAILS]", error)
      return null
    }
  }

  const addToCart = (productId, variantId, quantity) => {
    fetchProductDetails(productId)
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId && item.variantId === variantId)
      if (existing) {
        return prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...prev, { productId, variantId, quantity }]
    })
  }

  const removeFromCart = (productId, variantId) => {
    setItems((prev) => prev.filter((item) => !(item.productId === productId && item.variantId === variantId)))
  }

  const updateQuantity = (productId, variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId)
      return
    }
    setItems((prev) =>
      prev.map((item) => (item.productId === productId && item.variantId === variantId ? { ...item, quantity } : item)),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const product = products[item.productId]
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const getCartItemsCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        fetchProductDetails,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
