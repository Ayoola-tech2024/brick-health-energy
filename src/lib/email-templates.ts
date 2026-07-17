const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://brickhealthenergy.org";
const LOGO_URL = `${SITE_URL}/images/logo-square.jpeg`;

const brandStyles = `
body { margin:0; padding:0; background-color:#f4f4f5; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
table { border-collapse:collapse; }
.container { max-width:600px; margin:0 auto; background:#ffffff; }
.header { background:#1e293b; padding:32px 40px; text-align:center; }
.header img { width:56px; height:56px; border-radius:12px; }
.header h1 { color:#f8fafc; font-size:20px; font-weight:700; margin:12px 0 0 0; letter-spacing:-0.02em; }
.header p { color:#94a3b8; font-size:13px; margin:4px 0 0 0; }
.body { padding:32px 40px; }
.body h2 { color:#1e293b; font-size:18px; font-weight:700; margin:0 0 8px 0; }
.body p { color:#475569; font-size:14px; line-height:1.6; margin:0 0 16px 0; }
.order-table { width:100%; border-collapse:collapse; margin:16px 0; }
.order-table th { background:#f8fafc; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; padding:10px 12px; text-align:left; border-bottom:2px solid #e2e8f0; }
.order-table td { padding:10px 12px; border-bottom:1px solid #f1f5f9; font-size:14px; color:#334155; }
.order-table td:last-child, .order-table th:last-child { text-align:right; }
.summary { background:#f8fafc; border-radius:8px; padding:16px 20px; margin:16px 0; }
.summary-row { display:flex; justify-content:space-between; padding:6px 0; font-size:14px; color:#475569; }
.summary-row.total { border-top:2px solid #e2e8f0; margin-top:6px; padding-top:12px; font-size:16px; font-weight:700; color:#1e293b; }
.details-grid { margin:16px 0; }
.detail-label { font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; color:#94a3b8; margin:12px 0 4px 0; }
.detail-value { font-size:14px; color:#1e293b; margin:0; }
.footer { background:#1e293b; padding:24px 40px; text-align:center; }
.footer p { color:#94a3b8; font-size:12px; margin:4px 0; }
.btn { display:inline-block; background:#c6a667; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:6px; font-size:14px; font-weight:600; }
`;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_email?: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  created_at?: string;
}

export function adminOrderEmail(order: OrderData): { subject: string; html: string } {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155">${i.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;text-align:center">${i.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;text-align:right">₦${(i.price * i.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const shortId = order.id.slice(0, 8).toUpperCase();
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-NG", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-NG", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${brandStyles}</style>
</head>
<body>
<table class="container" role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td class="header">
    <img src="${LOGO_URL}" alt="Brick Health Energy" />
    <h1>Brick Health Energy</h1>
    <p>Order Management</p>
  </td></tr>
  <tr><td class="body">
    <p style="margin:0 0 4px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">New Order</p>
    <h2>Order #${shortId}</h2>
    <p><span style="color:#c6a667;font-weight:600">₦${order.total.toLocaleString()}</span> &middot; ${date}</p>

    <table class="order-table" cellpadding="0" cellspacing="0">
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="summary">
      <div class="summary-row"><span>Subtotal</span><span>₦${order.subtotal.toLocaleString()}</span></div>
      <div class="summary-row"><span>Delivery</span><span>${order.delivery_fee > 0 ? `₦${order.delivery_fee.toLocaleString()}` : "Free"}</span></div>
      <div class="summary-row total"><span>Total</span><span>₦${order.total.toLocaleString()}</span></div>
    </div>

    <h3 style="font-size:15px;font-weight:700;color:#1e293b;margin:24px 0 12px 0">Customer Details</h3>
    <div class="details-grid">
      <p class="detail-label">Name</p>
      <p class="detail-value">${order.delivery_name}</p>
      <p class="detail-label">Email</p>
      <p class="detail-value">${order.delivery_email || "—"}</p>
      <p class="detail-label">Phone</p>
      <p class="detail-value">${order.delivery_phone}</p>
      <p class="detail-label">Delivery Address</p>
      <p class="detail-value">${order.delivery_address}, ${order.delivery_city}, ${order.delivery_state}</p>
      <p class="detail-label">Payment Method</p>
      <p class="detail-value" style="text-transform:capitalize">${order.payment_method.replace("_", " ")}</p>
    </div>
  </td></tr>
  <tr><td class="footer">
    <p>Brick Health Energy Solutions</p>
    <p>Lagos, Nigeria</p>
    <p>info@brickhealthenergy.org &middot; +234 703 568 9394</p>
  </td></tr>
</table>
</body>
</html>`;

  return {
    subject: `New Order #${shortId} — ₦${order.total.toLocaleString()}`,
    html,
  };
}

export function customerConfirmationEmail(order: OrderData): { subject: string; html: string } {
  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155">${i.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;text-align:center">${i.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;text-align:right">₦${(i.price * i.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  const shortId = order.id.slice(0, 8).toUpperCase();
  const date = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-NG", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-NG", {
        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
      });

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${brandStyles}</style>
</head>
<body>
<table class="container" role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td class="header">
    <img src="${LOGO_URL}" alt="Brick Health Energy" />
    <h1>Thank You for Your Order!</h1>
    <p>Order #${shortId}</p>
  </td></tr>
  <tr><td class="body">
    <p>Hi ${order.delivery_name.split(" ")[0]},</p>
    <p>We've received your order and are getting it ready. Here's a summary:</p>

    <table class="order-table" cellpadding="0" cellspacing="0">
      <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="summary">
      <div class="summary-row"><span>Subtotal</span><span>₦${order.subtotal.toLocaleString()}</span></div>
      <div class="summary-row"><span>Delivery</span><span>${order.delivery_fee > 0 ? `₦${order.delivery_fee.toLocaleString()}` : "Free"}</span></div>
      <div class="summary-row total"><span>Total</span><span>₦${order.total.toLocaleString()}</span></div>
    </div>

    <h3 style="font-size:15px;font-weight:700;color:#1e293b;margin:24px 0 12px 0">Delivery Details</h3>
    <div class="details-grid">
      <p class="detail-label">Shipping to</p>
      <p class="detail-value">${order.delivery_name}</p>
      <p class="detail-value">${order.delivery_address}, ${order.delivery_city}, ${order.delivery_state}</p>
      <p class="detail-label">Payment</p>
      <p class="detail-value" style="text-transform:capitalize">${order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method.replace("_", " ")}</p>
      <p class="detail-label">Order Date</p>
      <p class="detail-value">${date}</p>
    </div>

    <div style="text-align:center;margin:32px 0">
      <a href="${SITE_URL}/account/orders/${order.id}/tracking" class="btn">Track Your Order</a>
    </div>

    <p style="font-size:13px;color:#94a3b8;text-align:center;margin-top:24px">
      If you have any questions, reply to this email or contact us at <a href="tel:+2347035689394" style="color:#c6a667;text-decoration:none">+234 703 568 9394</a>.
    </p>
  </td></tr>
  <tr><td class="footer">
    <p>Brick Health Energy Solutions &mdash; Lagos, Nigeria</p>
    <p><a href="${SITE_URL}" style="color:#c6a667;text-decoration:none">Visit our store</a></p>
  </td></tr>
</table>
</body>
</html>`;

  return {
    subject: `Order Confirmation #${shortId} — Brick Health Energy`,
    html,
  };
}
