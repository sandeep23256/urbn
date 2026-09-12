const express = require("express");
const { getWishlist, toggleWishlistItem } = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getWishlist);
router.post("/:productId", protect, toggleWishlistItem);

module.exports = router;
