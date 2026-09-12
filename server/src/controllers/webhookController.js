const Stripe = require("stripe");
const Order = require("../models/Order");
const Product = require("../models/Product");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe calls this when a payment finishes. Mounted with express.raw() in index.js
// because Stripe needs the raw request body to verify the signature.
module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    const order = await Order.findById(orderId);
    if (order && !order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
      order.status = "processing";
      await order.save();

      // decrement stock for each purchased size
      for (const item of order.items) {
        await Product.updateOne(
          { _id: item.product, "variants.size": item.size },
          { $inc: { "variants.$.stock": -item.qty } }
        );
      }
    }
  }

  res.json({ received: true });
};
