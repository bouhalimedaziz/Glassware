"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { productsApi, usersApi, ordersApi } from "../lib/api"

export default function Admin() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [expandedOrderId, setExpandedOrderId] = useState(null)

  // Products form state (now supports images)
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    imageUrl: "",
    images: [],
  })
  const [editingProduct, setEditingProduct] = useState(null)

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/")
    }
  }, [user, navigate])

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError("")

        if (activeTab === "products") {
          const data = await productsApi.getAll()
          setProducts(Array.isArray(data) ? data : data?.data || data?.products || [])
        } else if (activeTab === "orders") {
          const data = await ordersApi.getAll()
          setOrders(Array.isArray(data) ? data : data?.data || data?.orders || [])
        } else if (activeTab === "users") {
          const data = await usersApi.getAllUsers()
          setUsers(Array.isArray(data) ? data : data?.data || data?.users || [])
        }
      } catch (err) {
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab])

  // Helper to refresh product list
  const refreshProducts = async () => {
    try {
      const data = await productsApi.getAll()
      setProducts(Array.isArray(data) ? data : data?.data || data?.products || [])
    } catch (err) {
      console.error(err)
    }
  }

  // Products handlers
  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault()
    try {
      setError("")
      if (!productForm.name || !productForm.price || !productForm.category) {
        setError("Name, price, and category are required")
        return
      }

      const payload = {
        name: productForm.name,
        price: Number.parseFloat(productForm.price),
        category: productForm.category,
        description: productForm.description,
        stock: Number.parseInt(productForm.stock) || 0,
        images: productForm.images && productForm.images.length > 0 ? productForm.images : [],
      }

      if (editingProduct) {
        await productsApi.update(editingProduct, payload)
        await refreshProducts()
        setEditingProduct(null)
        alert("Product updated successfully!")
      } else {
        await productsApi.create(payload)
        await refreshProducts()
        alert("Product added successfully!")
      }

      setProductForm({ name: "", price: "", category: "", description: "", stock: "", imageUrl: "", images: [] })
    } catch (err) {
      setError(err.message || "Failed to save product")
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return
    try {
      await productsApi.delete(id)
      setProducts(products.filter((p) => p._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const startEditProduct = (p) => {
    const images = Array.isArray(p.images) ? p.images : p.image ? [p.image] : []
    setEditingProduct(p._id || p.id)
    setProductForm({
      name: p.name || p.title || "",
      price: p.price ?? "",
      category: p.category || "",
      description: p.description || "",
      stock: typeof p.stock === "number" ? p.stock : p.stock || "",
      imageUrl: "",
      images,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const cancelEdit = () => {
    setEditingProduct(null)
    setProductForm({ name: "", price: "", category: "", description: "", stock: "", imageUrl: "", images: [] })
  }

  const handleAddImageToForm = (e) => {
    e.preventDefault()
    const url = (productForm.imageUrl || "").trim()
    if (!url) return
    if (!productForm.images.includes(url)) {
      setProductForm({ ...productForm, images: [...productForm.images, url], imageUrl: "" })
    } else {
      setProductForm({ ...productForm, imageUrl: "" })
    }
  }

  const handleRemoveImageFromForm = (index) => {
    const imgs = [...productForm.images]
    imgs.splice(index, 1)
    setProductForm({ ...productForm, images: imgs })
  }

  // Orders handlers
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus)
      const data = await ordersApi.getAll()
      setOrders(Array.isArray(data) ? data : data?.data || data?.orders || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return
    try {
      await ordersApi.delete(id)
      setOrders(orders.filter((o) => o._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  // Users handlers
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return
    try {
      await usersApi.deleteUser(id)
      setUsers(users.filter((u) => u._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  const getOrderUser = (order) => {
    if (!order) return null
    if (order.user_associated && typeof order.user_associated === "object") return order.user_associated
    if (order.user && typeof order.user === "object") return order.user
    if (order.userId && typeof order.userId === "object") return order.userId
    if (order.customer && typeof order.customer === "object") return order.customer
    return {
      name: order.name || order.customerName || order.userName || "Unknown User",
      gmail: order.gmail || order.email || order.userEmail || "No email",
    }
  }

  const getOrderItems = (order) => {
    if (!order) return []
    if (Array.isArray(order.items)) return order.items
    if (Array.isArray(order.products)) return order.products
    if (Array.isArray(order.orderItems)) return order.orderItems
    if (Array.isArray(order.cart)) return order.cart
    if (Array.isArray(order.item_associated)) return order.item_associated
    return []
  }

  const getOrderLocation = (order) => {
    if (!order) return null
    return order.order_sendlocation || order.shippingAddress || order.address || order.location || null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-black mb-8">Admin Panel</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b-2 border-gray-200">
          {["products", "orders", "users"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-all capitalize ${
                activeTab === tab ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && <p className="text-center text-gray-600">Loading...</p>}

        {/* Products Tab */}
        {activeTab === "products" && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add / Edit Product Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-black">{editingProduct ? "Edit Product" : "Add Product"}</h2>
                <form onSubmit={handleAddOrUpdateProduct} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select Category</option>
                    <option value="phones">Phones</option>
                    <option value="laptops">Laptops</option>
                    <option value="headsets">Headsets</option>
                    <option value="keyboards">Keyboards</option>
                    <option value="mouses">Mouses</option>
                    <option value="monitors">Monitors</option>
                  </select>
                  <textarea
                    placeholder="Description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  {/* Image URL input + add button */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Image URL"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleAddImageToForm}
                      className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {/* Show added images */}
                  {productForm.images && productForm.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {productForm.images.map((img, idx) => (
                        <div key={idx} className="w-20 h-20 rounded overflow-hidden border border-gray-200 relative">
                          <img
                            src={img || "/placeholder.svg"}
                            alt={`img-${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImageFromForm(idx)}
                            type="button"
                            className="absolute top-0 right-0 bg-white/80 text-red-600 rounded-bl px-1 text-xs"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-purple-600 font-medium"
                    >
                      {editingProduct ? "Update Product" : "Add Product"}
                    </button>

                    {editingProduct && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Products List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h2 className="text-xl font-bold mb-4 text-black">Products ({products.length})</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {products.map((product) => {
                    const thumb =
                      (Array.isArray(product.images) && product.images[0]) ||
                      product.image ||
                      product.imageUrl ||
                      "/placeholder.svg"
                    return (
                      <div
                        key={product._id || product.id}
                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-gray-50 rounded overflow-hidden border border-gray-200">
                            <img
                              src={thumb || "/placeholder.svg"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-black">{product.name || product.title}</h3>
                            <p className="text-sm text-gray-600">
                              ${product.price} • {product.category}
                            </p>
                            <p className="text-sm text-gray-500">Stock: {product.stock}</p>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => startEditProduct(product)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product._id || product.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && !loading && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Orders ({orders.length})</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {orders.map((order) => {
                const userObj = getOrderUser(order) || {}
                const items = getOrderItems(order)
                const location = getOrderLocation(order)
                const orderDate = order.createdAt || order.date || order.order_date || order.created || order.created_at
                const isExpanded = expandedOrderId === (order._id || order.id)

                const avatar =
                  (userObj &&
                    (userObj.profileImage || userObj.avatar || userObj.image || userObj.photo || userObj.profilePic)) ||
                  null

                return (
                  <div key={order._id || order.id}>
                    {/* Order Header Row */}
                    <div className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center mb-4">
                        {/* Customer Info - Prominent Display */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-200 flex-shrink-0 bg-purple-100">
                              {avatar ? (
                                <img
                                  src={avatar || "/placeholder.svg"}
                                  alt={userObj?.name || userObj?.gmail || "user"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <svg
                                  className="w-full h-full text-purple-600 p-2"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-lg font-bold text-black truncate">
                                {userObj?.name || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500 truncate">{userObj?.gmail || "No email"}</div>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                            Address
                          </div>
                          <div className="text-sm text-gray-700">
                            {location
                              ? typeof location === "string"
                                ? location
                                : `${location.city || ""}${location.city && location.state ? ", " : ""}${location.state || ""}${
                                    location.zipcode ? " • " + location.zipcode : ""
                                  }`
                              : order.addressString || "—"}
                          </div>
                        </div>

                        {/* Order Date */}
                        <div>
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Date</div>
                          <div className="text-sm text-gray-700">
                            {orderDate ? new Date(orderDate).toLocaleDateString() : "—"}
                          </div>
                        </div>

                        {/* Total Amount */}
                        <div>
                          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Amount</div>
                          <div className="text-sm font-semibold text-gray-900">
                            ${order.totalAmount || order.amount || order.total || 0}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="flex gap-2 items-end">
                          <select
                            value={order.status || "pending"}
                            onChange={(e) => handleUpdateOrderStatus(order._id || order.id, e.target.value)}
                            className={`px-3 py-1 rounded text-sm font-medium border transition-colors ${
                              order.status === "delivered"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : order.status === "shipped"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : order.status === "cancelled"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id || order.id)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        </div>
                      </div>

                      {/* Order Details (Expandable) */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h4 className="font-semibold mb-3 text-black">Items</h4>
                          <ul className="space-y-2 mb-6">
                            {items.length === 0 ? (
                              <li className="text-gray-500 text-sm">No items listed</li>
                            ) : (
                              items.map((item, idx) => {
                                if (!item) return null
                                const itemName = item.productName || item.name || item.title || "Item"
                                const qty = item.quantity || 1
                                const price = item.price || 0
                                return (
                                  <li key={idx} className="text-sm text-gray-700">
                                    {itemName} x{qty} — ${(price * qty).toFixed(2)}
                                  </li>
                                )
                              })
                            )}
                          </ul>

                          <div className="border-t border-gray-200 pt-4">
                            <button
                              onClick={() => handleDeleteOrder(order._id || order.id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                            >
                              Delete Order
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && !loading && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-black">Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Profile Image</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm text-gray-900">{u.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{u.gmail}</td>
                      <td className="px-6 py-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex-shrink-0 bg-gray-100">
                          {u.profileImage ? (
                            <img
                              src={u.profileImage || "/placeholder.svg"}
                              alt={u.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg className="w-full h-full text-gray-400 p-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 capitalize">{u.role}</td>
                      <td className="px-6 py-3 text-sm">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
