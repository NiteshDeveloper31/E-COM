import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import { hashPassword } from "./utils/password.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    const dbUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/reetsutra";
    console.log(`Connecting to database at ${dbUri}...`);
    await mongoose.connect(dbUri);
    
    // Check if admin already exists
    const adminExists = await User.findOne({ email: "admin@reetsutra.com" });
    if (adminExists) {
      console.log("Admin account (admin@reetsutra.com) already exists in the database.");
      process.exit(0);
    }

    const hashedPassword = await hashPassword("admin123");
    
    await User.create({
      name: "Super Admin",
      email: "admin@reetsutra.com",
      password: hashedPassword,
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
    });

    console.log("Default Admin user seeded successfully!");
    console.log("-----------------------------------------");
    console.log("Email:    admin@reetsutra.com");
    console.log("Password: admin123");
    console.log("Role:     admin");
    console.log("-----------------------------------------");
    
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();
