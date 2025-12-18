"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { usersApi } from "../lib/api"
import { formatDate, formatPrice } from "../lib/utils"
import ProductCard from "../components/products/ProductCard"
import { getAllProducts } from "../lib/products"

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("orders")
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: "", email: "", profileImage: "" })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" })
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [cardForm, setCardForm] = useState(user?.creditCard || {})
  const [isEditingCard, setIsEditingCard] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function fetchUserData() {
      if (!user) return
      setLoading(true)
      try {
        const profile = typeof usersApi.getProfile === "function" ? await usersApi.getProfile() : null
        setEditForm({
          name: profile?.name || user.name || "",
          email: profile?.gmail || user.email || "",
          profileImage: profile?.profileImage || user.profileImage || "",
        })
        setOrders(profile?.orders || [])

        let userOrders = Array.isArray(profile?.orders) ? profile.orders : []
        if ((!userOrders || userOrders.length === 0) && typeof usersApi.getUserOrders === "function") {
          userOrders = await usersApi.getUserOrders()
        }
        setOrders(Array.isArray(userOrders) ? userOrders : [])
      } catch (err) {
        console.error("[PROFILE_FETCH]", err)
        setError("Failed to load profile data")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const allProductsRaw = getAllProducts()
  const allProducts = Array.isArray(allProductsRaw)
    ? allProductsRaw
    : allProductsRaw && Array.isArray(allProductsRaw.data)
      ? allProductsRaw.data
      : []

  const wishlistItems =
    Array.isArray(allProducts) && Array.isArray(user?.wishlist)
      ? allProducts.filter((p) => {
          const pid = p._id || p.id || p.productId || p.sku || p.slug
          return pid && user.wishlist.includes(pid)
        })
      : Array.isArray(user?.wishlist)
        ? user.wishlist.filter((w) => {
            if (typeof w === "object" && (w._id || w.id)) {
              const pid = w._id || w.id
              return allProducts.some((p) => (p._id || p.id || p.productId || p.sku || p.slug) === pid)
            }
            return false
          })
        : []

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        name: editForm.name,
        gmail: editForm.email,
        profileImage: editForm.profileImage,
      })
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      setError("Failed to save profile")
    }
  }

  const handleUpdatePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError("Passwords do not match")
        return
      }
      if (passwordForm.newPassword.length < 6) {
        setError("Password must be at least 6 characters")
        return
      }
      await usersApi.updatePassword(passwordForm.oldPassword, passwordForm.newPassword)
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
      setIsEditingPassword(false)
      alert("Password updated successfully")
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to update password")
    }
  }

  const handleSaveCard = async () => {
    try {
      await updateProfile({ creditCard: cardForm })
      setIsEditingCard(false)
    } catch (err) {
      console.error(err)
      setError("Failed to save card")
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
        <button onClick={() => navigate("/signin")} className="text-purple-600 hover:text-purple-700 font-semibold">
          Sign In
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">My Account</h1>
            <p className="text-gray-600">
              Welcome, <span className="font-semibold text-purple-600">{user.name}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Menu */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 space-y-2 shadow-md sticky top-20 border border-gray-200">
              {[
                {
                  id: "orders",
                  label: "Orders",
                  icon: (
                    <img
                      src="https://freepngimg.com/save/89558-icons-checklist-computer-black-text-white/752x980"
                      width={25}
                      alt="orders"
                    />
                  ),
                },
                {
                  id: "personal",
                  label: "Personal Data",
                  icon: (
                    <img
                      src="https://icbm.exon.lk/assets/images/testimonial/testimonial_img_1.jpg"
                      width={30}
                      alt="personal"
                    />
                  ),
                },
                {
                  id: "payment",
                  label: "Payment Method",
                  icon: (
                    <img
                      src="https://p7.hiclipart.com/preview/584/302/361/computer-icons-credit-card-pict-kohut.jpg"
                      width={30}
                      alt="card"
                    />
                  ),
                },
                {
                  id: "wishlist",
                  label: "Wishlist",
                  icon: <img src="https://cdn-icons-png.freepik.com/512/25/25451.png" width={30} alt="wishlist" />,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 transform hover:scale-105 ${
                    activeTab === item.id ? "bg-purple-600 text-white shadow-lg" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-black">Your Orders</h2>
                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                      <p className="text-gray-500 text-lg">No orders yet</p>
                      <p className="text-gray-400 text-sm mt-2">Complete a checkout to see your orders here.</p>
                    </div>
                  ) : (
                    orders
                      .slice()
                      .reverse()
                      .map((order) => (
                        <div
                          key={order._id || order.id || order.orderNumber}
                          className="bg-white border-l-4 border-purple-600 rounded-lg p-6 shadow-md hover:shadow-lg transition-all border border-gray-200"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div>
                              <p className="text-sm text-gray-600">Order Number</p>
                              <p className="font-semibold text-black">#{order.orderNumber || order._id || order.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-semibold text-black">
                                {formatDate(order.order_date || order.date || order.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total</p>
                              <p className="font-semibold text-black">
                                {formatPrice(order.totalAmount ?? order.total ?? order.amount ?? 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Status</p>
                              <p
                                className={`font-semibold ${
                                  (order.status || "").toLowerCase().includes("deliver")
                                    ? "text-green-600"
                                    : (order.status || "").toLowerCase().includes("process")
                                      ? "text-blue-600"
                                      : "text-orange-600"
                                }`}
                              >
                                {order.status || "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 text-black">Items</h4>
                            <ul className="list-disc ml-5 text-gray-700">
                              {(order.items || order.item_associated || order.itemsSummary || []).length === 0 ? (
                                <li className="text-gray-500">No items listed</li>
                              ) : (
                                (order.items || order.item_associated || order.itemsSummary).map((it, idx) => {
                                  if (!it) return null
                                  if (typeof it === "string") {
                                    return (
                                      <li key={idx} className="text-gray-700">
                                        {it}
                                      </li>
                                    )
                                  }
                                  const title =
                                    it.title || it.name || it.productName || it.product?.title || it.product?.name
                                  const qty = it.quantity ?? it.qty ?? it.count ?? 1
                                  const lineTotal =
                                    it.lineTotal ?? it.line_total ?? it.subtotal ?? (it.price ? it.price * qty : null)
                                  return (
                                    <li key={idx} className="text-gray-700">
                                      {title || "Item"} x{qty} — {lineTotal ? formatPrice(lineTotal) : ""}
                                    </li>
                                  )
                                })
                              )}
                            </ul>
                          </div>

                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-semibold mb-2 text-black">Shipping Address</h4>
                            <p className="text-gray-700">{order.customerName || order.name || user.name}</p>
                            <p className="text-gray-700">
                              {order.address || order.street || order.shippingAddress || ""}
                              {order.city ? `, ${order.city}` : ""}
                              {order.state ? `, ${order.state}` : ""} {order.postal || order.zip || ""}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Payment: {order.paymentMethod || order.payment || "—"}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Personal Data Tab */}
            {activeTab === "personal" && (
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-black">Personal Data</h2>

                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-24 h-24 rounded-full border-4 border-purple-600 overflow-hidden bg-gray-100 flex items-center justify-center mb-3">
                        {editForm.profileImage ? (
                          <img
                            src={editForm.profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          value={user.name}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email account</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile number</label>
                        <input
                          type="tel"
                          placeholder="Add number"
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          placeholder="USA"
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setIsEditingPassword(true)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Profile image upload */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-24 h-24 rounded-full border-4 border-purple-600 overflow-hidden bg-gray-100 flex items-center justify-center mb-3">
                        {editForm.profileImage ? (
                          <img
                            src={editForm.profileImage || "/placeholder.svg"}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Profile Image URL"
                        value={editForm.profileImage}
                        onChange={(e) => setEditForm({ ...editForm, profileImage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email account</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {isEditingPassword && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-bold mb-4 text-black">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Old Password</label>
                        <input
                          type="password"
                          value={passwordForm.oldPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleUpdatePassword}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingPassword(false)
                            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" })
                          }}
                          className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Tab */}
            {activeTab === "payment" && (
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-black">Payment Method</h2>
                <div className="space-y-4">
                  {!isEditingCard ? (
                    <>
                      {cardForm?.cardNumber ? (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Saved Card</p>
                          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-lg mb-4 shadow-lg">
                            <div className="text-2xl mb-4 tracking-widest">
                              ●●●● ●●●● ●●●● {String(cardForm.cardNumber).slice(-4)}
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>{cardForm.cardName}</span>
                              <span>{cardForm.expiryDate}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No payment method saved</p>
                      )}
                      <button
                        onClick={() => setIsEditingCard(true)}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-purple-600 transition-all duration-200 transform hover:scale-105 font-medium"
                      >
                        {cardForm?.cardNumber ? "Edit Card" : "Add Payment Method"}
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          placeholder="4035 3005 3980 4083"
                          value={cardForm.cardNumber || ""}
                          onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="JOHN DOE"
                          value={cardForm.cardName || ""}
                          onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardForm.expiryDate || ""}
                            onChange={(e) => setCardForm({ ...cardForm, expiryDate: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">CVV</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={cardForm.cvv || ""}
                            onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveCard}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 transform hover:scale-105 font-medium"
                        >
                          Save Card
                        </button>
                        <button
                          onClick={() => setIsEditingCard(false)}
                          className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-all duration-200 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-black">Wishlist</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistItems.length === 0 ? (
                    <div className="col-span-full bg-white rounded-lg p-8 text-center border border-gray-200">
                      <p className="text-gray-500 text-lg">Your wishlist is empty</p>
                      <p className="text-gray-400 text-sm mt-2">Add products to your wishlist to see them here.</p>
                    </div>
                  ) : (
                    wishlistItems.map((product) => <ProductCard key={product._id || product.id} product={product} />)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
