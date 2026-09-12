const express = require("express");
const { registerUser, loginUser, getMe, googleLogin, demoGoogleLogin } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/demo-google", demoGoogleLogin);
router.get("/me", protect, getMe);

module.exports = router;
