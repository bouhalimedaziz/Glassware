"use client"

import { useState, useEffect } from "react"
import ProductCard from "./ProductCard"
import { cn } from "../../lib/utils"

export default function FeaturedCarousel({ products = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay || products.length === 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length)
    }, 15000) // 15 seconds

    return () => clearInterval(timer)
  }, [isAutoPlay, products.length])

  if (products.length === 0) return null

  const current = products[currentIndex]

  return (
    <div className="relative w-full">
      <div className="flex gap-8 items-stretch min-h-96">
        {/* Left: Text Content */}
        <div className="hidden lg:flex flex-col justify-center w-1/3 px-8 py-12">
          <h2 className="text-4xl font-bold mb-4 text-purple-600 ">Premium Technology for Professionals</h2>
          <p className="text-black mb-8 leading-relaxed">
            Discover our curated collection of cutting-edge tech products. From powerful laptops to pristine
            peripherals.
          </p>
          <div className="flex gap-2">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx)
                  setIsAutoPlay(false)
                }}
                className={cn(
                  "h-2 rounded-full transition-all",
                  idx === currentIndex ? "bg-purple-600 w-8" : "bg-gray-300 w-2 hover:bg-gray-400",
                )}
              />
            ))}
          </div>
        </div>

        {/* Right: Large Product Card */}
        {current && (
          <div
            className="w-full  h-1/2 lg:w-2/3 "
            onMouseEnter={() => setIsAutoPlay(false)}
            onMouseLeave={() => setIsAutoPlay(true)}
          >
            <ProductCard product={current} />
          </div>
        )}
      </div>
    </div>
  )
}
