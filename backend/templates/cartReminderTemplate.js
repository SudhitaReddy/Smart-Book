// templates/cartReminderTemplate.js
module.exports = (cart, user) => `
  <div style="font-family: Arial, sans-serif; max-width:600px; margin:auto; border:1px solid #ddd; border-radius:8px;">
    <div style="background:#FF5722; color:#fff; padding:20px; text-align:center;">
      <h1>Your Cart is Waiting 🛒</h1>
    </div>
    <div style="padding:20px;">
      <p>Hi ${user.name},</p>
      <p>You left some items in your cart. It’s been over 48 hours!</p>
      <h3>Items:</h3>
      <ul>
        ${cart.items.map(i => `<li>${i.name} × ${i.qty}</li>`).join('')}
      </ul>
      <a href="http://yourwebsite.com/cart" style="display:inline-block; margin-top:20px; background:#FF5722; color:#fff; padding:10px 20px; border-radius:5px; text-decoration:none;">
        Complete Your Purchase
      </a>
    </div>
    <div style="background:#f4f4f4; text-align:center; padding:10px; font-size:12px; color:#555;">
      &copy; ${new Date().getFullYear()} BookSmart. All rights reserved.
    </div>
  </div>
`;
