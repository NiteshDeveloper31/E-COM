import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";
import User from "./User.js";

export const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: "id"
    }
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  tax: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  shipping: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  originalSubtotal: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  floatingDiscountTotal: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.ENUM("UPI", "COD", "Card", "NetBanking", "Razorpay"),
    defaultValue: "COD"
  },
  paymentStatus: {
    type: DataTypes.ENUM("Pending", "Paid", "Failed"),
    defaultValue: "Pending"
  },
  razorpayOrderId: DataTypes.STRING,
  razorpayPaymentId: DataTypes.STRING,
  razorpaySignature: DataTypes.STRING,
  orderStatus: {
    type: DataTypes.ENUM("Pending", "Processing", "On Hold", "Shipped", "Delivered", "Cancelled"),
    defaultValue: "Pending"
  },
  isStockDeducted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isSkuVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  shippingCourier: DataTypes.STRING,
  trackingNumber: DataTypes.STRING,
  packetNumber: DataTypes.STRING,
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: true
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  timeline: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: "orders"
});

Order.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Order, { foreignKey: "userId", as: "orders" });

export default Order;
