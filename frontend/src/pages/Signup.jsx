"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function Signup() {
  const navigate = useNavigate()
  const { signup, error: authError } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState(authError)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    console.log("Signup form submitted")

    if (!formData.name || !formData.gmail || !formData.password) {
      setError("Please fill in all fields")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      console.log("Calling signup with:", formData)
      await signup(formData.name, formData.gmail, formData.password)
      console.log("Signup successful, navigating home")
      navigate("/")
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.message || "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Purple Gradient */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-purple-600 to-purple-900 text-white flex-col justify-center px-12">
        <h1 className="text-5xl font-bold mb-8">Get Started with Us</h1>
        <p className="text-xl mb-12 leading-relaxed">
          Join GLASSWARE to discover exclusive tech products, manage your orders, and enjoy special deals.
        </p>
        <div className="space-y-6">
          {[
            { number: "1", text: "Sign up your account" },
            { number: "2", text: "Browse our collection" },
            { number: "3", text: "Start shopping today" },
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
            <h2 className="text-4xl font-bold text-white mb-2">Sign Up Account</h2>
            <p className="text-gray-300">Enter your personal data to create your account</p>
          </div>

          {error && <div className="bg-red-500 text-white p-4 rounded-lg mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-3">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Email</label>
              <input
                type="email"
                name="gmail"
                value={formData.gmail}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Must be at least 6 characters"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-3">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-8">
            Already have an account?{" "}
            <Link to="/signin" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
