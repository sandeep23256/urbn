const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    brand: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["sneakers", "apparel", "accessories"],
      default: "sneakers",
    },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    images: [{ type: String, required: true }], // Cloudinary URLs, first = primary
    model3d: { type: String }, // URL to a .glb/.gltf file for the 3D viewer
    colorway: { type: String },
    variants: [variantSchema],
    featured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [String],
  },
  { timestamps: true }
);

productSchema.index({ name: "text", brand: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);
