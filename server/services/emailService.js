const nodemailer = require('nodemailer');
const db = require('../db');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  getTransporter() {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = parseInt(process.env.SMTP_PORT || '587', 10);
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: user && pass ? { user, pass } : undefined,
        tls: {
          rejectUnauthorized: false
        }
      });
    }
    return this.transporter;
  }

  // ── Centralized Notification Dispatcher ────────────────────
  async sendNotification(type, orderData) {
    if (!orderData || !orderData.id) {
      console.warn('[EmailService] Cannot send email: invalid order data');
      return { success: false, error: 'Invalid order data' };
    }

    const orderId = orderData.id;
    let customerEmail = orderData.customerEmail || orderData.email || orderData.customer?.email;

    // Fetch address / user email fallback if needed
    if (!customerEmail && orderData.shippingAddress) {
      if (typeof orderData.shippingAddress === 'object') {
        customerEmail = orderData.shippingAddress.email;
      } else if (typeof orderData.shippingAddress === 'string') {
        try {
          const parsed = JSON.parse(orderData.shippingAddress);
          customerEmail = parsed.email;
        } catch (e) {}
      }
    }

    if (!customerEmail) {
      try {
        const uRes = await db.query(
          'SELECT email FROM users WHERE id = (SELECT user_id FROM orders WHERE id = $1)',
          [orderId]
        );
        if (uRes.rows.length > 0) customerEmail = uRes.rows[0].email;
      } catch (e) {}
    }

    if (!customerEmail) {
      customerEmail = process.env.SMTP_USER || 'sumathisrimathi4@gmail.com';
    }

    // ── Prevent Duplicate Email Dispatch ─────────────────────
    try {
      const dupCheck = await db.query(
        `SELECT id FROM email_logs WHERE order_id = $1 AND notification_type = $2 AND status = 'Sent' LIMIT 1`,
        [orderId, type]
      );
      if (dupCheck.rows.length > 0) {
        console.log(`[EmailService] Skipped duplicate email: type=${type}, orderId=${orderId}`);
        return { success: true, duplicateSkipped: true };
      }
    } catch (e) {
      console.warn('[EmailService] Duplicate check warning:', e.message);
    }

    // Generate HTML & Subject based on Type
    const { subject, html } = this.buildTemplate(type, orderData);
    const fromName = process.env.SMTP_FROM_NAME || 'Happy Sarees';
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sumathisrimathi4@gmail.com';

    try {
      const transporter = this.getTransporter();
      const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: customerEmail,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email sent successfully! Type: ${type}, Order #${orderId}, MsgID: ${info.messageId}`);

      // Log success to email_logs
      await this.logEmail(orderId, customerEmail, type, 'Sent', null);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EmailService Error] Failed to send email (Type: ${type}, Order #${orderId}):`, err.message);
      // Log failure to email_logs
      await this.logEmail(orderId, customerEmail, type, 'Failed', err.message);
      // Do NOT throw exception to ensure application flow is uninterrupted
      return { success: false, error: err.message };
    }
  }

  // ── Database Logger ───────────────────────────────────────
  async logEmail(orderId, customerEmail, type, status, errorMessage) {
    try {
      await db.query(
        `INSERT INTO email_logs (order_id, customer_email, notification_type, status, error_message, sent_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [orderId, customerEmail, type, status, errorMessage || null]
      );
    } catch (e) {
      console.error('[EmailService Log Error] Could not write to email_logs:', e.message);
    }
  }

  // ── HTML Template Generator ──────────────────────────────
  buildTemplate(type, order) {
    const orderNumber = order.orderNumber || order.order_number || `HS-ORD-${order.id}`;
    const customerName = order.customerName || order.customer?.name || order.shippingAddress?.name || 'Valued Customer';
    const grandTotal = Number(order.totalAmount || order.total_amount || order.amount || 0).toLocaleString('en-IN');
    const paymentMethod = order.paymentMethod || order.payment_method || 'Pay Online';
    const paymentStatus = order.paymentStatus || order.payment_status || 'Pending';
    const orderStatus = order.orderStatus || order.order_status || order.status || 'Confirmed';
    const orderDate = order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN'));

    let addressStr = 'Address on file';
    let addr = order.shippingAddress || order.shipping_address;
    if (typeof addr === 'string') {
      try { addr = JSON.parse(addr); } catch (e) {}
    }
    if (addr && typeof addr === 'object') {
      addressStr = `${addr.name || addr.fullName || customerName}, ${addr.house ? addr.house + ', ' : ''}${addr.street || addr.streetAddress || ''}, ${addr.city || ''}, ${addr.state || 'Tamil Nadu'} - ${addr.pincode || ''}, Phone: ${addr.phone || ''}`;
    } else if (typeof addr === 'string' && addr.length > 5) {
      addressStr = addr;
    }

    const items = Array.isArray(order.items) ? order.items : [];

    let title = 'Order Notification';
    let badgeColor = '#d11b69';
    let subject = `Happy Sarees: Update for Order #${orderNumber}`;

    switch (type) {
      case 'ORDER_PLACED':
        title = '🎉 Order Confirmed!';
        subject = `Order Confirmation - #${orderNumber} | Happy Sarees`;
        badgeColor = '#2e7d32';
        break;
      case 'PAYMENT_SUCCESS':
        title = '💳 Payment Successful!';
        subject = `Payment Received for Order #${orderNumber} | Happy Sarees`;
        badgeColor = '#0284c7';
        break;
      case 'PACKED':
        title = '📦 Order Packed & Ready!';
        subject = `Your Order #${orderNumber} Has Been Packed | Happy Sarees`;
        badgeColor = '#ed6c02';
        break;
      case 'SHIPPED':
        title = '🚚 Order Shipped!';
        subject = `Your Order #${orderNumber} Has Been Shipped | Happy Sarees`;
        badgeColor = '#0284c7';
        break;
      case 'OUT_FOR_DELIVERY':
        title = '🛵 Out For Delivery!';
        subject = `Order #${orderNumber} is Out For Delivery Today | Happy Sarees`;
        badgeColor = '#9c27b0';
        break;
      case 'DELIVERED':
        title = '✨ Order Delivered!';
        subject = `Order #${orderNumber} Delivered Successfully | Happy Sarees`;
        badgeColor = '#2e7d32';
        break;
      case 'RETURN_REQUESTED':
        title = '🔄 Return Request Received';
        subject = `Return Request Received for Order #${orderNumber} | Happy Sarees`;
        badgeColor = '#d11b69';
        break;
      case 'RETURN_APPROVED':
        title = '✅ Return Approved';
        subject = `Return Request Approved for Order #${orderNumber} | Happy Sarees`;
        badgeColor = '#2e7d32';
        break;
      case 'RETURN_REJECTED':
        title = '❌ Return Request Update';
        subject = `Return Request Update for Order #${orderNumber} | Happy Sarees`;
        badgeColor = '#c62828';
        break;
      case 'REFUND_COMPLETED':
        title = '💰 Refund Processed Successfully';
        subject = `Refund Completed for Order #${orderNumber} | Happy Sarees`;
        badgeColor = '#0284c7';
        break;
      default:
        break;
    }

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
          <img src="${item.image || item.image_url || 'https://res.cloudinary.com/emp49xie/image/upload/v1784961973/happy_sarees/products/oeriadfocie0laokxlrk.jpg'}" alt="${item.name || item.productName || 'Silk Saree'}" style="width: 54px; height: 54px; object-fit: cover; border-radius: 6px;" />
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee;">
          <strong style="color: #2b2b2b; font-size: 14px;">${item.name || item.productName || 'Silk Saree'}</strong><br />
          <span style="color: #888888; font-size: 12px;">Fabric: ${item.fabric || 'Pure Silk'} | Qty: ${item.quantity || item.qty || 1}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: bold; color: #2b2b2b; font-size: 14px;">
          ₹${Number((item.price || item.price_at_purchase || 0) * (item.quantity || item.qty || 1)).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f7f7f7; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
              
              <!-- Header Gradient Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #d11b69 0%, #880e4f 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">HAPPY SAREES</h1>
                  <span style="font-size: 12px; letter-spacing: 2px; color: #f8bbd0; display: block; margin-top: 4px; text-transform: uppercase;">Luxury Heritage Handlooms</span>
                </td>
              </tr>

              <!-- Event Title Badge -->
              <tr>
                <td style="padding: 24px 24px 10px 24px; text-align: center;">
                  <span style="display: inline-block; background-color: ${badgeColor}; color: #ffffff; padding: 6px 18px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                    ${title}
                  </span>
                  <p style="color: #555555; font-size: 14px; margin-top: 14px; line-height: 1.5;">
                    Dear <strong>${customerName}</strong>, thank you for shopping with Happy Sarees! Here are the details for your order.
                  </p>
                </td>
              </tr>

              <!-- Order Summary Meta Grid -->
              <tr>
                <td style="padding: 0 24px 16px 24px;">
                  <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #fafafa; border-radius: 8px; border: 1px solid #eeeeee; font-size: 13px; color: #333333;">
                    <tr>
                      <td><strong>Order Number:</strong> #${orderNumber}</td>
                      <td><strong>Date:</strong> ${orderDate}</td>
                    </tr>
                    <tr>
                      <td><strong>Payment Method:</strong> ${paymentMethod}</td>
                      <td><strong>Payment Status:</strong> <span style="font-weight: bold; color: ${paymentStatus === 'Paid' ? '#2e7d32' : (paymentStatus === 'Refunded' ? '#0284c7' : '#e65100')}">${paymentStatus}</span></td>
                    </tr>
                    <tr>
                      <td colspan="2"><strong>Order Status:</strong> <span style="font-weight: bold; color: ${badgeColor};">${orderStatus}</span></td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Items Breakdown Table -->
              ${items.length > 0 ? `
              <tr>
                <td style="padding: 0 24px 16px 24px;">
                  <h3 style="font-size: 15px; color: #2b2b2b; margin: 0 0 10px 0; border-bottom: 2px solid #f8bbd0; padding-bottom: 6px;">Ordered Items</h3>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    ${itemsHtml}
                  </table>
                </td>
              </tr>
              ` : ''}

              <!-- Address & Total Box -->
              <tr>
                <td style="padding: 0 24px 24px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="60%" valign="top" style="padding-right: 12px;">
                        <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #666666; text-transform: uppercase;">Shipping Address</h4>
                        <p style="margin: 0; font-size: 12px; color: #444444; line-height: 1.5;">${addressStr}</p>
                      </td>
                      <td width="40%" valign="top" style="text-align: right; background-color: #fff0f5; padding: 12px; border-radius: 8px; border: 1px solid #f8bbd0;">
                        <span style="font-size: 12px; color: #888888; display: block; text-transform: uppercase;">Grand Total</span>
                        <strong style="font-size: 20px; color: #d11b69;">₹${grandTotal}</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #2b2b2b; color: #aaaaaa; padding: 20px 24px; text-align: center; font-size: 11px; line-height: 1.6;">
                  <p style="margin: 0 0 6px 0; color: #ffffff; font-weight: bold;">Happy Sarees Heritage Handloom Co.</p>
                  <p style="margin: 0;">Heritage Loom Tower, Kanchipuram, Tamil Nadu - 631501</p>
                  <p style="margin: 4px 0 0 0;">Need help? Email us at <a href="mailto:sumathisrimathi4@gmail.com" style="color: #f8bbd0; text-decoration: none;">sumathisrimathi4@gmail.com</a></p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

    return { subject, html };
  }

  async sendSellerApprovalEmail(email, storeName, isApproved, reason = null) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || 'Happy Sarees';
      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sumathisrimathi4@gmail.com';
      const subject = isApproved 
        ? 'Welcome to Happy Sarees - Account Approved!' 
        : 'Update on your Happy Sarees Seller Account';
      
      const html = `
        <h3>Dear ${storeName || 'Seller'},</h3>
        <p>${isApproved 
          ? 'Congratulations! Your seller account has been approved. You can now log in to the Seller Portal and start listing your products.' 
          : `Thank you for your interest. Unfortunately, your seller account request could not be approved at this time. Reason: ${reason || 'Details do not meet our criteria.'}`}</p>
        <p>Best regards,<br/>Happy Sarees Team</p>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject,
        html
      });
      console.log(`[EmailService] Seller approval email sent to ${email}`);
    } catch (err) {
      console.error('[EmailService Error] Failed to send seller approval email:', err.message);
    }
  }

  async sendProductApprovalEmail(email, storeName, productName, isApproved, reason = null) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || 'Happy Sarees';
      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sumathisrimathi4@gmail.com';
      const subject = isApproved 
        ? `Product Approved: ${productName} is now live!` 
        : `Product Update: ${productName}`;

      const html = `
        <h3>Dear ${storeName || 'Seller'},</h3>
        <p>${isApproved 
          ? `Great news! Your product "<strong>${productName}</strong>" has been approved and is now live on the Happy Sarees website.` 
          : `We reviewed your product "<strong>${productName}</strong>" and it has been rejected at this time. Reason: ${reason || 'Does not meet catalog criteria.'}`}</p>
        <p>Best regards,<br/>Happy Sarees Team</p>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject,
        html
      });
      console.log(`[EmailService] Product approval email sent to ${email}`);
    } catch (err) {
      console.error('[EmailService Error] Failed to send product approval email:', err.message);
    }
  }

  async sendMasterDataRequestEmail(email, storeName, requestTypeName, itemName, isApproved, reason = null) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || 'Happy Sarees';
      const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'sumathisrimathi4@gmail.com';
      const subject = isApproved 
        ? `Catalog Request Approved: ${itemName}` 
        : `Catalog Request Update: ${itemName}`;

      const html = `
        <h3>Dear ${storeName || 'Seller'},</h3>
        <p>${isApproved 
          ? `Your catalog master data request for "<strong>${itemName}</strong>" under "<strong>${requestTypeName}</strong>" has been approved. It is now available for listing products.` 
          : `Your catalog master data request for "<strong>${itemName}</strong>" under "<strong>${requestTypeName}</strong>" could not be approved at this time. Reason: ${reason || 'Not applicable to current catalog structure.'}`}</p>
        <p>Best regards,<br/>Happy Sarees Team</p>
      `;

      const transporter = this.getTransporter();
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject,
        html
      });
      console.log(`[EmailService] Master data request email sent to ${email}`);
    } catch (err) {
      console.error('[EmailService Error] Failed to send master data request email:', err.message);
    }
  }
}

module.exports = new EmailService();
