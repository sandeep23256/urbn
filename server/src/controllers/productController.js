const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");

// @route  GET /api/products
// Supports ?keyword=&category=&brand=&minPrice=&maxPrice=&sort=&page=&limit=
const getProducts = asyncHandler(async (req, res) => {
  const { keyword, category, brand, minPrice, maxPrice, sort, featured } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;

  const filter = {};
  if (keyword) filter.$text = { $search: keyword };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (featured) filter.featured = featured === "true";
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { rating: -1 },
  };

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortMap[sort] || { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ products, page, pages: Math.ceil(total / limit), total });
});

// @route  GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

module.exports = { getProducts, getProductBySlug };
