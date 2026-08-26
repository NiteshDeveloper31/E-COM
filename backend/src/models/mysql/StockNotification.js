import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";
import User from "./User.js";
import Product from "./Product.js";

export const StockNotification = sequelize.define("StockNotification", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: "id"
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: "id"
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("Pending", "Notified"),
    defaultValue: "Pending"
  },
  notifiedAt: DataTypes.DATE
}, {
  tableName: "stock_notifications"
});

StockNotification.belongsTo(Product, { foreignKey: "productId", as: "product" });
StockNotification.belongsTo(User, { foreignKey: "userId", as: "user" });

export default StockNotification;
