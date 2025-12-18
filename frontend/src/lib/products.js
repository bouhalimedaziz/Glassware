// src/lib/products.js
import { productsApi } from "./api"

let productCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const getFromCache = () => {
  if (productCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return productCache
  }
  return null
}

const setCache = (products) => {
  productCache = products
  cacheTimestamp = Date.now()
}

// helper: slugify to build handles
function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

// Map a raw backend product into the shape expected by the frontend components
function mapProduct(raw = {}) {
  // backend fields: _id, id, name, price, rating, rate_comments, description, images, category, stock, createdAt, updatedAt
  const _id = raw._id || raw.id || null
  const name = raw.name || raw.title || "Untitled Product"
  const images = Array.isArray(raw.images) ? raw.images : (raw.images ? [raw.images] : [])
  const image = images[0] || raw.image || "/placeholder.svg"

  // ensure variants exist so ProductCard's selectedVariant won't fail
  const variants =
    Array.isArray(raw.variants) && raw.variants.length > 0
      ? raw.variants
      : [
          {
            id: raw.id || _id || "default",
            price: raw.price ?? 0,
            title: name,
            available: typeof raw.stock === "number" ? raw.stock > 0 : true,
          },
        ]

  return {
    // raw copy if needed
    raw,

    // canonical fields
    _id,
    id: raw.id || _id,

    // UI-friendly fields used across components
    title: name,
    name,
    price: raw.price ?? 0,
    rating: typeof raw.rating === "number" ? raw.rating : 0,
    reviews: Array.isArray(raw.rate_comments) ? raw.rate_comments.length : raw.reviews ?? 0,
    description: raw.description ?? "",
    image,
    images,
    category: raw.category ?? "uncategorized",
    stock: typeof raw.stock === "number" ? raw.stock : raw.stock ? Number(raw.stock) : 0,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,

    // UX helpers that your UI uses
    isFeatured: !!raw.isFeatured || !!raw.featured || false,
    handle: raw.handle || slugify(name),
    variants,
  }
}

async function normalizeArrayResponse(res) {
  if (!res) return []
  // server might return { data: [...] } or array directly
  if (Array.isArray(res)) {
    return res.map(mapProduct)
  }
  if (res && Array.isArray(res.data)) {
    return res.data.map(mapProduct)
  }
  // sometimes endpoint returns { products: [...] }
  if (res && Array.isArray(res.products)) {
    return res.products.map(mapProduct)
  }
  // fallback: if object resembles a single product, return single mapped in array
  if (typeof res === "object") {
    return [mapProduct(res)]
  }
  return []
}

// === Public API (keeps same function names as before) ===

export async function getAllProducts() {
  try {
    const cached = getFromCache()
    if (cached) return cached

    // call productsApi as before
    const data = await productsApi.getAll()
    // normalize
    const products = await normalizeArrayResponse(data)
    setCache(products)
    return products
  } catch (error) {
    console.error("[GET_ALL_PRODUCTS]", error)
    return []
  }
}

export async function getProductById(id) {
  try {
    if (!id) return null
    // try direct fetch (server endpoint expects Mongo _id)
    try {
      const raw = await productsApi.getById(id)
      if (raw) return mapProduct(raw)
    } catch (err) {
      // if direct fetch fails (404 or other), fallback to scanning all products
      // console.warn("[getProductById] direct fetch failed, falling back to list scan", err)
    }

    const all = await getAllProducts()
    return all.find((p) => p._id === id || p.id === id || p.handle === id) || null
  } catch (error) {
    console.error("[GET_PRODUCT_BY_ID]", error)
    return null
  }
}

export async function getProductsByCategory(category) {
  try {
    if (!category) return []
    const data = await productsApi.getByCategory(category)
    const products = await normalizeArrayResponse(data)
    return products
  } catch (error) {
    console.error("[GET_PRODUCTS_BY_CATEGORY]", error)
    return []
  }
}

export async function searchProducts(query) {
  try {
    if (!query) return []
    const data = await productsApi.search(query)
    const products = await normalizeArrayResponse(data)
    return products
  } catch (error) {
    console.error("[SEARCH_PRODUCTS]", error)
    return []
  }
}

export function sortProducts(products, sortBy) {
  const sorted = Array.isArray(products) ? [...products] : []
  switch (sortBy) {
    case "price-low":
      return sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
    case "price-high":
      return sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    case "newest":
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    case "popular":
      // heuristic: rating * reviews
      return sorted.sort((a, b) => (b.rating ?? 0) * (b.reviews ?? 0) - (a.rating ?? 0) * (a.reviews ?? 0))
    case "rating":
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    default:
      return sorted
  }
}

export async function getCategories() {
  try {
    const products = await getAllProducts()
    const categories = new Set()
    products.forEach((p) => {
      if (p && p.category) categories.add(String(p.category))
    })
    return Array.from(categories)
  } catch (error) {
    console.error("[GET_CATEGORIES]", error)
    return []
  }
}

// keep backward-compatibility helper
export async function getProductByHandle(handle) {
  try {
    if (!handle) return null
    const all = await getAllProducts()
    return all.find((p) => p.handle === handle || p._id === handle || p.id === handle) || null
  } catch (error) {
    console.error("[GET_PRODUCT_BY_HANDLE]", error)
    return null
  }
}
