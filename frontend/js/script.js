const API_BASE_URL = "http://localhost:5000/api";
let allProducts = [];
let activeCategory = "all";           
let activeTopTab = "new-arrivals";    

// ===============================
// API HELPER
// ===============================
async function apiRequest(url, method = "GET", body = null, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `API error: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API request failed:", err.message);
    return null;
  }
}

// ===============================
// RIGHT DRAWER
// ===============================
function toggleSidebar() {
  document.getElementById("sidebarMenu").classList.toggle("show");
}

// ===============================
// CART (Backend-powered)
// ===============================
async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first");
    return;
  }

  const res = await fetch(`${API_BASE_URL}/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ productId, quantity })
  });

  const data = await res.json();
  if (res.ok && data.success) {
    alert("Item added to cart!");
    updateCartCount();
    loadCartPreview();
  } else {
    alert(data.message || "Failed to add to cart");
  }
}

async function updateCartCount() {
  const token = localStorage.getItem("token");
  const cartCountEl = document.querySelector(".cart-count");
  if (!cartCountEl) return;

  if (!token) {
    cartCountEl.textContent = "0";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart/count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    cartCountEl.textContent = (res.ok && data.success) ? data.count || 0 : "0";
  } catch (err) {
    console.error("Failed to fetch cart count:", err.message);
    cartCountEl.textContent = "0";
  }
}

async function loadCartPreview() {
  const token = localStorage.getItem("token");
  const preview = document.getElementById("cartPreview");
  if (!preview) return;

  if (!token) {
    preview.innerHTML = "<p class='p-2 text-muted'>Please log in</p>";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const text = await res.text();
    console.log("Cart API raw response:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Cart API did not return JSON, maybe HTML error page.");
      preview.innerHTML = "<p class='p-2 text-danger'>Cart API error (check console)</p>";
      return;
    }

    if (!res.ok || !data.success) {
      console.error("❌ Cart API error JSON:", data);
      preview.innerHTML = "<p class='p-2 text-danger'>Failed to load cart</p>";
      return;
    }

    const cart = data.data?.cart;
    const items = cart?.items || [];

    if (!items.length) {
      preview.innerHTML = "<p class='p-2 text-muted'>Cart is empty</p>";
      return;
    }

    preview.innerHTML = items.map(item => {
      const p = item.product;
      return `
        <div class="d-flex align-items-center border-bottom p-2">
          <img src="${p?.images?.[0]?.url || 'https://placehold.co/50x70?text=Book'}" 
               alt="${p?.title}" width="40" height="55" class="me-2" />
          <div class="flex-grow-1">
            <div style="font-weight:600;font-size:14px">${p?.title}</div>
            <div style="font-size:13px">₹${item.price} × ${item.quantity}</div>
          </div>
        </div>
      `;
    }).join("") + `<div class="p-2 text-center"><a href="cart.html" class="btn btn-sm btn-primary">View Full Cart</a></div>`;

  } catch (err) {
    console.error("Cart preview error:", err);
    preview.innerHTML = "<p class='p-2 text-danger'>Error loading cart</p>";
  }
}

// ===============================
// WISHLIST COUNTER
// ===============================
async function updateWishlistCount() {
  const token = localStorage.getItem("token");
  const wishlistCountEl = document.querySelector(".wishlist-count");
  if (!wishlistCountEl) return;

  if (!token) {
    wishlistCountEl.textContent = "0";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    // ✅ fixed: should use data.count not data.data.count
    wishlistCountEl.textContent = (res.ok && data.success) ? data.count || 0 : "0";
  } catch (err) {
    console.error("Failed to fetch wishlist count:", err.message);
    wishlistCountEl.textContent = "0";
  }
}

// ===============================
// PROFILE MENU
// ===============================
const profileMenu = document.getElementById("profileMenu");
const profileIcon = document.getElementById("profile-icon");

// ✅ Set profile icon with first letter of user name
document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser && profileIcon) {
    const firstLetter = loggedInUser.name.charAt(0).toUpperCase();
    profileIcon.innerText = firstLetter;
  } else if (profileIcon) {
    profileIcon.innerText = "U"; // default
  }
});

