import mongoose from "mongoose"
import Product from "../models/Product.js"
import dotenv from "dotenv"

dotenv.config()

const products = [
  {
    id: "product_1",
    name: "iPhone 15 Pro Max",
    price: 2499,
    rating: 4.8,
    description: "Latest flagship Apple smartphone with advanced camera system",
    images: [
      "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&q=80",
      "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&q=80",
    ],
    category: "phones",
    stock: 25,
    isFeatured: true,
  },
  {
    id: "product_2",
    name: "Samsung Galaxy S24 Ultra",
    price: 2199,
    rating: 4.7,
    description: "Powerful Android flagship with S Pen stylus and excellent display",
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf7e0b254?w=500&q=80",
      "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&q=80",
    ],
    category: "phones",
    stock: 30,
    isFeatured: true,
  },
  {
    id: "product_3",
    name: "MacBook Pro 16 M3 Max",
    price: 3999,
    rating: 4.9,
    description: "Professional laptop with M3 Max chip for creative professionals",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
      "https://images.unsplash.com/photo-1588872657840-790ff3bde791?w=500&q=80",
    ],
    category: "laptops",
    stock: 15,
    isFeatured: true,
  },
  {
    id: "product_4",
    name: "Dell XPS 15",
    price: 2499,
    rating: 4.6,
    description: "High-performance ultrabook with InfinityEdge display",
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&q=80",
      "https://images.unsplash.com/photo-1588872657840-790ff3bde791?w=500&q=80",
    ],
    category: "laptops",
    stock: 20,
  },
  {
    id: "product_5",
    name: "Sony WH-1000XM5",
    price: 799,
    rating: 4.8,
    description: "Premium noise-cancelling wireless headphones with exceptional sound",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&q=80",
    ],
    category: "headsets",
    stock: 40,
    isFeatured: true,
  },
  {
    id: "product_6",
    name: "Bose QuietComfort 45",
    price: 649,
    rating: 4.5,
    description: "Comfortable and lightweight noise-cancelling headphones",
    images: [
      "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=500&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
    ],
    category: "headsets",
    stock: 35,
  },
  {
    id: "product_7",
    name: "Mechanical Gaming Keyboard RGB",
    price: 349,
    rating: 4.7,
    description: "Professional mechanical keyboard with customizable RGB lighting",
    images: [
      "https://images.unsplash.com/photo-1587829191301-26da3d115dc1?w=500&q=80",
      "https://images.unsplash.com/photo-1595225476942-d1262a7e00de?w=500&q=80",
    ],
    category: "keyboards",
    stock: 50,
  },
  {
    id: "product_8",
    name: "Logitech MX Keys",
    price: 249,
    rating: 4.6,
    description: "Compact mechanical keyboard for professionals",
    images: [
      "https://images.unsplash.com/photo-1595225476942-d1262a7e00de?w=500&q=80",
      "https://images.unsplash.com/photo-1587829191301-26da3d115dc1?w=500&q=80",
    ],
    category: "keyboards",
    stock: 45,
  },
  {
    id: "product_9",
    name: "Logitech MX Master 3S",
    price: 299,
    rating: 4.8,
    description: "Advanced productivity mouse with customizable buttons",
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    ],
    category: "mouses",
    stock: 55,
  },
  {
    id: "product_10",
    name: "Razer DeathAdder V3",
    price: 199,
    rating: 4.5,
    description: "Gaming mouse with precision tracking and ergonomic design",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80",
    ],
    category: "mouses",
    stock: 60,
  },
  {
    id: "product_11",
    name: 'Samsung 4K Smart Monitor 32"',
    price: 1299,
    rating: 4.7,
    description: "Large 4K display with built-in smart TV features",
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500&q=80",
    ],
    category: "monitors",
    stock: 18,
    isFeatured: true,
  },
  {
    id: "product_12",
    name: 'Dell UltraSharp 27"',
    price: 799,
    rating: 4.6,
    description: "Professional color-accurate monitor for designers",
    images: [
      "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=500&q=80",
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80",
    ],
    category: "monitors",
    stock: 22,
  },
]

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    await Product.deleteMany({})
    console.log("Cleared existing products")

    const result = await Product.insertMany(products)
    console.log(`Successfully seeded ${result.length} products`)

    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

seedProducts()
