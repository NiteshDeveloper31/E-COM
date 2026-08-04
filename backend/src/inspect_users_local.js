import mongoose from "mongoose";
import User from "./models/User.js";
import Order from "./models/Order.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/reetsutra";

async function main() {
  await mongoose.connect(MONGO_URI);
  
  const query = { role: "customer" };
  const totalCustomers = await User.countDocuments(query);
  const customers = await User.find(query).sort({ createdAt: -1 });

  console.log("Total Customers Count in DB:", totalCustomers);
  
  const customersWithStats = await Promise.all(
    customers.map(async (cust) => {
      const orders = await Order.find({ userId: cust._id });
      const ordersCount = orders.length;
      const totalSpending = orders
        .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
        .reduce((sum, o) => sum + o.total, 0);

      return {
        id: cust._id,
        name: cust.name,
        email: cust.email,
        registrationDate: cust.createdAt ? cust.createdAt.toISOString().slice(0, 10) : null,
        totalOrders: ordersCount,
        totalSpending: totalSpending,
        status: "Active"
      };
    })
  );

  console.log("Response data:", JSON.stringify(customersWithStats, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
