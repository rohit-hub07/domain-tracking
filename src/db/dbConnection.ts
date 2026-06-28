import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  throw new Error("DB_URL is not defined in the .env file");
}

// 1. Maintain a global cache object to preserve connections across API hot-reloads
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const dbConnection = async () => {
  // 2. Return immediately if a connection already exists
  if (cached.conn) {
    return cached.conn;
  }

  // 3. Create a new promise chain if no connection is currently pending
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(dbUrl, opts).then((mongooseInstance) => {
      console.log("Connected to database (New Connection Created)");
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null; // Reset promise on failure so next request tries again
    console.log("Failed to connect to the database!", err);
    throw err;
  }

  return cached.conn;
};
