const express = require("express");
const {
  createCheckoutSession,
  demoCheckout,
  getMyOrders,
  getOrderById,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/checkout", protect, createCheckoutSession);
router.post("/demo-checkout", protect, demoCheckout);
router.get("/mine", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
