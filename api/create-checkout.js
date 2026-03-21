const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20"
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { items } = req.body || {};

    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "Invalid items" });
    }

    const lineItems = items.map((item) => ({
      price: item.priceId,
      quantity: item.quantity
    }));

    const origin = req.headers.origin || process.env.PUBLIC_SITE_URL || "https://example.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/success.html`,
      cancel_url: `${origin}/`,
      allow_promotion_codes: true
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Checkout failed." });
  }
};
