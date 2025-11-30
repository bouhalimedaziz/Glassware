import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  gmail: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  profileImage: { type: String, default: null },
  creditCard: {
    cardName: { type: String },
    cardNumber: { type: String },
    expiryDate: { type: String },
    cvv: { type: String },
  },
  payment: {
    cardName: { type: String },
    cardNumber: { type: String },
    expiryDate: { type: String },
    cvv: { type: String },
  },
  wishlist: [{ type: String }],
  addresses: [
    {
      city: { type: String },
      state: { type: String },
      zipcode: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

export default mongoose.model("User", userSchema)
