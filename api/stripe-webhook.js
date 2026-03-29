import Stripe from 'stripe';
import { Resend } from 'resend';

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const resend = new Resend(process.env.RESEND_API_KEY);

async function getRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

function moneyFromCents(amount) {
  if (typeof amount !== 'number') return '$0.00';
  return `$${(amount / 100).toFixed(2)}`;
}

function escapeFormulaValue(value) {
  return String(value || '').replace(/'/g, "\\'");
}

function getShippingDetails(session) {
  return (
    session?.shipping_details ||
    session?.collected_information?.shipping_details ||
    null
  );
}

function formatShippingAddress(shippingDetails) {
  const address = shippingDetails?.address;
  if (!address) return 'No shipping address provided';

  const lines = [
    shippingDetails?.name || null,
    address.line1 || null,
    address.line2 || null,
    [address.city, address.state].filter(Boolean).join(', ') || null,
    [address.postal_code, address.country].filter(Boolean).join(' ') || null,
  ].filter(Boolean);

  return lines.join('\n');
}

function formatLineItems(lineItems) {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return 'No items found';
  }

  return lineItems
    .map((item) => {
      const description = item.description || 'Item';
      const quantity = item.quantity || 0;
      const amount = moneyFromCents(item.amount_total ?? 0);
      return `${description} — Qty ${quantity} — ${amount}`;
    })
    .join('\n');
}

function summarizeItems(lineItems) {
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return 'No items found';
  }

  return lineItems
    .map((item) => {
      const description = item.description || 'Item';
      const quantity = item.quantity || 0;
      return `${description} x${quantity}`;
    })
    .join(', ');
}

function totalQuantity(lineItems) {
  if (!Array.isArray(lineItems) || lineItems.length === 0) return 0;
  return lineItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

async function sendOrderNotificationEmail({
  orderId,
  orderTotal,
  customerName,
  customerEmail,
  customerPhone,
  shippingAddress,
  itemsText,
  paymentStatus,
}) {
  const result = await resend.emails.send({
    from: process.env.ORDER_FROM_EMAIL,
    to: process.env.ORDER_NOTIFICATION_EMAIL,
    subject: 'New WOOFEL Order',
    text: [
      'New WOOFEL Order',
      `Order total: ${orderTotal}`,
      '',
      `Name: ${customerName}`,
      `Email: ${customerEmail}`,
      `Phone: ${customerPhone}`,
      '',
      'Ship to:',
      shippingAddress,
      '',
      'Items',
      itemsText,
      '',
      `Stripe checkout session: ${orderId}`,
      '',
      `Payment status: ${paymentStatus}`,
    ].join('\n'),
  });

  if (result?.error) {
    throw new Error(`Resend send failed: ${JSON.stringify(result.error)}`);
  }

  return result;
}

async function findAirtableRecordByOrderId(orderId) {
  const {
    AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_NAME,
  } = process.env;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    return null;
  }

  const formula = `{Order ID}='${escapeFormulaValue(orderId)}'`;
  const url =
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}` +
    `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Airtable lookup failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data?.records?.[0] || null;
}

async function createAirtableOrderRecord(fields) {
  const {
    AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_NAME,
  } = process.env;

  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
    console.log('Airtable env vars not set, skipping Airtable write.');
    return null;
  }

  const existing = await findAirtableRecordByOrderId(fields['Order ID']);

  if (existing) {
    console.log(`Airtable record already exists for order ${fields['Order ID']}`);
    return existing;
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields,
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Airtable create failed: ${response.status} ${text}`);
  }

  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event;

  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const fullSession = await stripe.checkout.sessions.retrieve(session.id);
      const lineItemsResponse = await stripe.checkout.sessions.listLineItems(session.id, {
        limit: 100,
      });

      const lineItems = lineItemsResponse?.data || [];
      const shippingDetails =
        getShippingDetails(session) || getShippingDetails(fullSession);

      const orderId = session.id;
      const customerName =
        session.customer_details?.name ||
        fullSession.customer_details?.name ||
        shippingDetails?.name ||
        'Unknown Customer';

      const customerEmail =
        session.customer_details?.email ||
        fullSession.customer_email ||
        fullSession.customer_details?.email ||
        '';

      const customerPhone =
        session.customer_details?.phone ||
        fullSession.customer_details?.phone ||
        shippingDetails?.phone ||
        '';

      const paymentStatus =
        session.payment_status || fullSession.payment_status || 'unknown';

      const orderTotal = moneyFromCents(
        typeof fullSession.amount_total === 'number'
          ? fullSession.amount_total
          : session.amount_total ?? 0
      );

      const shippingAddress = formatShippingAddress(shippingDetails);
      const itemsText = formatLineItems(lineItems);
      const itemsSummary = summarizeItems(lineItems);
      const quantity = totalQuantity(lineItems);

      await sendOrderNotificationEmail({
        orderId,
        orderTotal,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        itemsText,
        paymentStatus,
      });

      await createAirtableOrderRecord({
        'Order ID': orderId,
        'Name': customerName,
        'Email': customerEmail,
        'Phone': customerPhone,
        'Address': shippingAddress,
        'Items': itemsSummary,
        'Quantity': quantity,
        'Status': 'New',
        'Payment Status': paymentStatus,
        'Order Total': orderTotal,
        'Order Date': new Date().toISOString(),
        'Source': 'Stripe Checkout',
      });

      console.log(`Processed order ${orderId} successfully`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}