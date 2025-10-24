// ===============================
// Checkout – Shipping → Payment → Review → Success
// ===============================
let currentStep = 2; // start at Shipping
let selectedAddress = null;
let selectedPaymentMethod = "cod";
let cartData = null;    // { _id, items[], subtotal, discount, totalItems }
let orderData = null;

const API_BASE_URL = 'https://smart-book-172w.onrender.com/api';
const CART_PAGE_URL = "cart.html"; // Back-to-cart target

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initializeCheckout();
});

function initializeCheckout() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login to continue checkout");
    window.location.href = "login.html";
    return;
  }

  const backBtn = document.getElementById("back-to-cart");
  if (backBtn) backBtn.href = CART_PAGE_URL;

  loadCartData();
  loadSavedAddresses();
  setupPaymentUI();
  setupFormHandlers();
  showStep(currentStep);
}

// ===============================
// CART (used for summary & review)
// ===============================
async function loadCartData() {
  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const raw = data.data.cart || {};
      cartData = {
        _id: raw._id || raw.id || null,
        items: Array.isArray(raw.items) ? raw.items : [],
        subtotal: Number(raw.subtotal || 0),
        discount: Number(raw.discount || 0),
        totalItems: Number(raw.totalItems || (raw.items ? raw.items.length : 0)),
      };
      updateSidebarSummary();
    } else {
      cartData = { _id: null, items: [], subtotal: 0, discount: 0, totalItems: 0 };
      updateSidebarSummary();
    }
  } catch (e) {
    console.error("Error loading cart:", e);
    cartData = { _id: null, items: [], subtotal: 0, discount: 0, totalItems: 0 };
    updateSidebarSummary();
  }
}

function computePricing() {
  const subtotal = Number(cartData?.subtotal || 0);
  const discount = Number(cartData?.discount || 0);
  const shipping = subtotal >= 500 ? 0 : 50;
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18);
  const total = taxable + shipping + tax;
  return { subtotal, discount, shipping, tax, total };
}

function currency(v) {
  return `₹${Number(v || 0)}`;
}

function updateSidebarSummary() {
  if (!cartData) return;
  const el = document.getElementById("order-summary-sidebar");
  if (!el) return;

  const { subtotal, discount, shipping, tax, total } = computePricing();

  const itemsHtml = (cartData.items || [])
    .map(
      (it) => `
      <div class="d-flex justify-content-between mb-1 small">
        <span class="text-truncate" style="max-width:70%">${it.product?.title || "Item"} × ${it.quantity}</span>
        <span>${currency(it.price * it.quantity)}</span>
      </div>`
    )
    .join("");

  el.innerHTML = `
    ${itemsHtml ? `<div class="mb-2">${itemsHtml}<hr/></div>` : ""}
    <div class="d-flex justify-content-between mb-2"><span>Subtotal (${cartData.totalItems} items)</span><span>${currency(subtotal)}</span></div>
    <div class="d-flex justify-content-between mb-2"><span>Discount</span><span class="text-success">- ${currency(discount)}</span></div>
    <div class="d-flex justify-content-between mb-2"><span>Shipping</span><span>${currency(shipping)}</span></div>
    <div class="d-flex justify-content-between mb-2"><span>Tax (18%)</span><span>${currency(tax)}</span></div>
    <hr/>
    <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${currency(total)}</span></div>
  `;
}

// ===============================
// ADDRESSES
// ===============================
async function loadSavedAddresses() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();

    if (res.ok && data.success) {
      displayAddresses(data.user?.addresses || data.data?.user?.addresses || []);
    } else {
      console.error("Failed to load addresses:", data.message);
    }
  } catch (e) {
    console.error("Error fetching addresses:", e);
  }
}

function displayAddresses(addresses) {
  const list = document.getElementById("address-list");
  if (!list) return;

  if (!addresses.length) {
    list.innerHTML = `<p class="text-muted mb-0">No saved addresses found.</p>`;
    showAddressForm();
    return;
  }

  list.innerHTML = addresses
    .map(
      (a) => `
      <div class="address-item mb-3">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="selectedAddress"
                 onchange='selectAddress(${JSON.stringify(a).replace(/"/g, "&quot;")})'>
          <label class="form-check-label w-100">
            <div class="card">
              <div class="card-body">
                <strong>${a.name || "Name"}</strong><br/>
                ${a.street}<br/>
                ${a.city}, ${a.state} ${a.zipCode}<br/>
                <small class="text-muted">${a.type || "home"} • ${a.phone || ""}</small>
              </div>
            </div>
          </label>
        </div>
      </div>`
    )
    .join("");
}

