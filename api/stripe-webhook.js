const Stripe = require("stripe");
const { Resend } = require("resend");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20"
});

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function formatMoney(amount, currency) {
  if (typeof amount !== "number") return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "USD").toUpperCase()
  }).format(amount / 100);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAddressLines(address) {
  if (!address) return [];
  return [
    address.line1,
    address.line2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postal_code, address.country].filter(Boolean).join(" ")
  ].filter(Boolean);
}

function buildItemsHtml(lineItems) {
  return lineItems.map((item) => {
    const name = item.description || item.price?.nickname || item.price?.product?.name || "Woofel";
    const unitAmount = item.amount_subtotal != null
      ? formatMoney(item.amount_subtotal, item.currency)
      : "";
    return `<li><strong>${escapeHtml(name)}</strong> — Qty ${item.quantity}${unitAmount ? ` — ${escapeHtml(unitAmount)}` : ""}</li>`;
  }).join("");
}

function buildItemsText(lineItems) {
  return lineItems.map((item) => {
    const name = item.description || item.price?.nickname || item.price?.product?.name || "Woofel";
    const unitAmount = item.amount_subtotal != null
      ? formatMoney(item.amount_subtotal, item.currency)
      : "";
    return `- ${name} — Qty ${item.quantity}${unitAmount ? ` — ${unitAmount}` : ""}`;
  }).join("\n");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
  }

  if (!process.env.RESEND_API_KEY || !process.env.ORDER_NOTIFICATION_EMAIL || !process.env.ORDER_FROM_EMAIL) {
    return res.status(500).send("Missing email environment variables");
  }

  let event;

  try {
    const signature = req.headers["stripe-signature"];
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true, ignored: true });
  }

  try {
    const session = event.data.object;

    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ["customer", "payment_intent"]
    });

    const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 100,
      expand: ["data.price.product"]
    });

    const lineItems = lineItemsResponse.data || [];
const customerDetails = fullSession.customer_details || {};
const shippingDetails = fullSession.shipping_details || {};
const shippingAddress =
  shippingDetails.address ||
  customerDetails.address ||
  fullSession.collected_information?.shipping_details?.address ||
  null;
const shippingName =
  shippingDetails.name ||
  customerDetails.name ||
  fullSession.collected_information?.shipping_details?.name ||
  "Customer";
const customerEmail =
  customerDetails.email ||
  fullSession.customer_email ||
  "";
const phone = customerDetails.phone || "";
const total = formatMoney(fullSession.amount_total, fullSession.currency);

const addressLines = buildAddressLines(shippingAddress);
const itemsHtml = buildItemsHtml(lineItems);
const itemsText = buildItemsText(lineItems);
    const html = `
      <h1>New WOOFEL Order</h1>
      <p><strong>Order total:</strong> ${escapeHtml(total)}</p>
      <p><strong>Name:</strong> ${escapeHtml(shippingName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(customerEmail || "Not provided")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
      <p><strong>Ship to:</strong><br>${addressLines.length ? addressLines.map(escapeHtml).join("<br>") : "No shipping address collected"}</p>
      <h2>Items</h2>
      <ul>${itemsHtml}</ul>
      <p><strong>Stripe checkout session:</strong> ${escapeHtml(fullSession.id)}</p>
      <p><strong>Payment status:</strong> ${escapeHtml(fullSession.payment_status || "unknown")}</p>
    `;

    const text = [
      "New WOOFEL Order",
      "",
      `Order total: ${total}`,
      `Name: ${shippingName}`,
      `Email: ${customerEmail || "Not provided"}`,
      `Phone: ${phone || "Not provided"}`,
      "",
      "Ship to:",
      ...(addressLines.length ? addressLines : ["No shipping address collected"]),
      "",
      "Items:",
      itemsText || "- No line items found",
      "",
      `Stripe checkout session: ${fullSession.id}`,
      `Payment status: ${fullSession.payment_status || "unknown"}`
    ].join("\n");

   const result = await resend.emails.send({
  from: process.env.ORDER_FROM_EMAIL,
  to: [process.env.ORDER_NOTIFICATION_EMAIL],
  subject: "New order",
  html
});

if (result.error) {
  throw new Error(result.error.message);
}
if (result.error) {
  throw new Error(result.error.message);
}

    return res.status(200).json({
      received: true,
      emailed: !sendResult.error,
      emailId: sendResult.data?.id || null
    });
  } catch (error) {
    return res.status(500).send(error.message || "Webhook handler failed");
  }
};
