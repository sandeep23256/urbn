const asyncHandler = require("express-async-handler");
const Stripe = require("stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Shared by both the real Stripe checkout and the demo checkout below.
// Re-prices everything from the DB — never trust prices sent from the
// client — and checks stock for each requested size.
async function buildOrderItems(items, res) {
  let subtotal = 0;
  const orderItems = [];
  const lineItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const variant = product.variants.find((v) => v.size === item.size);
    if (!variant || variant.stock < item.qty) {
      res.status(400);
      throw new Error(`${product.name} (size ${item.size}) is out of stock`);
    }

    const price = product.discountPrice || product.price;
    subtotal += price * item.qty;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      size: item.size,
      price,
      qty: item.qty,
    });

    lineItems.push({
      price_data: {
        currency: "inr",
        product_data: { name: `${product.name} (Size ${item.size})`, images: [product.images[0]] },
        unit_amount: Math.round(price * 100),
      },
      quantity: item.qty,
    });
  }

  const shippingFee = subtotal > 3000 ? 0 : 149;
  return { orderItems, lineItems, subtotal, shippingFee, total: subtotal + shippingFee };
}

async function decrementStock(orderItems) {
  for (const item of orderItems) {
    await Product.updateOne(
      { _id: item.product, "variants.size": item.size },
      { $inc: { "variants.$.stock": -item.qty } }
    );
  }
}

// @route  POST /api/orders/checkout
// Creates a pending Order in our DB, then a Stripe Checkout Session for payment
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const { orderItems, lineItems, subtotal, shippingFee, total } = await buildOrderItems(items, res);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingFee,
    total,
    status: "pending",
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    customer_email: req.user.email,
    success_url: `${process.env.CLIENT_URL}/order-success?orderId=${order._id}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout`,
    metadata: { orderId: order._id.toString() },
  });

  order.stripeSessionId = session.id;
  await order.save();

  res.json({ url: session.url, orderId: order._id });
});

// @route  POST /api/orders/demo-checkout
// Skips Stripe entirely and marks the order paid immediately — a stand-in
// for real payment while Stripe keys aren't set up yet. Same stock checks
// and re-pricing as the real flow, just no actual money moves.
// IMPORTANT: replace with the real checkout above once Stripe is configured
// — see README. Don't ship this to a real store.
const demoCheckout = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  const { orderItems, subtotal, shippingFee, total } = await buildOrderItems(items, res);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    subtotal,
    shippingFee,
    total,
    status: "processing",
    isPaid: true,
    paidAt: new Date(),
    paymentMethod: "demo",
  });

  await decrementStock(order.items);

  res.json({ orderId: order._id, demo: true });
});

// @route  GET /api/orders/mine
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @route  GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json(order);
});

module.exports = { createCheckoutSession, demoCheckout, getMyOrders, getOrderById };
