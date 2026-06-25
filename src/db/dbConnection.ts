import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const dbConnection = async () => {
  const dbUrl = process.env.DB_URL;
  // console.log("dburl: ",dbUrl)
  if (!dbUrl) {
    throw new Error("DB_URL is not defined in the .env file");
  }

  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to database");
  } catch (err) {
    console.log("Failed to connect to the database!", err);
  }
};