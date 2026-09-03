import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";

export const GRN = sequelize.define("GRN", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sku: {
    type: DataTypes.STRING,
    defaultValue: "N/A"
  },
  weight: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  previousStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  receivedQty: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  goodQty: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  badQty: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  newStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT,
    defaultValue: ""
  },
  processedBy: {
    type: DataTypes.STRING,
    defaultValue: "Admin User"
  }
}, {
  tableName: "grn_entries"
});

export default GRN;
