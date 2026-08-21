import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/reetsutra";
    const conn = await mongoose.connect(dbUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Failed: ${error.message}`);
    console.log("Attempting fallback to local MongoDB instance...");
    try {
      const conn = await mongoose.connect("mongodb://127.0.0.1:27017/reetsutra");
      console.log(`MongoDB Connected (Local Fallback): ${conn.connection.host}`);
    } catch (localErr) {
      console.error(`Local MongoDB Connection also failed: ${localErr.message}`);
    }
  }
};

export default connectDB;
