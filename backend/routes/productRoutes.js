import express from "express"
import mongoose from "mongoose"
import Product from "../models/Product.js"
import { isAuth } from "../middleware/isAuth.js"
import { isAuthorized } from "../middleware/isAuthorized.js"

const router = express.Router()

/**
 * Basic input validation for creating/updating products
 * Throws Error when validation fails so route handlers can catch and respond.
 */
const validateProductInput = (data) => {
  const { name, price, category } = data
  if (!name || !price || !category) {
    throw new Error("Name, price, and category are required")
  }
  if (typeof price !== "number" || price < 0) {
    throw new Error("Price must be a positive number")
  }
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Name must be a non-empty string")
  }
}

/**
 * Search products by query (name / description / category)
 */
router.get("/search/query", async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query required" })
    }
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    }).select("-__v")
    res.json(products)
  } catch (error) {
    console.error("[PRODUCT_SEARCH]", error)
    res.status(500).json({ error: "Search failed" })
  }
})

/**
 * Get products by category (category param expected to match stored category value)
 */
router.get("/category/:category", async (req, res) => {
  try {
    const category = req.params.category
    const products = await Product.find({ category: category.toLowerCase() }).select("-__v")
    res.json(products)
  } catch (error) {
    console.error("[PRODUCT_GET_BY_CATEGORY]", error)
    res.status(500).json({ error: "Failed to fetch products by category" })
  }
})

/**
 * Get all reviews for a product
 */
router.get("/:id/reviews", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("rate_comments")
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    const reviews = product.rate_comments.map((comment, idx) => {
      try {
        return { id: idx, ...JSON.parse(comment) }
      } catch (e) {
        return { id: idx, comment, userName: "Anonymous", rating: 0 }
      }
    })

    res.json({ reviews })
  } catch (error) {
    console.error("[PRODUCT_GET_REVIEWS]", error)
    res.status(500).json({ error: "Failed to fetch reviews" })
  }
})

/**
 * Submit a review for a product (authenticated users only)
 */
router.post("/:id/review", isAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const productId = req.params.id

    if (!rating || !comment) {
      return res.status(400).json({ error: "Rating and comment are required" })
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    if (comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment cannot be empty" })
    }

    // Check if user has purchased this product
    const User = (await import("../models/User.js")).default
    const Order = (await import("../models/Order.js")).default

    const user = await User.findById(req.userId)
    const userOrders = await Order.find({ user_associated: req.userId })

    const hasPurchased = userOrders.some((order) => order.item_associated.some((item) => item.productId === productId))

    if (!hasPurchased) {
      return res.status(403).json({ error: "You can only review products you've purchased" })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Add review to product's rate_comments
    const reviewData = JSON.stringify({
      userName: user.name,
      rating,
      comment,
      date: new Date().toISOString().split("T")[0],
      verified: true,
    })

    product.rate_comments.push(reviewData)
    await product.save()

    res.status(201).json({
      message: "Review submitted successfully",
      product,
    })
  } catch (error) {
    console.error("[PRODUCT_ADD_REVIEW]", error)
    res.status(500).json({ error: "Failed to submit review" })
  }
})

/**
 * Get all products
 * - Added debug logging to help surface DB/connection info during development.
 */
router.get("/", async (req, res) => {
  try {
    // countDocuments can help debug if the collection in the connected DB has items
    let count = null
    try {
      count = await Product.countDocuments()
    } catch (err) {
      console.warn("[PRODUCT_GET_ALL] countDocuments error:", err && err.message)
    }

    const products = await Product.find().select("-__v")

    console.log(
      `[PRODUCT_GET_ALL] returned ${Array.isArray(products) ? products.length : 0} products (countDocuments: ${count}) using DB: ${mongoose.connection.name}`,
    )

    res.json(products)
  } catch (error) {
    console.error("[PRODUCT_GET_ALL]", error)
    res.status(500).json({ error: "Failed to fetch products" })
  }
})

/**
 * Get single product by MongoDB _id
 * NOTE: This route MUST come after all specific routes (/:id/reviews, /:id/review)
 */
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("-__v")
    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    console.error("[PRODUCT_GET_ONE]", error)
    res.status(404).json({ error: "Product not found" })
  }
})

/**
 * Create product (admin only)
 */
router.post("/", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const { name, price, rating, description, images, category, stock } = req.body

    validateProductInput({ name, price, category })

    const newProduct = new Product({
      id: `product_${Date.now()}`,
      name: name.trim(),
      price,
      rating: rating || 0,
      description: description?.trim() || "",
      images: Array.isArray(images) ? images : [],
      category: category.toLowerCase(),
      stock: Math.max(0, stock || 0),
    })

    await newProduct.save()
    res.status(201).json({ message: "Product created successfully", product: newProduct })
  } catch (error) {
    console.error("[PRODUCT_CREATE]", error)
    res.status(400).json({ error: error.message || "Failed to create product" })
  }
})

/**
 * Update product (admin only)
 */
router.put("/:id", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const { name, price, rating, description, images, category, stock } = req.body

    if (price !== undefined) {
      if (typeof price !== "number" || price < 0) {
        throw new Error("Price must be a positive number")
      }
    }

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (price !== undefined) updateData.price = price
    if (rating !== undefined) updateData.rating = Math.min(5, Math.max(0, rating))
    if (description) updateData.description = description.trim()
    if (images) updateData.images = Array.isArray(images) ? images : []
    if (category) updateData.category = category.toLowerCase()
    if (stock !== undefined) updateData.stock = Math.max(0, stock)
    updateData.updatedAt = new Date()

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-__v")

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json({ message: "Product updated successfully", product })
  } catch (error) {
    console.error("[PRODUCT_UPDATE]", error)
    res.status(400).json({ error: error.message || "Failed to update product" })
  }
})

/**
 * Delete product (admin only)
 */
router.delete("/:id", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json({ message: "Product deleted successfully", productId: req.params.id })
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error)
    res.status(500).json({ error: "Failed to delete product" })
  }
})

export default router
