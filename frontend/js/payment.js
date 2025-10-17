
  let cart = JSON.parse(localStorage.getItem("smartbook-cart")) || [];
  let appliedCoupon = JSON.parse(localStorage.getItem("smartbook-coupon")) || null;

  function renderSummary() {
    const container = document.getElementById("order-items");
    let subtotal = 0, discount = 0;

    if (cart.length === 0) {
      container.innerHTML = "<p>No items in cart.</p>";
    } else {
      container.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between small mb-2">
          <span>${item.title} × ${item.quantity}</span>
          <span>₹${item.price * item.quantity}</span>
        </div>
      `).join("");
      subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    if (appliedCoupon) {
      if (appliedCoupon.value < 100) {
        discount = Math.floor((subtotal * appliedCoupon.value) / 100);
      } else {
        discount = appliedCoupon.value;
      }
    }

    document.getElementById("subtotal").textContent = "₹" + subtotal;
    document.getElementById("discount").textContent = "-₹" + discount;
    document.getElementById("total").textContent = "₹" + (subtotal - discount);
  }

  renderSummary();

  // Toggle payment forms
  document.querySelectorAll(".payment-option").forEach(option => {
    option.addEventListener("click", function() {
      document.querySelectorAll(".payment-option").forEach(o => o.classList.remove("active"));
      this.classList.add("active");
      document.querySelectorAll("#cardForm, #upiForm, #codForm").forEach(f => f.classList.add("d-none"));
      document.getElementById(this.getAttribute("data-option") + "Form").classList.remove("d-none");
    });
  });

  // Place Order
document.getElementById('placeOrderBtn').addEventListener('click', function(e) {
    e.preventDefault();

    const cart = JSON.parse(localStorage.getItem('smartbook-cart')) || [];
    const appliedCoupon = JSON.parse(localStorage.getItem('smartbook-coupon')) || null;
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    const selectedAddress = addresses[addresses.length - 1] || null;

    const orderId = 'ORD' + Math.floor(Math.random() * 1000000);
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = appliedCoupon
        ? (appliedCoupon.value < 100
            ? Math.floor((totalAmount * appliedCoupon.value) / 100)
            : appliedCoupon.value)
        : 0;

    const finalTotal = totalAmount - discount;

    const order = {
        orderId: orderId,
        date: new Date().toLocaleString(),
        cart: cart,
        totalAmount: finalTotal,
        appliedCoupon: appliedCoupon,
        address: selectedAddress,
        status: "Confirmed"
    };

    let orders = JSON.parse(localStorage.getItem('allOrders')) || [];
    orders.push(order);
    localStorage.setItem('allOrders', JSON.stringify(orders));

    localStorage.removeItem('smartbook-cart');
    localStorage.removeItem('smartbook-coupon');

    window.location.href = 'order.html';
});

