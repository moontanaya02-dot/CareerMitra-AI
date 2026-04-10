const mongoose = require("mongoose");

/**
 * 🚀 PRO LEVEL DATABASE CONNECTION
 * Ismein humne retry logic aur connection stability add ki hai.
 */
const connectDB = async () => {
  try {
    // process.env ka use karna pro practice hai, 
    // agar .env file nahi hai toh ye default local DB se connect karega.
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careermitra_ai", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Extra safety: Agar connection drop ho jaye
    mongoose.connection.on("error", (err) => {
      console.error(`❌ Mongoose Connection Error: ${err}`);
    });

  } catch (error) {
    console.error(`❌ Database Connection Failed: ${error.message}`);
    // Server ko turant band karne ke liye process.exit(1) use karte hain
    process.exit(1);
  }
};

module.exports = connectDB;