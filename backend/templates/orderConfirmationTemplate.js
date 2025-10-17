// templates/orderConfirmationTemplate.js
module.exports = (order, user) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px;">
    <div style="background:#4CAF50; color:#fff; padding:20px; text-align:center;">
      <h1>Order Confirmed 🎉</h1>
    </div>
    <div style="padding:20px;">
      <p>Hi ${user.name},</p>
      <p>Your order <b>#${order._id}</b> has been placed successfully.</p>
      <p><b>Total:</b> ₹${order.totalAmount}</p>
      <h3>Items:</h3>
      <ul>
        ${order.items.map(i => `<li>${i.name} × ${i.qty}</li>`).join('')}
      </ul>
      <p>We’ll notify you when your order is shipped 🚚.</p>
    </div>
    <div style="background:#f4f4f4; text-align:center; padding:10px; font-size:12px; color:#555;">
      &copy; ${new Date().getFullYear()} BookSmart. All rights reserved.
    </div>
  </div>
`;