// ✅ Toggle profile menu
function toggleProfileMenu(event) {
  event.preventDefault();
  profileMenu?.classList.toggle("show");

  const token = localStorage.getItem("token");
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (token && loggedInUser) {
    let menuHtml = `
      <a href="cart.html"><i class="fa fa-shopping-cart"></i> Cart</a>
      <a href="wishlist.html"><i class="fa fa-heart"></i> Wishlist</a>
      <a href="order-history.html"><i class="fa fa-box"></i> Orders</a>
      <a href="edit-profile.html"><i class="fa fa-user-edit"></i> Edit Profile</a>
      <a href="become-seller.html"><i class="fa fa-store"></i> Become a Seller</a>
    `;

    // ✅ Role-based dashboard access
    if (loggedInUser.role === "seller") {
      menuHtml += `<a href="seller-dashboard.html"><i class="fa fa-chart-line"></i> Seller Dashboard</a>`;
    }

    if (loggedInUser.role === "admin") {
      menuHtml += `
        <a href="seller-dashboard.html"><i class="fa fa-chart-line"></i> Seller Dashboard</a>
        <a href="admin-dashboard.html"><i class="fa fa-tools"></i> Admin Dashboard</a>
      `;
    }

    // ✅ Logout for all
    menuHtml += `<a href="#" onclick="logout()"><i class="fa fa-sign-out-alt"></i> Logout</a>`;

    profileMenu.innerHTML = menuHtml;
  } else {
    // ✅ If not logged in
    profileMenu.innerHTML = `
      <a href="login.html"><i class="fa fa-sign-in-alt"></i> Login</a>
      <a href="signup.html"><i class="fa fa-user-plus"></i> Sign Up</a>
    `;
  }
}

// ✅ Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
  alert("Logged out successfully!");
  window.location.href = "login.html";
}


// ✅ Close menu if clicked outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-menu")) {
    profileMenu?.classList.remove("show");
  }
});

// ✅ Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("userName");
  window.location.href = "login.html";
}

// function logout() { localStorage.removeItem("token"); location.reload(); }

// ===============================
// MOBILE CATEGORY MENU
// ===============================
function toggleMobileCategories(event) {
  event.preventDefault();
  const menu = document.getElementById("mobileCategories");
  menu?.classList.toggle("show");
}
function closeMobileMenu() {
  const menu = document.getElementById("mobileCategories");
  menu?.classList.remove("show");
}

// ===============================
// CATEGORY + TABS
// ===============================
function setCategory(category) {
  activeCategory = (category || "all").toLowerCase();
  applyTabFilter();                            
  scrollToProducts(activeTopTab);
}

function switchTab(tabId) {
  activeTopTab = tabId;                        
  document.querySelectorAll(".tab-pane").forEach(tab => tab.classList.remove("active"));
  document.getElementById(tabId)?.classList.add("active");
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  document.querySelector(`[data-tab='${tabId}']`)?.classList.add("active");
  applyTabFilter();
}

