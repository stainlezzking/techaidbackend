import mongoose from "mongoose";

export const connectDB = async function () {
  await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@optimustechaid.gladz.mongodb.net/techaid`);
  console.log("DB connected successfully");
};
