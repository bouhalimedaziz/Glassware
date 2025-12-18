"use client"

import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { CartProvider } from "../../context/CartContext"
import Header from "./Header"
import Footer from "./Footer"
import CartModal from "../cart/CartModal"
import { useState } from "react"

export default function Layout({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />
        <main className="flex-1">{children}</main>
        <Footer />
        {isCartOpen && <CartModal onClose={() => setIsCartOpen(false)} />}
      </div>
    </CartProvider>
  )
}
