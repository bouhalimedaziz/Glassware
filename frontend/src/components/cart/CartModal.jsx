"use client"

import { useNavigate } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useEffect, useState } from "react"
import { formatPrice } from "../../lib/utils"

export default function CartModal({ onClose }) {
  const navigate = useNavigate()
  const { items, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const total = getCartTotal()

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true)
      const loadedItems = []

      for (const item of items) {
        const product = await fetch(`http://localhost:6005/api/products/${item.productId}`)
          .then((r) => r.json())
          .catch(() => null)

        loadedItems.push({
          ...item,
          product,
        })
      }

      setCartItems(loadedItems)
      setLoading(false)
    }

    if (items.length > 0) {
      loadItems()
    } else {
      setCartItems([])
      setLoading(false)
    }
  }, [items])

  const handleCheckout = () => {
    navigate("/checkout")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-xl flex flex-col animate-slideInFromRight"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Cart</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
            ×
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading cart...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Your cart is empty</p>
          ) : (
            cartItems.map((item) => {
              const product = item.product
              if (!product) return null
              return (
                <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 pb-4 border-b animate-slideDown">
                  <img
                    src={product.images?.[0] || product.image || "/placeholder.svg"}
                    alt={product.name || product.title}
                    className="w-24 h-24 object-cover rounded bg-gray-100"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{product.name || product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="px-2 py-1 border hover:bg-gray-100 rounded"
                      >
                        −
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="px-2 py-1 border hover:bg-gray-100 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="ml-auto text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-6 space-y-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-black text-white py-3 rounded font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 transform hover:scale-105"
            >
              Proceed to Checkout
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
