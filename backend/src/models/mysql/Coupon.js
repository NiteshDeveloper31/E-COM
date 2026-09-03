import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";

export const Coupon = sequelize.define("Coupon", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  discountType: {
    type: DataTypes.ENUM("percentage", "fixed"),
    defaultValue: "percentage"
  },
  discountValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  minOrderValue: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  maxDiscountAmount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  perUserLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active"
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: true
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: "coupons"
});

export default Coupon;
