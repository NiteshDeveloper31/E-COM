import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";

export const Category = sequelize.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  image: {
    type: DataTypes.TEXT("long"),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM("Active", "Inactive"),
    defaultValue: "Active"
  }
}, {
  tableName: "categories"
});

export default Category;
