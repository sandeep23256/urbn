// Run with: node src/seed.js
// Populates a handful of demo sneakers so the storefront isn't empty on first run.
require("dotenv/config");
const connectDB = require("./config/db");
const Product = require("./models/Product");

const products = [
  {
    name: "Nimbus 900",
    slug: "nimbus-900",
    brand: "URBN Lab",
    description:
      "A low-profile daily trainer built on a dual-density foam stack. Mesh upper breathes, the outsole grips wet asphalt.",
    category: "sneakers",
    price: 6499,
    discountPrice: 5499,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
    model3d: "",
    colorway: "Cloud White / Volt",
    variants: [
      { size: "7", stock: 8 },
      { size: "8", stock: 12 },
      { size: "9", stock: 10 },
      { size: "10", stock: 6 },
    ],
    featured: true,
    tags: ["running", "daily-trainer"],
  },
  {
    name: "Ridgeback High",
    slug: "ridgeback-high",
    brand: "URBN Lab",
    description:
      "A reinforced high-top with a rugged lug outsole for city trails and everything in between.",
    category: "sneakers",
    price: 7999,
    images: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"],
    model3d: "",
    colorway: "Charcoal / Rust",
    variants: [
      { size: "8", stock: 5 },
      { size: "9", stock: 7 },
      { size: "10", stock: 9 },
    ],
    featured: true,
    tags: ["hiking", "high-top"],
  },
  {
    name: "Slate Runner",
    slug: "slate-runner",
    brand: "URBN Lab",
    description: "Minimal knit upper, carbon-plated midsole. Built for tempo runs.",
    category: "sneakers",
    price: 8999,
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a"],
    model3d: "",
    colorway: "Slate Grey",
    variants: [
      { size: "7", stock: 4 },
      { size: "8", stock: 6 },
      { size: "9", stock: 3 },
    ],
    featured: false,
    tags: ["performance", "carbon-plate"],
  },
  {
    name: "Alloy Court",
    slug: "alloy-court",
    brand: "URBN Lab",
    description:
      "A leather-and-mesh court shoe with a firmer midsole for lateral stability. Made for pickup games and long walks alike.",
    category: "sneakers",
    price: 5999,
    images: ["https://images.unsplash.com/photo-1595341888016-a392ef81b7de"],
    model3d: "",
    colorway: "Bone / Black",
    variants: [
      { size: "7", stock: 6 },
      { size: "8", stock: 9 },
      { size: "9", stock: 8 },
      { size: "10", stock: 4 },
      { size: "11", stock: 2 },
    ],
    featured: true,
    tags: ["court", "leather"],
  },
  {
    name: "Fieldwork Chukka",
    slug: "fieldwork-chukka",
    brand: "URBN Lab",
    description:
      "A suede chukka boot with a lugged crepe sole — built for wet pavement, styled for everyday wear.",
    category: "sneakers",
    price: 9499,
    discountPrice: 7999,
    images: ["https://images.unsplash.com/photo-1608256246200-53e635b5b65f"],
    model3d: "",
    colorway: "Rust Suede",
    variants: [
      { size: "8", stock: 3 },
      { size: "9", stock: 5 },
      { size: "10", stock: 5 },
    ],
    featured: false,
    tags: ["boot", "suede"],
  },
  {
    name: "Lab Crewneck",
    slug: "lab-crewneck",
    brand: "URBN Lab",
    description:
      "Heavyweight 380gsm cotton fleece, garment-dyed for a worn-in look from day one. Runs true to size.",
    category: "apparel",
    price: 2999,
    images: ["https://images.unsplash.com/photo-1614975059251-992f11792b9f"],
    model3d: "",
    colorway: "Charcoal",
    variants: [
      { size: "S", stock: 10 },
      { size: "M", stock: 14 },
      { size: "L", stock: 12 },
      { size: "XL", stock: 6 },
    ],
    featured: false,
    tags: ["apparel", "fleece"],
  },
  {
    name: "Cargo Utility Pant",
    slug: "cargo-utility-pant",
    brand: "URBN Lab",
    description:
      "Ripstop cotton cargo pants with a tapered leg and reinforced knee panels — made to survive a work commute or a hike.",
    category: "apparel",
    price: 3499,
    images: ["https://images.unsplash.com/photo-1517438476312-10d79c077509"],
    model3d: "",
    colorway: "Olive",
    variants: [
      { size: "30", stock: 5 },
      { size: "32", stock: 8 },
      { size: "34", stock: 6 },
      { size: "36", stock: 3 },
    ],
    featured: false,
    tags: ["apparel", "cargo"],
  },
  {
    name: "Lace Lock Kit",
    slug: "lace-lock-kit",
    brand: "URBN Lab",
    description:
      "Anodized aluminium lace locks — swap them onto any pair in the lineup for a tool-free fit adjustment.",
    category: "accessories",
    price: 899,
    images: ["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb"],
    model3d: "",
    colorway: "Gunmetal",
    variants: [{ size: "One size", stock: 40 }],
    featured: false,
    tags: ["accessories", "hardware"],
  },
];

(async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);
  process.exit(0);
})();