function selectAddress(address) {
  selectedAddress = address;
  const btn = document.getElementById("shipping-continue");
  if (btn) btn.disabled = false;
}

function showAddressForm() {
  const box = document.getElementById("address-form-container");
  if (box) box.style.display = "block";
}
function hideAddressForm() {
  const box = document.getElementById("address-form-container");
  if (box) box.style.display = "none";
}

function setupFormHandlers() {
  const form = document.getElementById("address-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await saveAddress();
    });
  }

  const toReview = document.getElementById("to-review");
  if (toReview) {
    toReview.addEventListener("click", () => {
      if (!validatePayment()) return;
      nextStep();
    });
  }

  const placeBtn = document.getElementById("place-order");
  if (placeBtn) {
    placeBtn.addEventListener("click", placeOrder);
  }
}

async function saveAddress() {
  const payload = {
    name: document.getElementById("address-name")?.value?.trim(),
    phone: document.getElementById("address-phone")?.value?.trim(),
    street: document.getElementById("address-street")?.value?.trim(),
    city: document.getElementById("address-city")?.value?.trim(),
    state: document.getElementById("address-state")?.value?.trim(),
    zipCode: document.getElementById("address-zip")?.value?.trim(),
    type: document.getElementById("address-type")?.value || "home",
    isDefault: document.getElementById("address-default")?.checked || false,
  };

  if (!payload.name || !payload.phone || !payload.street || !payload.city || !payload.state || !payload.zipCode) {
    return showNotification("Please fill all required address fields.", "danger");
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showNotification("Address saved successfully!");
      hideAddressForm();
      loadSavedAddresses();
    } else {
      showNotification("Error saving address: " + (data.message || "Unknown error"), "danger");
    }
  } catch (e) {
    showNotification("Error saving address", "danger");
  }
}

// ===============================
// PAYMENT (UI + validation)
// ===============================
function setupPaymentUI() {
  document.querySelectorAll('input[name="payment-method"]').forEach((r) => {
    r.addEventListener("change", () => {
      selectedPaymentMethod = r.value;
      document.getElementById("pay-upi").style.display = selectedPaymentMethod === "upi" ? "block" : "none";
      document.getElementById("pay-card").style.display = selectedPaymentMethod === "card" ? "block" : "none";
      document.getElementById("pay-netbanking").style.display = selectedPaymentMethod === "netbanking" ? "block" : "none";
    });
  });
}

function validatePayment() {
  if (selectedPaymentMethod === "upi") {
    const upi = document.getElementById("upi-id").value.trim();
    if (!/^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(upi)) {
      showNotification("Enter a valid UPI ID (e.g., yourname@oksbi).", "danger");
      return false;
    }
  }
  if (selectedPaymentMethod === "card") {
    const num = document.getElementById("card-number").value.replace(/\s+/g, "");
    const name = document.getElementById("card-name").value.trim();
    const exp = document.getElementById("card-exp").value.trim();
    const cvv = document.getElementById("card-cvv").value.trim();
    const expOk = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
    if (num.length < 12 || !name || !expOk || cvv.length < 3) {
      showNotification("Please enter valid card details.", "danger");
      return false;
    }
  }
  if (selectedPaymentMethod === "netbanking") {
    const bank = document.getElementById("nb-bank").value;
    if (!bank) {
      showNotification("Please select your bank for Netbanking.", "danger");
      return false;
    }
  }
  return true;
}

// ===============================
// CHECKOUT STEPS
// ===============================
function showStep(step) {
  document.querySelectorAll(".checkout-step").forEach((s) => (s.style.display = "none"));
  document.getElementById(`step-${step}`).style.display = "block";
  currentStep = step;

  document.querySelectorAll(".checkout-steps .step").forEach((el, i) => {
    el.classList.remove("active", "completed");
    const logical = i + 2;
    if (logical === step) el.classList.add("active");
    else if (logical < step) el.classList.add("completed");
  });

  if (step === 4) loadReviewStep();
  if (step === 5) loadSuccessStep();
}
function nextStep() {
  if (currentStep < 5) showStep(currentStep + 1);
}
function prevStep() {
  if (currentStep > 2) showStep(currentStep - 1);
}

