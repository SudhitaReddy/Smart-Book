// ===============================
// Seller Dashboard Functionality
// ===============================
const API_BASE_URL = 'https://smart-book-172w.onrender.com/api';


let currentSection = 'dashboard';
let charts = {};
let currentProduct = null;

// Initialize seller dashboard
document.addEventListener('DOMContentLoaded', function () {
  initializeSellerDashboard();

  // Image preview handler
  document.getElementById("product-image-url")?.addEventListener("input", previewImage);
  document.getElementById("product-image-file")?.addEventListener("change", previewImage);
});

function initializeSellerDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to access seller dashboard');
    window.location.href = 'login.html';
    return;
  }

  verifySellerRole();
  loadDashboardData();
  setupEventHandlers();
}

async function verifySellerRole() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user || data.data?.user;

      if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
        alert('Access denied. Seller/Admin privileges required.');
        window.location.href = 'index.html';
        return;
      }
    } else {
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Error verifying seller role:', error);
    window.location.href = 'login.html';
  }
}

function setupEventHandlers() {
  document.getElementById('product-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    saveProduct();
  });

  document.getElementById('profile-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    updateProfile();
  });
}

// ===============================
// Sections Navigation
// ===============================
function showSection(sectionName, el) {
  document.querySelectorAll('.content-section')
    .forEach((section) => (section.style.display = 'none'));
  document.getElementById(`${sectionName}-section`).style.display = 'block';

  document.querySelectorAll('.nav-link').forEach((link) =>
    link.classList.remove('active')
  );
  if (el) el.classList.add('active');

  currentSection = sectionName;

  switch (sectionName) {
    case 'dashboard': loadDashboardData(); break;
    case 'products': loadProducts(); break;
    case 'orders': loadOrders(); break;
    case 'analytics': loadAnalytics(); break;
    case 'profile': loadProfile(); break;
  }
}

// ===============================
// Dashboard Data
// ===============================
async function loadDashboardData() {
  try {
    await loadStats();
    loadCharts();
    await loadRecentOrders();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    showAlert('Error loading dashboard data', 'danger');
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.ok) {
      const data = await response.json();
      const stats = data.data;

      document.getElementById('total-products').textContent = stats.totalProducts || 0;
      document.getElementById('total-orders').textContent = stats.totalSales || 0;
      document.getElementById('total-revenue').textContent = `₹${stats.totalRevenue || 0}`;
      document.getElementById('average-rating').textContent = (stats.averageRating || 0).toFixed(1);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function loadCharts() {
  if (charts.sales) charts.sales.destroy();
  if (charts.topProducts) charts.topProducts.destroy();

  const salesCtx = document.getElementById('salesChart').getContext('2d');
  charts.sales = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Sales',
        data: [5000, 8000, 6000, 10000, 9000, 12000],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: { responsive: true }
  });

  const topProductsCtx = document.getElementById('topProductsChart').getContext('2d');
  charts.topProducts = new Chart(topProductsCtx, {
    type: 'doughnut',
    data: {
      labels: ['Product 1', 'Product 2', 'Product 3', 'Product 4'],
      datasets: [{
        data: [30, 25, 20, 25],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)'
        ]
      }]
    },
    options: { responsive: true }
  });
}

// ===============================
// Recent Orders
// ===============================
async function loadRecentOrders() {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/orders`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    if (response.ok) {
      const data = await response.json();
      const orders = Array.isArray(data.data) ? data.data : data.data?.orders || [];

      const recentOrders = orders.slice(0, 5);
      const ordersHtml = recentOrders.map(order => `
        <div class="d-flex justify-content-between align-items-center border-bottom py-2">
          <div><strong>#${order._id?.slice(-6) || 'N/A'}</strong><br>
            <small class="text-muted">${order.user?.name || "Customer"}</small>
          </div>
          <div class="text-end">
            <span class="badge bg-${getStatusColor(order.orderStatus)}">${formatStatus(order.orderStatus)}</span><br>
            <small>₹${order.totalAmount || 0}</small>
          </div>
        </div>
      `).join('');

      document.getElementById('recent-orders').innerHTML = ordersHtml;
    }
  } catch (err) {
    console.error('Error loading recent orders:', err);
  }
}

// ===============================
// Products CRUD
// ===============================
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/products`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.ok) {
      const data = await response.json();

      // Always normalize to an array
      const products = data.data?.products || data.data || [];
      const productList = Array.isArray(products) ? products : [];

      const productsHtml = productList.map(product => `
        <tr>
          <td>
            <img src="${product.imageUrl || product.images?.[0]?.url || 'placeholder.jpg'}"
                 style="width:40px; height:50px; object-fit:cover;">
          </td>
          <td>${product.title || ''}</td>
          <td>${product.author || ''}</td>
          <td>${product.category || ''}</td>
          <td>₹${product.price || 0}</td>
          <td>${product.stock || 0}</td>
          <td>
            <span class="badge bg-${product.isActive ? 'success' : 'danger'}">
              ${product.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editProduct('${product._id}')">Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product._id}')">Delete</button>
          </td>
        </tr>
      `).join('');

      document.getElementById('products-table').innerHTML = productsHtml;
    } else {
      showAlert("Failed to load products", "danger");
    }
  } catch (error) {
    console.error("Error loading products:", error);
    showAlert("Error loading products", "danger");
  }
}

