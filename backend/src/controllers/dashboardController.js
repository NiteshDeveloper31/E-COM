import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { sendSuccess } from "../utils/response.js";

/**
 * Get Dashboard Core Analytics and KPIs (Admin only).
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total counts
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalProducts = await Product.countDocuments();

    // 2. Total Revenue (sum of all non-cancelled orders)
    const validOrders = await Order.find({
      orderStatus: { $ne: "Cancelled" }
    });
    const totalRevenue = validOrders.reduce((sum, order) => sum + order.total, 0);

    // 3. Recent 5 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email phone");

    // 4. Calculate Bestselling/Top Products
    const allOrders = await Order.find();
    const productStats = {};

    allOrders.forEach((order) => {
      // Avoid counting cancelled order items
      if (order.orderStatus === "Cancelled") return;

      order.items.forEach((item) => {
        const id = item.productId.toString();
        if (!productStats[id]) {
          productStats[id] = {
            id: item.productId,
            name: item.productName,
            price: item.price,
            image: item.image,
            sales: 0,
            revenue: 0
          };
        }
        productStats[id].sales += item.quantity;
        productStats[id].revenue += item.price * item.quantity;
      });
    });

    // Sort descending by sales quantity and slice top 5
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    return sendSuccess(res, "Dashboard analytics calculated successfully.", {
      kpis: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts
      },
      recentOrders,
      topProducts
    });
  } catch (error) {
    next(error);
  }
};
