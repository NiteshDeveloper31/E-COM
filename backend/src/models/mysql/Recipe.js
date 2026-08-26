import { DataTypes } from "sequelize";
import { sequelize } from "../../config/mysql.js";

export const Recipe = sequelize.define("Recipe", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
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
  description: DataTypes.TEXT,
  prepTime: DataTypes.STRING,
  cookTime: DataTypes.STRING,
  servings: DataTypes.STRING,
  ingredients: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  instructions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: "Recipe"
  },
  author: {
    type: DataTypes.STRING,
    defaultValue: "ReetSutra Kitchen"
  },
  badge: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "Active"
  }
}, {
  tableName: "recipes"
});

export default Recipe;
