/**
 * FLL Competition Scheduler - Database Connection
 *
 * This file establishes a connection to the MongoDB database.
 */

import mongoose from "mongoose";

/**
 * Connect to the MongoDB database
 * @returns {Promise} A promise that resolves when the connection is established
 */
const connectDB = async () => {
  try {
    // Check if MONGO_URI is provided
    if (!process.env.MONGO_URI) {
      console.log("MongoDB URI not provided - running without database");
      return;
    }

    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.log("Continuing without database connection...");
    // Don't exit the process - allow the server to run without MongoDB
  }
};

export default connectDB;
