import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import OrderMySQL from "../models/mysql/Order.js";
import UserMySQL from "../models/mysql/User.js";
import ProductMySQL from "../models/mysql/Product.js";
import { sendSuccess } from "../utils/response.js";
import { Op } from "sequelize";

/**
 * Get Dashboard Core Analytics and KPIs (Admin only).
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    let totalOrders = 0;
    let totalCustomers = 0;
    let totalProducts = 0;
    let totalRevenue = 0;
    let recentOrders = [];
    let topProducts = [];

    try {
      totalOrders = await OrderMySQL.count();
      totalCustomers = await UserMySQL.count({ where: { role: "customer" } });
      totalProducts = await ProductMySQL.count();

      const validOrders = await OrderMySQL.findAll({
        where: { orderStatus: { [Op.ne]: "Cancelled" } }
      });
      totalRevenue = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      recentOrders = await OrderMySQL.findAll({
        include: [{ model: UserMySQL, as: "user", attributes: ["name", "email", "phone"] }],
        order: [["id", "DESC"]],
        limit: 5
      });

      const allOrders = await OrderMySQL.findAll();
      const productStats = {};

      allOrders.forEach((order) => {
        if (order.orderStatus === "Cancelled") return;
        const items = order.items || [];
        items.forEach((item) => {
          const id = String(item.productId);
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
          productStats[id].sales += item.quantity || 1;
          productStats[id].revenue += (item.price || 0) * (item.quantity || 1);
        });
      });

      topProducts = Object.values(productStats)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

    } catch (mysqlErr) {
      totalOrders = await Order.countDocuments().catch(() => 0);
      totalCustomers = await User.countDocuments({ role: "customer" }).catch(() => 0);
      totalProducts = await Product.countDocuments().catch(() => 0);
      const validOrders = await Order.find({ orderStatus: { $ne: "Cancelled" } }).catch(() => []);
      totalRevenue = validOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("userId", "name email phone").catch(() => []);
    }

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
