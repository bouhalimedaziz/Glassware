import express from "express"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import User from "../models/User.js"
import { isAuth } from "../middleware/isAuth.js"
import { isAuthorized } from "../middleware/isAuthorized.js"

const router = express.Router()

const validateOrderInput = async (data) => {
  const { order_sendlocation, item_associated, totalAmount } = data

  if (!order_sendlocation || !order_sendlocation.city || !order_sendlocation.state || !order_sendlocation.zipcode) {
    throw new Error("Complete shipping address required")
  }

  if (!Array.isArray(item_associated) || item_associated.length === 0) {
    throw new Error("Order must contain at least one item")
  }

  for (const item of item_associated) {
    if (!item.productId || !item.quantity) {
      throw new Error("Invalid item format")
    }
    const product = await Product.findById(item.productId)
    if (!product) {
      throw new Error(`Product ${item.productId} not found`)
    }
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`)
    }
  }

  if (typeof totalAmount !== "number" || totalAmount <= 0) {
    throw new Error("Invalid total amount")
  }
}

// Get user's orders
router.get("/user", isAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user_associated: req.userId })
      .populate("user_associated", "-password -__v")
      .sort({ order_date: -1 })
      .select("-__v")

    res.json(orders)
  } catch (error) {
    console.error("[ORDER_GET_USER]", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Get all orders (admin only)
router.get("/", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_associated", "-password -__v")
      .sort({ order_date: -1 })
      .select("-__v")

    res.json(orders)
  } catch (error) {
    console.error("[ORDER_GET_ALL]", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Create order
router.post("/", isAuth, async (req, res) => {
  try {
    const { order_sendlocation, item_associated, totalAmount } = req.body

    await validateOrderInput({ order_sendlocation, item_associated, totalAmount })

    const newOrder = new Order({
      id: `order_${Date.now()}`,
      order_date: new Date(),
      order_sendlocation: {
        city: order_sendlocation.city.trim(),
        state: order_sendlocation.state.trim(),
        zipcode: order_sendlocation.zipcode.trim(),
      },
      item_associated: item_associated.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      user_associated: req.userId,
      totalAmount,
      status: "pending",
    })

    await newOrder.save()

    await User.findByIdAndUpdate(req.userId, { $push: { orders: newOrder._id } })

    for (const item of item_associated) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
    }

    res.status(201).json({ message: "Order created successfully", order: newOrder })
  } catch (error) {
    console.error("[ORDER_CREATE]", error)
    res.status(400).json({ error: error.message || "Failed to create order" })
  }
})

// Update order status (admin only)
router.put("/:id", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const { status } = req.body

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` })
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status, updatedAt: new Date() }, { new: true })
      .populate("user_associated", "-password -__v")
      .select("-__v")

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    res.json({ message: "Order updated successfully", order })
  } catch (error) {
    console.error("[ORDER_UPDATE]", error)
    res.status(400).json({ error: error.message || "Failed to update order" })
  }
})

router.delete("/:id", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    // Restore product stock if order was cancelled
    for (const item of order.item_associated) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } })
    }

    // Remove order from user's orders array
    await User.findByIdAndUpdate(order.user_associated, { $pull: { orders: order._id } })

    res.json({ message: "Order deleted successfully", orderId: req.params.id })
  } catch (error) {
    console.error("[ORDER_DELETE]", error)
    res.status(500).json({ error: "Failed to delete order" })
  }
})

export default router
