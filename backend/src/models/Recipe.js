import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      default: "Traditional Recipes",
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    prepTime: {
      type: String,
      default: "15 Mins"
    },
    cookTime: {
      type: String,
      default: "30 Mins"
    },
    servings: {
      type: String,
      default: "4 Servings"
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true
    },
    ingredients: {
      type: [String],
      default: []
    },
    instructions: {
      type: String,
      required: true
    },
    tag: {
      type: String,
      default: "Festive Special"
    },
    author: {
      type: String,
      default: "ReetSutra Kitchen"
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
