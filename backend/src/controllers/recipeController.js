import Recipe from "../models/Recipe.js";
import RecipeMySQL from "../models/mysql/Recipe.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { saveBase64Image } from "../utils/fileUpload.js";

export const getPublicRecipes = async (req, res, next) => {
  try {
    let mysqlRecipes = [];
    try {
      mysqlRecipes = await RecipeMySQL.findAll({ where: { status: "Active" }, order: [["id", "DESC"]] });
    } catch (mysqlErr) {}

    const mongoRecipes = await Recipe.find({ status: "Active" }).sort({ createdAt: -1 }).catch(() => []);

    const titleSet = new Set();
    const recipes = [];

    for (const r of [...mysqlRecipes, ...mongoRecipes]) {
      const titleClean = String(r.title || "").toLowerCase().trim();
      if (titleClean && !titleSet.has(titleClean)) {
        titleSet.add(titleClean);
        recipes.push(r);
      }
    }

    return sendSuccess(res, "Recipes fetched successfully.", recipes);
  } catch (error) {
    next(error);
  }
};

export const getAllRecipes = async (req, res, next) => {
  try {
    let mysqlRecipes = [];
    try {
      mysqlRecipes = await RecipeMySQL.findAll({ order: [["id", "DESC"]] });
    } catch (mysqlErr) {}

    const mongoRecipes = await Recipe.find().sort({ createdAt: -1 }).catch(() => []);

    const titleSet = new Set();
    const recipes = [];

    for (const r of [...mysqlRecipes, ...mongoRecipes]) {
      const titleClean = String(r.title || "").toLowerCase().trim();
      if (titleClean && !titleSet.has(titleClean)) {
        titleSet.add(titleClean);
        recipes.push(r);
      }
    }

    return sendSuccess(res, "All recipes fetched for admin.", recipes);
  } catch (error) {
    next(error);
  }
};

export const createRecipe = async (req, res, next) => {
  try {
    const { title, image, prepTime, cookTime, servings, shortDescription, ingredients, instructions, category, author, badge, status } = req.body;

    if (!title) {
      return sendError(res, "Title is required.", 400);
    }
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const savedImage = saveBase64Image(image, 'recipes');

    let newRecipe = null;
    try {
      newRecipe = await RecipeMySQL.create({
        title,
        slug,
        image: savedImage || "",
        description: shortDescription || "",
        prepTime: prepTime || "",
        cookTime: cookTime || "",
        servings: servings || "",
        ingredients: ingredients || [],
        instructions: instructions || [],
        category: category || "Recipe",
        author: author || "ReetSutra Kitchen",
        badge: badge || "",
        status: status || "Active"
      });
    } catch (mysqlErr) {
      newRecipe = await Recipe.create({
        title,
        slug,
        image,
        description: shortDescription,
        prepTime,
        cookTime,
        servings,
        ingredients,
        instructions,
        category: category || "Recipe",
        author: author || "ReetSutra Kitchen",
        badge: badge || "",
        status: status || "Active"
      });
    }

    return sendSuccess(res, "Recipe created successfully.", newRecipe, 201);
  } catch (error) {
    next(error);
  }
};

export const editRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    let recipe = null;

    if (req.body.image) {
      req.body.image = saveBase64Image(req.body.image, 'recipes');
    }

    if (!isNaN(id)) {
      recipe = await RecipeMySQL.findByPk(Number(id));
      if (recipe) {
        if (req.body.title) {
          recipe.title = req.body.title;
          recipe.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        }
        if (req.body.image !== undefined) recipe.image = req.body.image;
        if (req.body.shortDescription !== undefined) recipe.description = req.body.shortDescription;
        if (req.body.prepTime !== undefined) recipe.prepTime = req.body.prepTime;
        if (req.body.cookTime !== undefined) recipe.cookTime = req.body.cookTime;
        if (req.body.servings !== undefined) recipe.servings = req.body.servings;
        if (req.body.ingredients !== undefined) recipe.ingredients = req.body.ingredients;
        if (req.body.instructions !== undefined) recipe.instructions = req.body.instructions;
        if (req.body.category !== undefined) recipe.category = req.body.category;
        if (req.body.author !== undefined) recipe.author = req.body.author;
        if (req.body.badge !== undefined) recipe.badge = req.body.badge;
        if (req.body.status !== undefined) recipe.status = req.body.status;
        await recipe.save();
        return sendSuccess(res, "Recipe updated successfully.", recipe);
      }
    }

    recipe = await Recipe.findById(id).catch(() => null);
    if (!recipe) {
      return sendError(res, "Recipe not found.", 404);
    }
    const fields = ["title", "image", "prepTime", "cookTime", "servings", "shortDescription", "ingredients", "instructions", "category", "author", "badge", "status"];
    fields.forEach(f => {
      if (req.body[f] !== undefined) recipe[f] = req.body[f];
    });
    if (req.body.title) {
      recipe.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }
    await recipe.save();
    return sendSuccess(res, "Recipe updated successfully.", recipe);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isNaN(id)) {
      await RecipeMySQL.destroy({ where: { id: Number(id) } });
    }
    await Recipe.findByIdAndDelete(id).catch(() => {});
    return sendSuccess(res, "Recipe deleted successfully.", { id });
  } catch (error) {
    next(error);
  }
};

export const seedDefaultRecipes = async () => {};

export const updateRecipe = editRecipe;
