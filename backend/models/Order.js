import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  order_date: { type: Date, default: Date.now },
  order_sendlocation: {
    city: { type: String },
    state: { type: String },
    zipcode: { type: String },
  },
  item_associated: [
    {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  user_associated: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model("Order", orderSchema)
