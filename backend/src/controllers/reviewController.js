import Review from "../models/Review.js";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Helper to recalculate and update product's overall rating and total review count.
 */
const updateProductRatingMeta = async (productId) => {
  const reviews = await Review.find({ productId });
  const reviewsCount = reviews.length;
  let rating = 5.0; // default value
  
  if (reviewsCount > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    rating = parseFloat((sum / reviewsCount).toFixed(1));
  }
  
  await Product.findByIdAndUpdate(productId, { rating, reviewsCount });
};

/**
 * Get all reviews for a specific product.
 */
export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
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

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, "Product not found.", 404);
    }

    // Check if the user has already reviewed this product
    const existingReview = await Review.findOne({ productId, userId: req.user._id });
    if (existingReview) {
      return sendError(res, "You have already reviewed this product. Delete your existing review to submit a new one.", 400);
    }

    // Create the review
    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      userAvatar: req.user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      rating: ratingVal,
      comment: comment.trim()
    });

    // Update Product's rating metadata
    await updateProductRatingMeta(productId);

    return sendSuccess(res, "Review submitted successfully.", review, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a product review.
 * Protected: requires token. User must be the owner of the review, or an admin.
 */
export const deleteProductReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return sendError(res, "Review not found.", 404);
    }

    // Authorization: Must be the owner of the review, or an admin
    const isOwner = review.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return sendError(res, "Access denied. You can only delete your own reviews.", 403);
    }

    // Store productId for recalculation
    const productId = review.productId;

    // Delete review
    await Review.findByIdAndDelete(reviewId);

    // Update Product's rating metadata
    await updateProductRatingMeta(productId);

    return sendSuccess(res, "Review deleted successfully.", { id: reviewId });
  } catch (error) {
    next(error);
  }
};
