import express from "express"
import bcryptjs from "bcryptjs"
import User from "../models/User.js"
import { isAuth } from "../middleware/isAuth.js"
import { isAuthorized } from "../middleware/isAuthorized.js"

const router = express.Router()

// Get current user profile
router.get("/profile", isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("orders").select("-password -__v")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("[USER_GET_PROFILE]", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

// Update user profile
router.put("/profile", isAuth, async (req, res) => {
  try {
    const { name, gmail, profileImage, creditCard } = req.body

    const updateData = {}
    if (name) {
      if (name.trim().length === 0) {
        throw new Error("Name cannot be empty")
      }
      updateData.name = name.trim()
    }
    if (gmail) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!re.test(gmail)) {
        throw new Error("Invalid email format")
      }
      const exists = await User.findOne({ gmail: gmail.toLowerCase(), _id: { $ne: req.userId } })
      if (exists) {
        throw new Error("Email already in use")
      }
      updateData.gmail = gmail.toLowerCase()
    }
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage
    }
    if (creditCard) {
      updateData.creditCard = creditCard
    }
    updateData.updatedAt = new Date()

    const user = await User.findByIdAndUpdate(req.userId, updateData, { new: true }).select("-password -__v")

    res.json({ message: "Profile updated successfully", user })
  } catch (error) {
    console.error("[USER_UPDATE_PROFILE]", error)
    res.status(400).json({ error: error.message || "Failed to update profile" })
  }
})

router.put("/password", isAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" })
    }

    const user = await User.findById(req.userId)
    const isValid = await bcryptjs.compare(oldPassword, user.password)
    if (!isValid) {
      return res.status(401).json({ error: "Old password is incorrect" })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(newPassword, salt)

    await User.findByIdAndUpdate(req.userId, { password: hashedPassword, updatedAt: new Date() })

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("[USER_UPDATE_PASSWORD]", error)
    res.status(500).json({ error: "Failed to update password" })
  }
})

// Add address
router.post("/address", isAuth, async (req, res) => {
  try {
    const { city, state, zipcode } = req.body

    if (!city || !state || !zipcode) {
      return res.status(400).json({ error: "City, state, and zipcode are required" })
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $push: {
          addresses: { city: city.trim(), state: state.trim(), zipcode: zipcode.trim(), createdAt: new Date() },
        },
      },
      { new: true },
    ).select("-password -__v")

    res.json({ message: "Address added successfully", user })
  } catch (error) {
    console.error("[USER_ADD_ADDRESS]", error)
    res.status(400).json({ error: "Failed to add address" })
  }
})

router.put("/address/:addressId", isAuth, async (req, res) => {
  try {
    const { city, state, zipcode } = req.body
    const { addressId } = req.params

    if (!city || !state || !zipcode) {
      return res.status(400).json({ error: "City, state, and zipcode are required" })
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          "addresses.$[elem].city": city.trim(),
          "addresses.$[elem].state": state.trim(),
          "addresses.$[elem].zipcode": zipcode.trim(),
        },
      },
      { arrayFilters: [{ "elem._id": addressId }], new: true },
    ).select("-password -__v")

    res.json({ message: "Address updated successfully", user })
  } catch (error) {
    console.error("[USER_UPDATE_ADDRESS]", error)
    res.status(400).json({ error: "Failed to update address" })
  }
})

router.delete("/address/:addressId", isAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { addresses: { _id: req.params.addressId } } },
      { new: true },
    ).select("-password -__v")

    res.json({ message: "Address deleted successfully", user })
  } catch (error) {
    console.error("[USER_DELETE_ADDRESS]", error)
    res.status(500).json({ error: "Failed to delete address" })
  }
})

router.post("/wishlist/:productId", isAuth, async (req, res) => {
  try {
    const { productId } = req.params

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" })
    }

    const user = await User.findByIdAndUpdate(req.userId, { $addToSet: { wishlist: productId } }, { new: true }).select(
      "-password -__v",
    )

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ message: "Added to wishlist", user })
  } catch (error) {
    console.error("[USER_ADD_WISHLIST]", error)
    res.status(400).json({ error: error.message || "Failed to add to wishlist" })
  }
})

router.delete("/wishlist/:productId", isAuth, async (req, res) => {
  try {
    const { productId } = req.params

    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" })
    }

    const user = await User.findByIdAndUpdate(req.userId, { $pull: { wishlist: productId } }, { new: true }).select(
      "-password -__v",
    )

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ message: "Removed from wishlist", user })
  } catch (error) {
    console.error("[USER_REMOVE_WISHLIST]", error)
    res.status(400).json({ error: error.message || "Failed to remove from wishlist" })
  }
})

// Admin: Get all users
router.get("/", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password -__v")
    res.json(users)
  } catch (error) {
    console.error("[USER_GET_ALL]", error)
    res.status(500).json({ error: "Failed to fetch users" })
  }
})

// Admin: Delete user
router.delete("/:id", isAuth, isAuthorized(["admin"]), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ message: "User deleted successfully", userId: req.params.id })
  } catch (error) {
    console.error("[USER_DELETE]", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
})

export default router