// ===============================
// REVIEW
// ===============================
function loadReviewStep() {
  if (selectedAddress) {
    document.getElementById("selected-address").innerHTML = `
      <div class="card"><div class="card-body p-2">
        <strong>${selectedAddress.name || ""}</strong><br/>
        ${selectedAddress.street}<br/>
        ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zipCode}<br/>
        <small class="text-muted">${selectedAddress.type || "home"} • ${selectedAddress.phone || ""}</small>
      </div></div>`;
  }

  let payText = selectedPaymentMethod.toUpperCase();
  if (selectedPaymentMethod === "card") {
    const masked = (document.getElementById("card-number").value || "").replace(/\d(?=\d{4})/g, "•");
    payText = `CARD • ${masked || "XXXX ••••"}`;
  } else if (selectedPaymentMethod === "upi") {
    payText = `UPI • ${(document.getElementById("upi-id").value || "").trim()}`;
  } else if (selectedPaymentMethod === "netbanking") {
    payText = `NET BANKING • ${document.getElementById("nb-bank").value || ""}`;
  }
  document.getElementById("selected-payment").innerHTML = `
    <div class="card"><div class="card-body p-2">${payText}</div></div>`;

  const itemsHtml = (cartData.items || [])
    .map(
      (it) => `
      <div class="d-flex justify-content-between mb-2">
        <span>${it.product?.title || "Item"} × ${it.quantity}</span>
        <span>${currency(it.price * it.quantity)}</span>
      </div>`
    )
    .join("");

  const { subtotal, discount, shipping, tax, total } = computePricing();

  document.getElementById("order-summary").innerHTML = `
    ${itemsHtml || `<p class="text-muted">Your cart is empty.</p>`}
    <hr/>
    <div class="d-flex justify-content-between"><span>Subtotal</span><span>${currency(subtotal)}</span></div>
    <div class="d-flex justify-content-between"><span>Discount</span><span class="text-success">- ${currency(discount)}</span></div>
    <div class="d-flex justify-content-between"><span>Shipping</span><span>${currency(shipping)}</span></div>
    <div class="d-flex justify-content-between"><span>Tax</span><span>${currency(tax)}</span></div>
    <hr/>
    <div class="d-flex justify-content-between fw-bold"><span>Total</span><span>${currency(total)}</span></div>
  `;
}

// ===============================
// SUCCESS
// ===============================
function loadSuccessStep() {
  if (!orderData) return;
  document.getElementById("order-details").innerHTML = `
    <div class="alert alert-info text-start">
      <div><strong>Order Number:</strong> ${orderData.orderNumber || orderData._id || "—"}</div>
      <div><strong>Total Paid:</strong> ${currency(orderData.totalAmount)}</div>
    </div>`;
}

// ===============================
// PLACE ORDER (backend uses carts collection)
// ===============================
async function placeOrder() {
  if (!selectedAddress) return showNotification("Please select a shipping address.", "danger");
  if (!cartData || !cartData.items || !cartData.items.length) return showNotification("Cart is empty.", "danger");

  const btn = document.getElementById("place-order");
  if (btn) { btn.disabled = true; btn.innerText = "Placing..."; }

  try {
    // ✅ attach seller to each product item
    const itemsWithSeller = cartData.items.map(it => ({
      product: it.product?._id || it.product?.id || it.product,
      seller: it.product?.seller || null,   // seller field
      quantity: it.quantity,
      price: it.price,
      title: it.product?.title,
      author: it.product?.author,
      image: it.product?.images?.[0]?.url || ""
    }));

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        shippingAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod,
        notes: "",
        items: itemsWithSeller   // send items with seller
      }),
    });

    const data = await res.json();
    console.log("Place Order response:", data);

    if (res.ok && data.success) {
      orderData = data.data.order;
      showNotification("Order placed successfully!");
      showStep(5);
    } else {
      showNotification("Error placing order: " + (data.message || "Unknown error"), "danger");
    }
  } catch (e) {
    console.error("Order placement error:", e);
    showNotification("Error placing order. Please try again.", "danger");
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-lock me-1"></i> Place Order`; }
  }
}

// ===============================
// NOTIFICATION
// ===============================
function showNotification(message, type = "success") {
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} position-fixed shadow`;
  alert.style.cssText = "top:20px; right:20px; z-index:9999; min-width:280px;";
  alert.innerHTML = `<i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"} me-2"></i>${message}`;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 4200);
}