function showAddProductModal() {
  currentProduct = null;
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('image-preview').style.display = 'none';
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

async function saveProduct() {
  const imageUrl = document.getElementById('product-image-url')?.value.trim();
  const imageFile = document.getElementById('product-image-file')?.files[0];

  let imageData = imageUrl ? { imageUrl } : {};
  if (imageFile) {
    // TODO: Replace with real upload endpoint
    imageData.imageUrl = URL.createObjectURL(imageFile);
  }

  const formData = {
    title: document.getElementById('product-title').value,
    author: document.getElementById('product-author').value,
    category: document.getElementById('product-category').value,
    price: parseFloat(document.getElementById('product-price').value),
    stock: parseInt(document.getElementById('product-stock').value),
    isbn: document.getElementById('product-isbn').value,
    description: document.getElementById('product-description').value,
    publisher: document.getElementById('product-publisher').value,
    publishedYear: parseInt(document.getElementById('product-year').value) || undefined,
    ...imageData
  };

  try {
    const url = currentProduct
      ? `${API_BASE_URL}/seller/products/${currentProduct}`
      : `${API_BASE_URL}/seller/products`;

    const method = currentProduct ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showAlert(
        currentProduct
          ? `Product "${result.data.product.title}" updated successfully!`
          : `Product "${result.data.product.title}" added successfully!`,
        'success'
      );
      bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
      if (currentSection === 'products') loadProducts();
    } else {
      showAlert('Error saving product: ' + (result.message || 'Unknown error'), 'danger');
    }
  } catch (error) {
    console.error('Error saving product:', error);
    showAlert('Error saving product', 'danger');
  }
}

async function editProduct(productId) {
  try {
    const response = await fetch(`${API_BASE_URL}/seller/products`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.ok) {
      const data = await response.json();
      const products = data.data?.products || [];
      const product = products.find(p => p._id === productId);

      if (!product) return showAlert('Product not found', 'danger');

      currentProduct = productId;
      document.getElementById('productModalTitle').textContent = 'Edit Product';
      document.getElementById('product-title').value = product.title;
      document.getElementById('product-author').value = product.author;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-price').value = product.price;
      document.getElementById('product-stock').value = product.stock;
      document.getElementById('product-isbn').value = product.isbn || '';
      document.getElementById('product-description').value = product.description || '';
      document.getElementById('product-publisher').value = product.publisher || '';
      document.getElementById('product-year').value = product.publishedYear || '';
      document.getElementById('product-image-url').value = product.imageUrl || '';

      if (product.imageUrl) {
        document.getElementById('image-preview').src = product.imageUrl;
        document.getElementById('image-preview').style.display = 'block';
      }

      new bootstrap.Modal(document.getElementById('productModal')).show();
    }
  } catch (error) {
    console.error('Error loading product data:', error);
  }
}

async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`${API_BASE_URL}/seller/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });

    if (response.ok) {
      showAlert('Product deleted successfully!', 'success');
      loadProducts();
    } else {
      const error = await response.json();
      showAlert('Error deleting product: ' + error.message, 'danger');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    showAlert('Error deleting product', 'danger');
  }
}

// ===============================
// Utility
// ===============================
function showAddProductModal() {
  currentProduct = null;
  document.getElementById('productModalTitle').textContent = 'Add Product';
  document.getElementById('product-form').reset();

  const preview = document.getElementById('image-preview');
  if (preview) preview.style.display = 'none';  // ✅ only if it exists

  new bootstrap.Modal(document.getElementById('productModal')).show();
}


function logout() {
  localStorage.removeItem('token');
  window.location.href = 'index.html';
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top:20px; right:20px; z-index:9999; min-width:300px;';
  alertDiv.innerHTML = `
      <div class="d-flex align-items-center">
          <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
          <span>${message}</span>
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alertDiv);
  setTimeout(() => { if (alertDiv.parentNode) alertDiv.remove(); }, 5000);
}

// ===============================
// Expose functions
// ===============================
window.showAddProductModal = showAddProductModal;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
