// config/connectDB.js
import mongoose from "mongoose"

export async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || "placeholder_mongodb_url"

    if (mongoURI === "placeholder_mongodb_url") {
      console.warn("WARNING: Using placeholder MongoDB URL. Please set MONGODB_URI in .env file")
      console.warn("Example: MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/v0_database")
    } else {
      // Print presence (mask credentials)
      try {
        const masked = mongoURI.replace(/\/\/([^:@]+):([^@]+)@/, "//<user>:<password>@")
        console.log("[connectDB] Attempting MongoDB connect to:", masked)
      } catch {
        console.log("[connectDB] Attempting MongoDB connect (URI present)")
      }
    }

    // Use recommended options
    await mongoose.connect(mongoURI, {
      // Mongoose 7 doesn't need these but it's safe
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    })

    console.log("[connectDB] MongoDB connected successfully")
    console.log("[connectDB] connection info:", {
      readyState: mongoose.connection.readyState, // 1 == connected
      name: mongoose.connection.name, // DB name
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    })
  } catch (error) {
    console.error("MongoDB connection error:", error && error.message ? error.message : error)
    // do not silently continue — exit so you notice problems during dev
    process.exit(1)
  }
}
