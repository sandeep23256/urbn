const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/Wishlist");

// @route  GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }
  res.json(wishlist);
});

// @route  POST /api/wishlist/:productId
const toggleWishlistItem = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const { productId } = req.params;
  const exists = wishlist.products.some((p) => p.toString() === productId);

  if (exists) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId);
  } else {
    wishlist.products.push(productId);
  }

  await wishlist.save();
  res.json(wishlist);
});

module.exports = { getWishlist, toggleWishlistItem };
