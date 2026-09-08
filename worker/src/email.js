import { formatINR } from "./format.js";

// Sends the order confirmation email via Resend's REST API. Never throws —
// email delivery is best-effort and must not block order placement, which
// has already succeeded (saved to D1) by the time this runs.
export async function sendOrderConfirmationEmail(env, { orderId, customer, lines, subtotal, shipping, total }) {
  if (!env.RESEND_API_KEY || !env.FROM_EMAIL) {
    console.warn("Email not configured (missing RESEND_API_KEY or FROM_EMAIL) — skipping confirmation email.");
    return;
  }

  const itemRows = lines
    .map(
      (line) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;">
            ${line.name}${line.size || line.color ? `<br><span style="color:#777;font-size:13px;">${[line.color, line.size].filter(Boolean).join(" / ")}</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:center;">${line.qty}</td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;">${formatINR(line.lineTotal)}</td>
        </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
    <div style="background:#0d0a06;padding:28px 24px;text-align:center;">
      <span style="display:inline-block;background:#d9a92c;color:#0d0a06;font-weight:bold;font-size:18px;padding:8px 14px;border-radius:6px;">H</span>
      <p style="color:#f7f0df;font-size:18px;letter-spacing:2px;margin:12px 0 0;">HIS WILL FASHION</p>
    </div>
    <div style="padding:28px 24px;">
      <h1 style="font-size:20px;margin:0 0 6px;">Order Confirmed</h1>
      <p style="color:#555;margin:0 0 20px;">Thank you, ${customer.fullName}. We've received your order and will reach out to confirm before it ships.</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
        <tr>
          <td style="padding:6px 0;color:#777;">Order Reference</td>
          <td style="padding:6px 0;text-align:right;font-weight:bold;">${orderId}</td>
        </tr>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:8px;border-bottom:2px solid #0d0a06;">Item</th>
            <th style="text-align:center;padding-bottom:8px;border-bottom:2px solid #0d0a06;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;border-bottom:2px solid #0d0a06;">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:14px;">
        <tr><td style="padding:4px 0;color:#777;">Subtotal</td><td style="padding:4px 0;text-align:right;">${formatINR(subtotal)}</td></tr>
        <tr><td style="padding:4px 0;color:#777;">Shipping</td><td style="padding:4px 0;text-align:right;">${shipping === 0 ? "Free" : formatINR(shipping)}</td></tr>
        <tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #eee;">Total (Cash on Delivery)</td><td style="padding:8px 0;text-align:right;font-weight:bold;border-top:1px solid #eee;">${formatINR(total)}</td></tr>
      </table>

      <h3 style="font-size:14px;margin:24px 0 6px;">Shipping To</h3>
      <p style="color:#555;font-size:14px;margin:0;line-height:1.5;">
        ${customer.addressLine1}${customer.addressLine2 ? `, ${customer.addressLine2}` : ""}<br>
        ${customer.city}, ${customer.state} ${customer.pincode}<br>
        ${customer.phone}
      </p>

      <p style="color:#999;font-size:12px;margin-top:28px;">Pay in cash when your order arrives. Questions? Reply to this email or DM us on Instagram @his_wll_fashion_club.</p>
    </div>
  </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.FROM_EMAIL,
        to: customer.email,
        subject: `Order Confirmed — ${orderId} — His Will Fashion`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend API error:", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("Failed to send confirmation email:", err.message);
  }
}
