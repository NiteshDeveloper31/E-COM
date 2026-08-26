import mongoose from "mongoose";

const connectDB = async () => {
  let dbUri = (process.env.MONGODB_URI || "").trim();
  // Strip quotes if user pasted with quotes
  if ((dbUri.startsWith('"') && dbUri.endsWith('"')) || (dbUri.startsWith("'") && dbUri.endsWith("'"))) {
    dbUri = dbUri.slice(1, -1).trim();
  }
  // Strip duplicate key prefix if accidentally pasted MONGODB_URI=
  if (dbUri.startsWith("MONGODB_URI=")) {
    dbUri = dbUri.replace(/^MONGODB_URI=/, "").trim();
  }
  
  try {
    const targetUri = dbUri || "mongodb://127.0.0.1:27017/reetsutra";
    console.log(`Connecting to MongoDB... (${dbUri ? "Atlas Cloud" : "Local Fallback"})`);
    const conn = await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      family: 4
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Keep-alive heartbeat ping every 2 minutes to prevent MongoDB Atlas M0 Cold-Start Sleep
    setInterval(async () => {
      try {
        if (mongoose.connection.readyState === 1) {
          await mongoose.connection.db.admin().ping();
        }
      } catch (pingErr) {
        // Silent ping warning
      }
    }, 120000);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (dbUri && process.env.NODE_ENV === "production") {
      throw error;
    } else {
      try {
        console.log("Attempting fallback to local MongoDB instance...");
        const conn = await mongoose.connect("mongodb://127.0.0.1:27017/reetsutra");
        console.log(`✅ MongoDB Connected (Local Fallback): ${conn.connection.host}`);
      } catch (localErr) {
        console.error(`Local MongoDB Connection also failed: ${localErr.message}`);
      }
    }
  }
};

export default connectDB;
