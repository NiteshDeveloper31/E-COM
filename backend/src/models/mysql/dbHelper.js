import UserMySQL from "./User.js";
import CategoryMySQL from "./Category.js";
import ProductMySQL from "./Product.js";
import OrderMySQL from "./Order.js";
import BannerMySQL from "./Banner.js";
import RecipeMySQL from "./Recipe.js";

// Mongo models for fallback
import MongoUser from "../User.js";
import MongoCategory from "../Category.js";
import MongoProduct from "../Product.js";
import MongoOrder from "../Order.js";
import MongoBanner from "../Banner.js";
import MongoRecipe from "../Recipe.js";

export const findUserByEmail = async (email) => {
  try {
    const clean = String(email || "").trim().toLowerCase();
    const sqlUser = await UserMySQL.findOne({ where: { email: clean } });
    if (sqlUser) return sqlUser;
    return await MongoUser.findOne({ email: clean }).catch(() => null);
  } catch (err) {
    return await MongoUser.findOne({ email: String(email || "").trim().toLowerCase() }).catch(() => null);
  }
};

export const findUserById = async (id) => {
  try {
    let user = null;
    const numId = Number(id);
    if (!isNaN(numId) && Number.isInteger(numId)) {
      user = await UserMySQL.findByPk(numId);
    }
    if (!user && typeof id === "string" && id.length === 24) {
      user = await MongoUser.findById(id).catch(() => null);
    }
    return user;
  } catch (err) {
    return null;
  }
};
