import express from "express"
import jwt from "jsonwebtoken"
import bcryptjs from "bcryptjs"
import User from "../models/User.js"

const router = express.Router()

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePassword = (password) => {
  return password && password.length >= 6
}

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, gmail, password, role = "user" } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" })
    }
    if (!gmail || !validateEmail(gmail)) {
      return res.status(400).json({ error: "Valid email is required" })
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    const existingUser = await User.findOne({ gmail: gmail.toLowerCase() })
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" })
    }

    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    const newUser = new User({
      id: `user_${Date.now()}`,
      name: name.trim(),
      gmail: gmail.toLowerCase(),
      password: hashedPassword,
      role: ["admin", "user"].includes(role) ? role : "user",
    })

    await newUser.save()

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    })

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    })
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        gmail: newUser.gmail,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("[AUTH_REGISTER]", error)
    res.status(500).json({ error: error.message || "Registration failed" })
  }
})

// Login
router.post("/login", async (req, res) => {
  try {
    const { gmail, password } = req.body

    if (!gmail || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    const user = await User.findOne({ gmail: gmail.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    })

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    })
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        gmail: user.gmail,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[AUTH_LOGIN]", error)
    res.status(500).json({ error: "Login failed" })
  }
})

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token")
  res.json({ message: "Logout successful" })
})

router.get("/verify", (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    res.json({ valid: true, userId: decoded.userId, role: decoded.role })
  } catch (error) {
    console.error("[AUTH_VERIFY]", error)
    res.status(401).json({ error: "Invalid or expired token" })
  }
})

export default router
