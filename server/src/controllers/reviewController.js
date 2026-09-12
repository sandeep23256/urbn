const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const Product = require("../models/Product");

// @route  GET /api/reviews/:productId
const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
  res.json(reviews);
});

// @route  POST /api/reviews/:productId
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const alreadyReviewed = await Review.findOne({ product: product._id, user: req.user._id });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You've already reviewed this product");
  }

  const review = await Review.create({
    product: product._id,
    user: req.user._id,
    name: req.user.name,
    rating,
    comment,
  });

  const allReviews = await Review.find({ product: product._id });
  product.numReviews = allReviews.length;
  product.rating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await product.save();

  res.status(201).json(review);
});

module.exports = { getProductReviews, createReview };
