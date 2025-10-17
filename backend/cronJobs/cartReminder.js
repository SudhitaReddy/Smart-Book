const cron = require("node-cron");
const Cart = require("../models/cart");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const cartTemplate = require("../templates/cartReminderTemplate");

// Run every day at 10 AM
cron.schedule("0 10 * * *", async () => {
  console.log("🕑 Running cart reminder job...");

  const carts = await Cart.find({
    updatedAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }, // older than 48 hrs
    items: { $ne: [] }
  });

  for (let cart of carts) {
    const user = await User.findById(cart.userId);
    if (!user) continue;

    const emailContent = cartTemplate(cart, user);
    await sendEmail(user.email, "Don’t Forget Your Cart!", emailContent);
  }
});
