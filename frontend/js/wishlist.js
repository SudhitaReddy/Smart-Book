

// ===============================
// API HELPER
// ===============================
async function apiRequest(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first");
    return null;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
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
// FETCH & RENDER WISHLIST
// ===============================
async function fetchWishlist() {
  const data = await apiRequest(`${API_BASE_URL}/wishlist`, "GET");
  if (data && data.success) {
    const wishlist = data.data.wishlist?.items || [];
    renderWishlist(wishlist);
  } else {
    renderWishlist([]);
  }
}

function renderWishlist(items) {
  const container = document.getElementById("wishlistContainer");
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = "<p>Your wishlist is empty.</p>";
    return;
  }

  items.forEach(item => {
    const product = item.product || {};
    const productId = product._id || item.productId; // fallback if not populated

    container.innerHTML += `
      <div class="col-md-3">
        <div class="card wishlist-item">
          <span class="remove-icon" onclick="removeFromWishlist('${productId}')">
            <i class="fa fa-times"></i>
          </span>
          <img src="${product.images?.[0]?.url || 'https://placehold.co/200x300?text=Book'}" 
               class="wishlist-img card-img-top" 
               alt="${product.title || "Book"}">
          <div class="card-body text-center">
            <h6 class="card-title">${product.title || "Untitled"}</h6>
            <button class="btn btn-danger btn-sm" onclick="moveToCart('${productId}')">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

// ===============================
// REMOVE FROM WISHLIST
// ===============================
async function removeFromWishlist(productId) {
  console.log("Removing productId:", productId);

  const data = await apiRequest(`${API_BASE_URL}/wishlist/items/${productId}`, "DELETE");
  if (data && data.success) {
    fetchWishlist();
  }
}

// ===============================
// MOVE TO CART
// ===============================
async function moveToCart(productId) {
  console.log("Moving to cart, productId:", productId);

  // Remove from wishlist first
  await removeFromWishlist(productId);

  // Then add to cart
  const data = await apiRequest(`${API_BASE_URL}/cart/items`, "POST", {
    productId,
    quantity: 1
  });

  if (data && data.success) {
    alert("Book moved to cart!");
  } else {
    alert("Failed to move book to cart");
  }
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", fetchWishlist);
