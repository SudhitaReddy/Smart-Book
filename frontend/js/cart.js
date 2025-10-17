const cartItemsContainer = document.getElementById("cart-items-container");
const itemCountEl = document.getElementById("item-count");
const subtotalEl = document.getElementById("subtotal");
const discountEl = document.getElementById("discount");
const totalEl = document.getElementById("total");
const couponMsg = document.getElementById("couponMsg");

let cartData = { items: [], subtotal: 0, discount: 0, totalItems: 0, finalAmount: 0 };

// ===============================
// API HELPER
// ===============================
async function apiRequest(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to view your cart");
    return null;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "API error");
    return data;
  } catch (err) {
    console.error("API error:", err.message);
    return null;
  }
}

// ===============================
// FETCH CART
// ===============================
async function fetchCart() {
  const data = await apiRequest(`${API_BASE_URL}/cart`, "GET");
  if (data && data.success) {
    cartData = data.data.cart;
    renderCart(cartData);
  } else {
    cartData = { items: [], subtotal: 0, discount: 0, totalItems: 0, finalAmount: 0 };
    renderCart(cartData);
  }
}

// ===============================
// RENDER CART
// ===============================
function renderCart(cartObj) {
  cartItemsContainer.innerHTML = "";

 
    if (!cartObj.items || cartObj.items.length === 0) {
  cartItemsContainer.innerHTML = `
    <div class="text-center p-5 w-100">
      <h5>Your cart is empty</h5>
      <button class="btn btn-primary mt-3" onclick="window.location.href='product.html'">
        Browse Products
      </button>
    </div>
  `;
  updateSummary(0, 0, 0);
  return;
}

   

  cartObj.items.forEach((item) => {
    const product = item.product || {};
    const productId = product._id || item.product; // ✅ fallback for ObjectId reference
    const quantity = item.quantity || 1;
    const price = item.price || 0;

    const card = document.createElement("div");
    card.className = "card mb-3";
    card.innerHTML = `
      <div class="row g-0 align-items-center">
        <div class="col-md-2">
          <img src="${product.images?.[0]?.url || "https://placehold.co/150x220?text=Book"}" 
               class="img-fluid rounded-start" 
               alt="${product.title || "Product"}">
        </div>
        <div class="col-md-6">
          <div class="card-body">
            <h5 class="card-title">${product.title || "Unknown Product"}</h5>
            <p class="card-text">Author: ${product.author || "Unknown"}</p>
            <p class="card-text">Price: ₹${price} × ${quantity}</p>
          </div>
        </div>
        <div class="col-md-4 d-flex flex-column align-items-end p-3">
          <div class="input-group mb-2" style="width: 120px;">
            <button class="btn btn-outline-secondary" onclick="changeLocalQuantity('${productId}', ${quantity - 1})">-</button>
            <input type="text" id="qty-${productId}" class="form-control text-center" value="${quantity}" readonly>
            <button class="btn btn-outline-secondary" onclick="changeLocalQuantity('${productId}', ${quantity + 1})">+</button>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-warning" onclick="moveToWishlist('${productId}')">Wishlist</button>
            <button class="btn btn-sm btn-success" onclick="updateQuantity('${productId}')">Update</button>
            <button class="btn btn-sm btn-danger" onclick="removeFromCart('${productId}')">Remove</button>
          </div>
        </div>
      </div>
    `;

    cartItemsContainer.appendChild(card);
  });

  updateSummary(cartObj.subtotal, cartObj.discount, cartObj.finalAmount);
}

// ===============================
// TEMP CHANGE LOCAL QUANTITY
// ===============================
function changeLocalQuantity(productId, newQty) {
  if (newQty <= 0) return;
  const qtyInput = document.getElementById(`qty-${productId}`);
  if (qtyInput) qtyInput.value = newQty;
}

// ===============================
// UPDATE QUANTITY
// ===============================
async function updateQuantity(productId) {
  const qtyInput = document.getElementById(`qty-${productId}`);
  const newQty = parseInt(qtyInput.value);

  if (newQty <= 0) {
    await removeFromCart(productId);
    return;
  }

  const data = await apiRequest(`${API_BASE_URL}/cart/items/${productId}`, "PUT", { quantity: newQty });
  if (data && data.success) {
    cartData = data.data.cart;
    renderCart(cartData);
  }
}

// ===============================
// REMOVE ITEM
// ===============================
async function removeFromCart(productId) {
  const data = await apiRequest(`${API_BASE_URL}/cart/items/${productId}`, "DELETE");
  if (data && data.success) {
    cartData = data.data.cart;
    renderCart(cartData);
  }
}

// ===============================
// MOVE TO WISHLIST
// ===============================
function moveToWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem("smartbook-wishlist")) || [];
  if (!wishlist.includes(productId)) {
    wishlist.push(productId);
    localStorage.setItem("smartbook-wishlist", JSON.stringify(wishlist));
    alert("Moved to wishlist!");
  }
  removeFromCart(productId);
}

// ===============================
// COUPON (backend-powered)
// ===============================
async function applyCoupon() {
  const code = document.getElementById("couponInput")?.value.trim();
  if (!code) return;

  const res = await apiRequest(`${API_BASE_URL}/cart/apply-coupon`, "POST", { code });
  if (res && res.success) {
    cartData = res.data.cart;
    couponMsg.innerText = "Coupon applied successfully!";
    renderCart(cartData);
  } else {
    couponMsg.innerText = res?.message || "Invalid coupon";
  }
}

// ===============================
// UPDATE SUMMARY
// ===============================
function updateSummary(subtotal, discount, finalAmount) {
  const totalItems = cartData.totalItems || 0;
  itemCountEl.innerText = totalItems;
  subtotalEl.innerText = `₹${subtotal || 0}`;
  discountEl.innerText = `-₹${discount || 0}`;
  totalEl.innerText = `₹${finalAmount || (subtotal - discount) || 0}`;
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", fetchCart);
