import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  rate_comments: [{ type: String }],
  description: { type: String },
  images: [{ type: String }],
  category: { type: String },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model("Product", productSchema)
