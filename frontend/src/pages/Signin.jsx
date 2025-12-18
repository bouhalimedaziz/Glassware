"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Signin() {
  const navigate = useNavigate()
  const { signin, error: authError } = useAuth()
  const [gmail, setGmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(authError)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!gmail || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      await signin(gmail, password)
      navigate("/")
    } catch (err) {
      setError(err.message || "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Purple Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-purple-600 to-purple-900 text-white flex-col justify-center px-12">
        <h1 className="text-5xl font-bold mb-8">Welcome Back</h1>
        <p className="text-xl mb-12 leading-relaxed">
          Sign in to your GLASSWARE account to access your orders, wishlist, and exclusive deals.
        </p>
        <div className="space-y-6">
          {[
            { number: "1", text: "Sign in to your account" },
            { number: "2", text: "View your order history" },
            { number: "3", text: "Manage your wishlist" },
          ].map((step) => (
            <div key={step.number} className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-full bg-white text-purple-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                {step.number}
              </div>
              <p className="text-lg">{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-black flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-2">Sign In</h2>
            <p className="text-gray-300">Access your GLASSWARE account</p>
          </div>

          {error && <div className="bg-red-500 text-white p-4 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3">Email</label>
              <input
                type="email"
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Don't have an account?{" "}
            <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
