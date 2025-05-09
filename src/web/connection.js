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
    const con = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${con.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
