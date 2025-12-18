"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import ProductCard from "../components/products/ProductCard"
import { getAllProducts, sortProducts, getCategories } from "../lib/products"

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState("featured")
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching shop products")
        const allProducts = await getAllProducts()
        console.log("Shop products fetched:", allProducts)

        const cats = await getCategories()
        console.log("Shop categories:", cats)

        setProducts(allProducts)
        setCategories(["All", ...cats])
      } catch (error) {
        console.error("Shop fetch error:", error)
        setProducts([])
        setCategories(["All"])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const category = searchParams.get("category")

  let filteredProducts =
    category && category !== "all"
      ? products.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
      : products

  if (searchTerm.trim()) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  filteredProducts = sortProducts(filteredProducts, sortBy)

  const priceRanges = [
    { label: "All Prices", min: 0, max: Number.POSITIVE_INFINITY },
    { label: "Under $100", min: 0, max: 100 },
    { label: "$100 - $500", min: 100, max: 500 },
    { label: "$500 - $1000", min: 500, max: 1000 },
    { label: "Over $1000", min: 1000, max: Number.POSITIVE_INFINITY },
  ]

  const filteredByPrice = useMemo(() => {
    const priceRange = searchParams.get("price") || "all"
    const range = priceRanges.find((r) => r.label.replace(/\s+/g, "-").toLowerCase() === priceRange)
    if (!range) return filteredProducts
    return filteredProducts.filter((p) => p.price >= range.min && p.price <= range.max)
  }, [filteredProducts, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Shop Premium Tech</h1>
          <p className="text-gray-600">Discover our curated collection of cutting-edge technology products</p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search products, brands, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 bg-white text-black placeholder-gray-500"
          />
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-56 space-y-6">
            {/* Category Filter */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <span className="text-purple-600">▪</span> Categories
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (cat === "All") {
                        setSearchParams({})
                      } else {
                        setSearchParams({ category: cat.toLowerCase() })
                      }
                    }}
                    className={`block text-sm w-full text-left px-3 py-2 rounded transition-all hover:scale-105 ${
                      (cat === "All" && !category) || category === cat.toLowerCase()
                        ? "font-bold text-white bg-purple-600"
                        : "text-gray-600 hover:text-purple-600"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <span className="text-purple-600">▪</span> Price Range
              </h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setSearchParams({ price: range.label.replace(/\s+/g, "-").toLowerCase() })}
                    className="block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded hover:bg-purple-50"
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h3 className="font-bold text-black mb-4 flex items-center gap-2">
                <span className="text-purple-600">▪</span> Rating
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    className="block text-sm text-gray-600 hover:text-purple-600 transition-colors px-3 py-2 rounded hover:bg-purple-50"
                  >
                    {"★".repeat(rating)}
                    {"☆".repeat(5 - rating)} & up
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-200">
              <p className="text-sm font-semibold text-gray-600">{filteredByPrice.length} products found</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-purple-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-black font-medium hover:border-purple-700 transition-colors"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredByPrice.length > 0 ? (
                filteredByPrice.map((product) => <ProductCard key={product._id || product.id} product={product} />)
              ) : (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg font-medium">No products found</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