function scrollToProducts(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function applyTabFilter() {
  const base = activeCategory === "all"
    ? allProducts
    : allProducts.filter(p => (p.category || "").toLowerCase() === activeCategory);

  const grids = {
    "new-arrivals": { id: "newArrivalsGrid", pred: (p) => p.isNew },
    "featured":     { id: "featuredGrid",     pred: (p) => p.isFeatured },
    "best-sellers": { id: "bestSellersGrid",  pred: (p) => p.isBestSeller }
  };

  const cfg = grids[activeTopTab];
  const list = base.filter(cfg.pred);
  renderProducts(list, cfg.id, 6, activeCategory);
}

// ===============================
// SEARCH
// ===============================
function searchBooks(event) {
  event.preventDefault();
  const q = (document.getElementById("searchInput").value || "").toLowerCase().trim();
  const results = allProducts.filter(p =>
    (p.title || "").toLowerCase().includes(q) ||
    (p.author || "").toLowerCase().includes(q) ||
    (p.category || "").toLowerCase().includes(q)
  );
  activeCategory = "all";
  activeTopTab = "new-arrivals";
  switchTab("new-arrivals");
  renderProducts(results, "newArrivalsGrid", results.length); 
}

// ===============================
// RENDER PRODUCTS
// ===============================
function renderProducts(products, gridId, limit = 6, category = null) {
  const container = document.getElementById(gridId);
  if (!container) return;

  const limited = products.slice(0, limit);

  container.innerHTML = limited.length ? limited.map(p => `
    <div class="product-card">
      <div class="product-image">
        <img src="${p.images?.[0]?.url || p.image || 'https://placehold.co/200x300?text=Book'}" 
             alt="${p.title}" 
             onerror="this.onerror=null;this.src='https://placehold.co/200x300?text=No+Image';">
        <div class="product-overlay">
          <h5 class="product-title">${p.title}</h5>
          <button class="btn-wishlist" onclick="addToWishlist('${p._id}')">
            <i class="fa fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="product-info">
        <p>${p.author}</p>
        <p>₹${p.price}</p>
        <button class="btn btn-sm btn-primary" onclick="addToCart('${p._id}')">Add to Cart</button>
      </div>
    </div>
  `).join('') : "<p>No products found.</p>";

 if (products.length > limit) {
  const viewMore = document.createElement("div");
  viewMore.classList.add("view-more");
  viewMore.innerHTML = `
    <button class="btn btn-link" onclick="window.location.href='product.html?category=${encodeURIComponent(category || gridId)}'">
      View More →
    </button>`;
  container.appendChild(viewMore);
}

}

// ===============================
// WISHLIST (Backend-powered)
// ===============================
async function addToWishlist(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in first to use wishlist");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/wishlist/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ productId })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert("Book added to wishlist!");
      updateWishlistCount();
    } else {
      alert(data.message || "Failed to add to wishlist");
    }
  } catch (err) {
    console.error("Add to wishlist error:", err);
    alert("Error adding to wishlist");
  }
}

function goToCategory(category, tab) {
  window.location.href = `products.html?category=${encodeURIComponent(category)}&tab=${encodeURIComponent(tab)}`;
}

// ===============================
// FETCH PRODUCTS
// ===============================
async function fetchProducts() {
  const res = await apiRequest(`${API_BASE_URL}/products`, "GET", null, false);
  if (!res || !res.success) return;

  const products = res.data?.products || [];
  if (!Array.isArray(products)) return;

  allProducts = products;

  // Render product sections
  renderProducts(products.filter(p => p.isNew), "newArrivalsGrid", 6, "new-arrivals");
  renderProducts(products.filter(p => p.isFeatured), "featuredGrid", 6, "featured");
  renderProducts(products.filter(p => p.isBestSeller), "bestSellersGrid", 6, "best-sellers");

  renderProducts(products.filter(p => (p.category || "").toLowerCase() === 'fiction'), "fictionGrid", 6, "fiction");
  renderProducts(products.filter(p => (p.category || "").toLowerCase() === 'non-fiction'), "nonFictionGrid", 6, "non-fiction");
  renderProducts(products.filter(p => (p.category || "").toLowerCase() === 'education'), "educationGrid", 6, "education");

  // Top Rated Books
  const topRated = [...allProducts].sort((a,b) => (b.rating || 0) - (a.rating || 0)).slice(0,5);
  const topRatedContainer = document.getElementById("topRatedBooks");
  if (topRatedContainer) {
    topRatedContainer.innerHTML = topRated.map(p => `
      <div class="top-book d-flex align-items-center gap-2 mb-2">
        <img src="${p?.images?.[0]?.url || 'https://placehold.co/80x110?text=Book'}"
             alt="${p.title}"
             width="40" height="55"
             onerror="this.onerror=null;this.src='https://placehold.co/80x110?text=No+Image';">
        <div>
          <div style="font-weight:600">${p.title}</div>
          <div>₹${p.price}</div>
        </div>
      </div>
    `).join('');
  }

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {
  await updateCartCount();
  await updateWishlistCount();
  await fetchProducts();
  await loadCartPreview();
});
