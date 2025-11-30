"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useCart } from "../../context/CartContext"

export default function Header({ isCartOpen, setIsCartOpen }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { getCartItemsCount } = useCart()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const cartCount = getCartItemsCount()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const handleAvatarClick = () => {
    navigate("/profile")
  }

  return (
    <header className="sticky top-0 z-50 bg-white text-black shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-wider hover:text-purple-600 transition-all duration-200 transform hover:scale-110"
          >
            GLASSWARE
          </Link>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex gap-8 items-center">
            <Link
              to="/"
              className="hover:text-purple-600 transition-all duration-200 transform hover:scale-110 relative group"
              title="Home"
              onMouseEnter={() => setHoveredItem("home")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              HOME
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  hoveredItem === "home" ? "w-full" : "w-0"
                }`}
              />
            </Link>
            <Link
              to="/shop"
              className="hover:text-purple-600 transition-all duration-200 transform hover:scale-110 relative group"
              title="Shop"
              onMouseEnter={() => setHoveredItem("shop")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              SHOP
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  hoveredItem === "shop" ? "w-full" : "w-0"
                }`}
              />
            </Link>
            <Link
              to="/contact"
              className="hover:text-purple-600 transition-all duration-200 transform hover:scale-110 relative group"
              title="Contact"
              onMouseEnter={() => setHoveredItem("contact")}
              onMouseLeave={() => setHoveredItem(null)}
            >
              CONTACT
              <span
                className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                  hoveredItem === "contact" ? "w-full" : "w-0"
                }`}
              />
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="hover:text-purple-600 transition-all duration-200 transform hover:scale-110 relative group font-semibold text-purple-600"
                title="Admin Panel"
                onMouseEnter={() => setHoveredItem("admin")}
                onMouseLeave={() => setHoveredItem(null)}
              >
                ADMIN
                <span
                  className={`absolute bottom-0 left-0 h-0.5 bg-purple-600 transition-all duration-300 ${
                    hoveredItem === "admin" ? "w-full" : "w-0"
                  }`}
                />
              </Link>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex gap-6 items-center">
            {/* Auth Links */}
            <div className="hidden sm:flex gap-4 items-center">
              {user ? (
                <>
                  <button
                    onClick={handleAvatarClick}
                    className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-purple-600 transition-all transform hover:scale-110 bg-purple-100 flex items-center justify-center flex-shrink-0"
                    title="View Profile"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 rounded transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="hover:text-purple-600 transition-all duration-200 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded transition-all duration-200 transform hover:scale-105 font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Cart Icon with Badge */}
            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative hover:text-purple-600 transition-all transform hover:scale-125"
              title="Shopping Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden hover:text-purple-600 transition-colors transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-200 space-y-3 pt-3">
            <Link to="/" className="block hover:text-purple-600 transition-colors">
              HOME
            </Link>
            <Link to="/shop" className="block hover:text-purple-600 transition-colors">
              SHOP
            </Link>
            <Link to="/contact" className="block hover:text-purple-600 transition-colors">
              CONTACT
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="block hover:text-purple-600 transition-colors font-semibold text-purple-600">
                ADMIN
              </Link>
            )}
            {user ? (
              <>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left hover:text-purple-600 transition-colors"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <>
                <Link to="/signin" className="block hover:text-purple-600 transition-colors">
                  SIGN IN
                </Link>
                <Link to="/signup" className="block hover:text-purple-600 transition-colors">
                  SIGN UP
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
