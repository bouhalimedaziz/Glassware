"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../context/AuthContext"
import { formatPrice } from "../../lib/utils"

export default function ProductCard({ product, variant = null }) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState(variant || product.variants[0])
  const { addToCart } = useCart()
  const { user, addToWishlist, isInWishlist } = useAuth()
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    if (selectedVariant) {
      addToCart(product.id, selectedVariant.id, 1)
    }
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    if (user) {
      addToWishlist(product.id)
    }
  }

  return (
    <Link to={`/product/${product.handle}`}>
      <div
        className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 animate-scaleIn"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative w-full h-80 overflow-hidden bg-gray-100">
          <img src={product.image || "/placeholder.svg"} alt={product.title} className="w-full h-full object-cover" />

         

          {product.isFeatured && (
            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
              Featured
            </div>
          )}
        </div>

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-black/10 p-4 flex flex-col justify-end animate-fadeIn">
            <div className="space-y-3">
              <div className="bg-white rounded p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">{product.category}</p>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{product.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-black">{formatPrice(product.price)}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-black hover:bg-purple-600 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
