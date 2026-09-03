import ReviewMongo from "../models/Review.js";
import ReviewMySQL from "../models/mysql/Review.js";
import Product from "../models/Product.js";
import ProductMySQL from "../models/mysql/Product.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Helper to recalculate and update product's overall rating and total review count.
 */
const updateProductRatingMeta = async (productId) => {
  let reviews = [];
  try {
    reviews = await ReviewMySQL.findAll({ where: { productId: String(productId) } });
  } catch (mysqlErr) {
    reviews = await ReviewMongo.find({ productId: String(productId) }).catch(() => []);
  }

  const reviewsCount = reviews.length;
  let rating = 5.0;
  
  if (reviewsCount > 0) {
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    rating = parseFloat((sum / reviewsCount).toFixed(1));
  }
  
  if (!isNaN(productId)) {
    const prod = await ProductMySQL.findByPk(Number(productId));
    if (prod) {
      prod.rating = rating;
      prod.reviewsCount = reviewsCount;
      await prod.save().catch(() => {});
    }
  } else {
    await Product.findByIdAndUpdate(productId, { rating, reviewsCount }).catch(() => {});
  }
};

/**
 * Get all reviews for a specific product.
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    let reviews = [];
    try {
      reviews = await ReviewMySQL.findAll({ where: { productId: String(productId) }, order: [["id", "DESC"]] });
    } catch (mysqlErr) {
      reviews = await ReviewMongo.find({ productId: String(productId) }).sort({ createdAt: -1 }).catch(() => []);
    }
    return sendSuccess(res, "Reviews retrieved successfully.", reviews);
  } catch (error) {
    next(error);
  }
};

/**
 * Add a review for a specific product.
 * Protected: requires valid authenticated user token.
 */
export const addProductReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return sendError(res, "Rating and comment are required fields.", 400);
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return sendError(res, "Rating must be an integer between 1 and 5.", 400);
    }

    // Verify product exists (MySQL first, then Mongoose fallback)
    let productExists = false;
    if (!isNaN(productId)) {
      const sqlProd = await ProductMySQL.findByPk(Number(productId));
      if (sqlProd) productExists = true;
    }
    if (!productExists) {
      const mongoProd = await Product.findById(productId).catch(() => null);
      if (mongoProd) productExists = true;
    }

    if (!productExists) {
      return sendError(res, "Product not found.", 404);
    }

    const userId = req.user.id || req.user._id || "user_1";
    const userName = req.user.name || "Customer";

    // Check if user has already reviewed this product
    let existingReview = null;
    try {
      existingReview = await ReviewMySQL.findOne({ where: { productId: String(productId), userId: String(userId) } });
    } catch (e) {
      existingReview = await ReviewMongo.findOne({ productId: String(productId), userId: String(userId) }).catch(() => null);
    }

    if (existingReview) {
      return sendError(res, "You have already reviewed this product. Delete your existing review to submit a new one.", 400);
    }

    // Create the review
    let review = null;
    try {
      review = await ReviewMySQL.create({
        productId: String(productId),
        userId: String(userId),
        userName: userName,
        userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        rating: ratingVal,
        comment: comment.trim()
      });
    } catch (mysqlErr) {
      review = await ReviewMongo.create({
        productId: String(productId),
        userId: String(userId),
        userName: userName,
        userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        rating: ratingVal,
        comment: comment.trim()
      }).catch(() => null);
    }

    // Update Product's rating metadata
    await updateProductRatingMeta(productId);

    return sendSuccess(res, "Review submitted successfully.", review, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product review.
 */
export const deleteProductReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id || req.user._id;

    let review = null;
    if (!isNaN(reviewId)) {
      review = await ReviewMySQL.findByPk(Number(reviewId));
    }
    if (!review) {
      review = await ReviewMongo.findById(reviewId).catch(() => null);
    }

    if (!review) {
      return sendError(res, "Review not found.", 404);
    }

    const isOwner = String(review.userId) === String(userId);
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    if (!isOwner && !isAdmin) {
      return sendError(res, "Access denied. You can only delete your own reviews.", 403);
    }

    const productId = review.productId;
    if (!isNaN(reviewId)) {
      await ReviewMySQL.destroy({ where: { id: Number(reviewId) } }).catch(() => {});
    }
    await ReviewMongo.findByIdAndDelete(reviewId).catch(() => {});
    await updateProductRatingMeta(productId);

    return sendSuccess(res, "Review deleted successfully.", { id: reviewId });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent real customer reviews across all products for Homepage Testimonials.
 */
export const getHomepageReviews = async (req, res, next) => {
  try {
    let reviews = [];
    try {
      reviews = await ReviewMySQL.findAll({ order: [["id", "DESC"]], limit: 6 });
    } catch (mysqlErr) {
      reviews = await ReviewMongo.find().sort({ createdAt: -1 }).limit(6).catch(() => []);
    }
    return sendSuccess(res, "Homepage customer reviews retrieved successfully.", reviews);
  } catch (error) {
    next(error);
  }
};
