
 document.addEventListener('DOMContentLoaded', () => {
    const latestOrder = JSON.parse(localStorage.getItem('latestOrder')) || null;

    if (!latestOrder) {
        document.getElementById('orderItems').innerHTML = "<p>No items found in order.</p>";
        document.getElementById('subtotal').textContent = "₹0";
        document.getElementById('discount').textContent = "-₹0";
        document.getElementById('total').textContent = "₹0";
        document.getElementById('shippingAddress').textContent = 'No address found.';
        document.getElementById('orderId').textContent = 'N/A';
        return;
    }

    document.getElementById('orderId').textContent = latestOrder.orderId;
    document.getElementById('deliveryDate').textContent = "3–5 Business Days";

    const cart = latestOrder.cart || [];
    const appliedCoupon = latestOrder.appliedCoupon || null;
    const address = latestOrder.address;

    let subtotal = 0, discount = 0;
    const orderItemsContainer = document.getElementById('orderItems');

    orderItemsContainer.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between small mb-2">
            <span>${item.title} × ${item.quantity}</span>
            <span>₹${item.price * item.quantity}</span>
        </div>
    `).join("");

    subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (appliedCoupon) {
        if (appliedCoupon.value < 100) {
            discount = Math.floor((subtotal * appliedCoupon.value) / 100);
        } else {
            discount = appliedCoupon.value;
        }
    }

    document.getElementById('subtotal').textContent = "₹" + subtotal;
    document.getElementById('discount').textContent = "-₹" + discount;
    document.getElementById('total').textContent = "₹" + (subtotal - discount);

    if (address) {
        document.getElementById('shippingAddress').innerHTML = `
            ${address["Full Name"]}, ${address["Address"]}, ${address["City/District"]}, 
            ${address["State"]} - ${address["Pincode"]}, Mobile: ${address["Mobile Number"]}
        `;
    } else {
        document.getElementById('shippingAddress').textContent = 'No address found.';
    }

    // Now we can clear cart, coupon, and latestOrder if desired
    localStorage.removeItem('smartbook-cart');
    localStorage.removeItem('smartbook-coupon');
    localStorage.removeItem('latestOrder');
});

