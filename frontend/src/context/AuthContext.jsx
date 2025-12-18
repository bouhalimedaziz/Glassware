"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { authApi, usersApi } from "../lib/api"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const saved = localStorage.getItem("glassware-token")

        if (saved) {
          setToken(saved)
          try {
            const userData = await usersApi.getProfile()
            setUser(userData)
          } catch (profileErr) {
            localStorage.removeItem("glassware-token")
            setToken(null)
          }
        }
      } catch (err) {
        console.error("Auth verify error:", err)
        localStorage.removeItem("glassware-token")
        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    verifyAuth()
  }, [])

  const signup = async (name, gmail, password) => {
    try {
      setError(null)

      const response = await authApi.register(name, gmail, password)

      setToken(response.token)
      setUser(response.user)
      localStorage.setItem("glassware-token", response.token)

      return response.user
    } catch (err) {
      const message = err.message || "Signup failed"
      console.error("Signup error:", message)
      setError(message)
      throw err
    }
  }

  const signin = async (gmail, password) => {
    try {
      setError(null)

      const response = await authApi.login(gmail, password)

      setToken(response.token)
      setUser(response.user)
      localStorage.setItem("glassware-token", response.token)

      return response.user
    } catch (err) {
      const message = err.message || "Login failed"
      console.error("Signin error:", message)
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
      setToken(null)
      localStorage.removeItem("glassware-token")
    }
  }

  const updateProfile = async (updates) => {
    try {
      setError(null)
      const updated = await usersApi.updateProfile(updates)
      setUser(updated)
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const addToWishlist = async (productId) => {
    try {
      if (!user) {
        alert("Please sign in to add to wishlist")
        return
      }

      const isCurrentlyInWishlist = user?.wishlist?.includes(productId)

      if (isCurrentlyInWishlist) {
        // Remove from wishlist
        const response = await usersApi.removeFromWishlist(productId)

        // Update user state with response
        if (response?.user) {
          setUser(response.user)
        }
        alert("Removed from wishlist")
      } else {
        // Add to wishlist
        const response = await usersApi.addToWishlist(productId)

        // Update user state with response
        if (response?.user) {
          setUser(response.user)
        }
        alert("Added to wishlist")
      }
    } catch (err) {
      console.error("Wishlist operation failed:", err.message)
      alert("Failed to update wishlist: " + (err.message || "Unknown error"))
    }
  }

  const isInWishlist = (productId) => {
    return user?.wishlist?.includes(productId) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        error,
        signup,
        signin,
        logout,
        updateProfile,
        addToWishlist,
        isInWishlist,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
