// Load env vars FIRST — before anything that reads process.env (learned this the hard way once).
require("dotenv/config");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// Stripe webhook needs the raw body, so it's mounted BEFORE express.json()
app.post(
  "/api/orders/webhook",
  express.raw({ type: "application/json" }),
  require("./controllers/webhookController")
);

// Supports one or more comma-separated origins in CLIENT_URL, e.g.
// "https://urbn-eta.vercel.app,http://localhost:3000" — handy if you want
// both your deployed site and local dev to work without swapping env vars.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

// Logged at boot so a wrong/missing CLIENT_URL is visible directly in the
// Render logs, instead of only showing up as a CORS error in the browser.
console.log("CORS allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // requests with no Origin header (curl, server-to-server, Postman)
      // are always allowed — only browser requests send an Origin to check.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true, service: "urbn-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`URBN API running on port ${PORT}`));
});
