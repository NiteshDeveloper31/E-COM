import mongoose from "mongoose";

const MONGO_URI = "mongodb://127.0.0.1:27017/reetsutra";

async function main() {
  await mongoose.connect(MONGO_URI);
  
  const db = mongoose.connection.db;
  const orders = await db.collection("orders").find().toArray();
  console.log("--- ORDERS SUMMARY ---");
  orders.forEach((o) => {
    console.log(`Order ID: ${o._id}, Total: ₹${o.total}, Method: ${o.paymentMethod}, PaymentStatus: ${o.paymentStatus}, OrderStatus: ${o.orderStatus}`);
  });

  await mongoose.disconnect();
}

main().catch(console.error);
