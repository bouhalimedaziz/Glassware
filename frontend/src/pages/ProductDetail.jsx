"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { getProductById, getAllProducts } from "../lib/products"
import { productsApi } from "../lib/api"
import ProductCard from "../components/products/ProductCard"

export default function ProductDetail() {
  const { handle } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const { addToCart } = useCart()
  const { user, addToWishlist, isInWishlist } = useAuth()
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [userReview, setUserReview] = useState("")
  const [userRating, setUserRating] = useState(5)
  const [reviews, setReviews] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [hasPurchased, setHasPurchased] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prod = await getProductById(handle)
        if (!prod) {
          setProduct(null)
        } else {
          setProduct(prod)
          setSelectedVariant(prod.variants?.[0] || null)
          setSelectedImageIndex(0)

          // Fetch recommended products
          const allProducts = await getAllProducts()
          const recommended = allProducts.filter((p) => p.category === prod.category && p._id !== prod._id).slice(0, 4)
          setRecommendedProducts(recommended)

          try {
            const reviewsData = await productsApi.getReviews(prod._id)
            setReviews(reviewsData.reviews || [])
          } catch (err) {
            console.error("Failed to fetch reviews:", err)
            setReviews([])
          }

          if (user && user.orders) {
            const purchased = user.orders.some((order) => {
              if (order.item_associated) {
                return order.item_associated.some((item) => item.productId === prod._id || item.productId === prod.id)
              }
              return false
            })
            setHasPurchased(purchased)
          }
        }
      } catch (error) {
        console.error("[PRODUCT_DETAIL_FETCH]", error)
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [handle, user])

  const inWishlist = product ? isInWishlist(product._id || product.id) : false

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-black">Product not found</h1>
        <p className="text-gray-600 mt-2">The product you're looking for doesn't exist.</p>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product._id || product.id, selectedVariant?.id || "default", quantity)
  }

  const handleAddReview = async () => {
    if (!user) {
      alert("Please sign in to leave a review")
      return
    }

    if (!hasPurchased) {
      alert("You can only review products you've purchased")
      return
    }

    if (!userReview.trim()) {
      alert("Please write a review")
      return
    }

    setReviewSubmitting(true)
    try {
      console.log("Submitting review with rating:", userRating, "comment:", userReview)
      await productsApi.submitReview(product._id, userRating, userReview)

      // Fetch updated reviews from backend after submission
      const updatedReviews = await productsApi.getReviews(product._id)
      console.log("Fetched updated reviews:", updatedReviews)
      setReviews(updatedReviews.reviews || [])

      setUserReview("")
      setUserRating(5)
      alert("Thank you for your review!")
    } catch (error) {
      console.error("Review submission failed:", error)
      alert("Failed to submit review")
    } finally {
      setReviewSubmitting(false)
    }
  }

  const goToImage = (index) => {
    setSelectedImageIndex(Math.max(0, Math.min(index, product.images.length - 1)))
  }

  const nextImage = () => {
    goToImage(selectedImageIndex + 1)
  }

  const prevImage = () => {
    goToImage(selectedImageIndex - 1)
  }

  const displayImage = product.images?.[selectedImageIndex] || product.images?.[0] || "/placeholder.svg"
  const hasMultipleImages = product.images && product.images.length > 1

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200 relative">
              <img src={displayImage || "/placeholder.svg"} alt={product.name} className="w-full h-auto" />

              {/* Image navigation arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-all duration-200"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Image counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {product.images.length}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToImage(idx)}
                    className={`w-full h-24 object-cover rounded cursor-pointer transition-all border-2 ${
                      selectedImageIndex === idx ? "border-purple-600" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-4xl font-bold mb-2 text-black">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center">
                {[...Array(Math.floor(product.rating || 0))].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-lg">
                    ★
                  </span>
                ))}
                {(product.rating || 0) % 1 !== 0 && <span className="text-yellow-500 text-lg">★</span>}
              </div>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>

            <p className="text-3xl font-bold text-black mb-4">${product.price || 0}</p>
            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

            {/* Quantity & Actions */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2">
                  −
                </button>
                <span className="px-4 py-2 border-l border-r border-gray-300">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2">
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add to Cart
              </button>
              <button
                onClick={() => product && addToWishlist(product._id || product.id)}
                className={`px-6 py-3 border-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                  inWishlist
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {inWishlist ? "♥" : "♡"}
              </button>
            </div>
          </div>
        </div>

        {recommendedProducts.length > 0 && (
          <section className="mb-16 pb-12 border-b border-gray-200">
            <h2 className="text-3xl font-bold mb-8 text-black">Recommended Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendedProducts.map((item) => (
                <ProductCard key={item._id || item.id} product={item} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <div className="border-t pt-12">
          <h2 className="text-3xl font-bold mb-8 text-black">Customer Reviews</h2>

          {user ? (
            <div className="bg-purple-50 rounded-lg p-6 mb-8 border border-purple-200">
              <h3 className="font-semibold mb-4 text-black">Leave a Review</h3>
              {!hasPurchased ? (
                <p className="text-gray-600 bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                  You can only leave reviews for products you've purchased. Make a purchase first!
                </p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-2 text-black">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          disabled={reviewSubmitting}
                          className={`text-3xl transition-all transform hover:scale-110 ${userRating >= star ? "text-yellow-500" : "text-gray-300"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-black">Your Review</label>
                    <textarea
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      disabled={reviewSubmitting}
                      placeholder="Share your experience with this product..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={handleAddReview}
                    disabled={reviewSubmitting}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-blue-800">
              <p>
                <a href="/signin" className="font-semibold hover:underline">
                  Sign in
                </a>{" "}
                to leave a review
              </p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-6">
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="font-semibold text-black">{review.userName}</h4>
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-500">
                          ★
                        </span>
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified Purchase</span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
