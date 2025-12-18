// Frontend API utility layer - centralized API calls with error handling
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:6005/api"

async function apiCall(endpoint, options = {}) {
  try {
    console.log("API Call:", endpoint, options)

    const token = localStorage.getItem("glassware-token")
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    })

    console.log("Response status:", response.status)

    if (!response.ok) {
      const error = await response.json()
      console.log("API Error:", error)
      throw new Error(error.error || `API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("Response data:", data)
    return data
  } catch (error) {
    console.error("API_ERROR", endpoint, error)
    throw error
  }
}

// ==================== PRODUCTS ====================
export const productsApi = {
  getAll: () => apiCall("/products"),
  getById: (id) => apiCall(`/products/${id}`),
  getByCategory: (category) => apiCall(`/products/category/${category}`),
  search: (query) => apiCall(`/products/search/query?q=${encodeURIComponent(query)}`),
  create: (data) => apiCall("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/products/${id}`, { method: "DELETE" }),
  submitReview: (id, rating, comment) =>
    apiCall(`/products/${id}/review`, { method: "POST", body: JSON.stringify({ rating, comment }) }),
  getReviews: (id) => apiCall(`/products/${id}/reviews`),
}

// ==================== AUTH ====================
export const authApi = {
  register: (name, gmail, password) =>
    apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, gmail, password }),
    }),

  login: (gmail, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ gmail, password }),
    }),

  logout: () => apiCall("/auth/logout", { method: "POST" }),
  verify: () => apiCall("/auth/verify"),
}

// ==================== USERS ====================
export const usersApi = {
  getProfile: () => apiCall("/users/profile"),
  updateProfile: (data) => apiCall("/users/profile", { method: "PUT", body: JSON.stringify(data) }),
  updatePassword: (oldPassword, newPassword) =>
    apiCall("/users/password", {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    }),

  addAddress: (city, state, zipcode) =>
    apiCall("/users/address", {
      method: "POST",
      body: JSON.stringify({ city, state, zipcode }),
    }),

  updateAddress: (addressId, city, state, zipcode) =>
    apiCall(`/users/address/${addressId}`, {
      method: "PUT",
      body: JSON.stringify({ city, state, zipcode }),
    }),

  deleteAddress: (addressId) => apiCall(`/users/address/${addressId}`, { method: "DELETE" }),

  addToWishlist: (productId) => apiCall(`/users/wishlist/${productId}`, { method: "POST" }),
  removeFromWishlist: (productId) => apiCall(`/users/wishlist/${productId}`, { method: "DELETE" }),

  // Admin
  getAllUsers: () => apiCall("/users"),
  deleteUser: (id) => apiCall(`/users/${id}`, { method: "DELETE" }),
}

// ==================== ORDERS ====================
export const ordersApi = {
  getUserOrders: () => apiCall("/orders/user"),
  getAll: () => apiCall("/orders"), // Admin only
  create: (data) => apiCall("/orders", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id, status) => apiCall(`/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  delete: (id) => apiCall(`/orders/${id}`, { method: "DELETE" }), // Admin only
}
