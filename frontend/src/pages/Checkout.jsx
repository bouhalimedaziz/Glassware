"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "../context/CartContext"
import { useAuth } from "../context/AuthContext"
import { getProductById } from "../lib/products"
import { ordersApi } from "../lib/api"

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getCartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.gmail || "",
    name: user?.name || "",
    address: "",
    city: "",
    state: "",
    postal: "",
    payment: "card",
  })
  const [cartProducts, setCartProducts] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      const products = {}
      for (const item of items) {
        if (!products[item.productId]) {
          try {
            const product = await getProductById(item.productId)
            products[item.productId] = product
          } catch (err) {
            console.error("[CHECKOUT_FETCH_PRODUCT]", err)
          }
        }
      }
      setCartProducts(products)
    }

    if (items.length > 0) {
      fetchProducts()
    }
  }, [items])

  const subtotal = getCartTotal()
  const tax = Number((subtotal * 0.1).toFixed(2))
  const totalWithTax = Number((subtotal + tax).toFixed(2))

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-black mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in or create an account to proceed with checkout.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate("/signin")}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    )
  }

  const steps = ["Shopping Cart", "Contact Information", "Payment Method", "Order Confirmation"]
  const tunisiaStates = [
    "Ariana",
    "Béja",
    "Ben Arous",
    "Bizerte",
    "Gabès",
    "Gafsa",
    "Jendouba",
    "Kairouan",
    "Kasserine",
    "Kebili",
    "Kef",
    "Mahdia",
    "Manouba",
    "Medenine",
    "Monastir",
    "Nabeul",
    "Sfax",
    "Sidi Bouzid",
    "Siliana",
    "Sousse",
    "Tataouine",
    "Tozeur",
    "Tunis",
    "Zaghouan",
  ]

  const validateContact = () => {
    if (!formData.name?.trim()) return "Name is required."
    if (!formData.address?.trim()) return "Address is required."
    if (!formData.state?.trim()) return "Region selection is required."
    if (!formData.city?.trim()) return "City is required."
    if (!formData.postal?.trim()) return "Postal code is required."
    if (!items || items.length === 0) return "Your cart is empty."
    return ""
  }

  const handleNext = () => {
    setError("")
    if (step === 2) {
      const err = validateContact()
      if (err) {
        setError(err)
        return
      }
    }
    if (step < 4) setStep((s) => s + 1)
  }

  const handlePrev = () => {
    setError("")
    if (step > 1) setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    setError("")
    const err = validateContact()
    if (err) {
      setError(err)
      return
    }
    if (!items || items.length === 0) {
      setError("Your cart is empty.")
      return
    }

    try {
      setLoading(true)

      // Build order items array
      const item_associated = items.map((item) => {
        const product = cartProducts[item.productId]
        return {
          productId: item.productId,
          productName: product?.name || `Product`,
          quantity: item.quantity,
          price: product?.price || 0,
        }
      })

      // Create order payload
      const orderPayload = {
        order_sendlocation: {
          city: formData.city,
          state: formData.state,
          zipcode: formData.postal,
        },
        item_associated,
        totalAmount: totalWithTax,
      }

      // Submit to backend
      const response = await ordersApi.create(orderPayload)

      // Clear cart and redirect to profile
      clearCart()
      alert("Order placed successfully!")
      navigate("/profile")
    } catch (err) {
      setError(err.message || "Failed to place order")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    idx + 1 <= step ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {idx + 1 <= step ? "✓" : idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${idx + 1 < step ? "bg-purple-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{steps[step - 1]}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div>
                <h3 className="text-xl font-bold mb-6 text-gray-900">Review Your Items</h3>
                {items.length === 0 ? (
                  <p className="text-gray-600">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => {
                      const product = cartProducts[item.productId]
                      return product ? (
                        <div key={`${item.productId}-${item.variantId}`} className="flex gap-4 p-4 border rounded-lg">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="w-24 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-gray-600">${product.price}</p>
                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900">${(product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h3 className="text-xl font-bold mb-6 text-gray-900">Contact Information</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block font-semibold mb-2 text-gray-900">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-gray-900">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-gray-900">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-2 text-gray-900">State (Tunisia Region)</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">Select a region</option>
                      {tunisiaStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold mb-2 text-gray-900">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-gray-900">Postal Code</label>
                      <input
                        type="text"
                        value={formData.postal}
                        onChange={(e) => setFormData({ ...formData, postal: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="text-xl font-bold mb-6 text-gray-900">Select Payment Method</h3>
                <div className="space-y-4">
                  {[
                    { id: "card", label: "Credit Card", icon: "💳" },
                    { id: "paypal", label: "PayPal", icon: "🅿️" },
                    { id: "cash", label: "Cash on Delivery", icon: "💵" },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.payment === method.id
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={formData.payment === method.id}
                        onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                        className="w-5 h-5"
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-semibold text-gray-900">{method.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center">
                <div className="text-6xl mb-4">✓</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Order Ready to Submit</h3>
                <p className="text-gray-600 mb-6">
                  Click <strong>Place Order</strong> to finalize and create your order in our system.
                </p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6 h-fit sticky top-8">
            <h3 className="font-bold text-lg mb-4 text-gray-900">Order Summary</h3>
            <div className="space-y-2 mb-6 pb-6 border-b">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-900">FREE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-semibold text-gray-900">${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between mb-6 text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>${totalWithTax.toFixed(2)}</span>
            </div>

            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            <div className="space-y-3">
              {step > 1 && (
                <button
                  onClick={handlePrev}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Previous
                </button>
              )}
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50"
                >
                  {step === 3 ? "Review Order" : "Next"}
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? "Placing order..." : "Place Order"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
