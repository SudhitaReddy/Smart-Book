const API_BASE_URL = 'https://smart-book-172w.onrender.com/api';


let currentSection = 'dashboard';
let charts = {};

// =============================
// Init
// =============================
document.addEventListener('DOMContentLoaded', function () {
  initializeAdminDashboard();
});

function initializeAdminDashboard() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to access admin dashboard');
    window.location.href = 'login.html';
    return;
  }
  verifyAdminRole();
  showSection('dashboard'); // default
}

// =============================
// Verify Admin
// =============================
async function verifyAdminRole() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      const data = await response.json();
      const user = data.user || data.data?.user;
      if (!user || user.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
      }
    } else {
      window.location.href = 'login.html';
    }
  } catch (error) {
    console.error('Error verifying admin role:', error);
    window.location.href = 'login.html';
  }
}

// =============================
// Navigation
// =============================
function showSection(sectionName, el) {
  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
  document.getElementById(`${sectionName}-section`).style.display = 'block';

  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  if (el) el.classList.add('active');

  currentSection = sectionName;

  switch (sectionName) {
    case 'dashboard': loadDashboardData(); break;
    case 'users': loadUsers(); break;
    case 'products': loadProducts(); break;
    case 'orders': loadOrders(); break;
    case 'sellers': loadSellers(); break;
    case 'seller-requests': loadSellerRequests(); break;
    case 'reports': loadReports(); break;
  }
}

// =============================
// Dashboard
// =============================
async function loadDashboardData() {
  await loadStats();
  loadCharts();
  loadRecentOrders();
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error("Failed to fetch stats");
    const data = await res.json();
    const stats = data.data || {};
    document.getElementById('total-users').textContent = stats.totalUsers || 0;
    document.getElementById('total-products').textContent = stats.totalProducts || 0;
    document.getElementById('total-orders').textContent = stats.totalOrders || 0;
    document.getElementById('total-revenue').textContent = `₹${stats.totalRevenue || 0}`;
  } catch (err) {
    console.error('❌ Error loading stats:', err);
  }
}

function loadCharts() {
  // keep static sample data for now
  const salesCtx = document.getElementById('salesChart').getContext('2d');
  charts.sales?.destroy();
  charts.sales = new Chart(salesCtx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{ label: 'Sales', data: [12000,19000,15000,25000,22000,30000], borderColor: 'rgb(75,192,192)' }]
    }
  });
}

async function loadRecentOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders/recent`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to fetch recent orders → ${res.status} ${res.statusText}: ${errText}`);
    }

    const data = await res.json();
    const orders = data.data?.orders || [];

    const html = orders.map(o => `
      <div class="d-flex justify-content-between border-bottom py-2">
        <div><strong>#${o.orderNumber || o._id?.slice(-6)}</strong><br><small>${o.user?.name || '-'}</small></div>
        <div class="text-end">
          <span class="badge bg-${getStatusColor(o.orderStatus)}">${formatStatus(o.orderStatus)}</span><br>
          <small>₹${o.totalAmount}</small>
        </div>
      </div>`).join('');

    document.getElementById('recent-orders').innerHTML = html;
  } catch (err) {
    console.error('❌ Error loading recent orders:', err);
    showAlert(err.message, 'danger');
  }
}


// =============================
// Users
// =============================
async function loadUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    const data = await res.json();
    const users = data.data?.users || [];

    document.getElementById('users-table').innerHTML = users.map(u => `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><span class="badge bg-${getRoleColor(u.role)}">${u.role}</span></td>
        <td><span class="badge bg-${u.isActive ? 'success' : 'danger'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
        <td>${formatDate(u.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="toggleUser('${u._id}')">Toggle</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    console.error('❌ Load users error:', err);
    showAlert('Error loading users', 'danger');
  }
}

async function toggleUser(id) {
  await fetch(`${API_BASE_URL}/admin/users/${id}/toggle`, { 
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
  });
  loadUsers();
}

// =============================
// Products
// =============================
async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/products`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();
    const products = data.data?.products || [];

    document.getElementById('products-table').innerHTML = products.map(p => `
      <tr>
        <td><img src="${p.images?.[0]?.url || 'https://via.placeholder.com/40x50?text=No+Image'}" width="40" height="50"></td>
        <td>${p.title}</td>
        <td>${p.author || '-'}</td>
        <td>${p.category || '-'}</td>
        <td>₹${p.price}</td>
        <td>${p.stock}</td>
        <td>
          <span class="badge bg-${p.isActive ? 'success' : 'danger'}">
            ${p.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editProduct('${p._id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('❌ Load products error:', err);
    showAlert(err.message, 'danger');
  }
}


async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      showAlert("Product deleted successfully", "success");
      loadProducts();
    } else {
      showAlert("Error deleting product", "danger");
    }
  } catch (err) {
    console.error("❌ Delete product error:", err);
    showAlert("Error deleting product", "danger");
  }
}
async function editProduct(id) {
  try {
    // Fetch existing product
    const res = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    const data = await res.json();
    const product = data.data?.product;

    // Ask admin for new values
    const newTitle = prompt("Edit Product Title:", product.title);
    const newPrice = prompt("Edit Product Price:", product.price);
    const newStock = prompt("Edit Stock:", product.stock);

    if (!newTitle || !newPrice || !newStock) return;

    // Send update request
    const updateRes = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        title: newTitle,
        price: Number(newPrice),
        stock: Number(newStock)
      })
    });

    if (updateRes.ok) {
      showAlert("✅ Product updated successfully", "success");
      loadProducts();
    } else {
      showAlert("❌ Failed to update product", "danger");
    }
  } catch (err) {
    console.error("❌ Edit product error:", err);
    showAlert("Error editing product", "danger");
  }
}

// =============================
// Orders
// =============================
async function loadOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    const orders = data.data?.orders || [];

    document.getElementById('orders-table').innerHTML = orders.map(o => `
      <tr>
        <td>#${o.orderNumber || o._id?.slice(-6)}</td>
        <td>${o.user?.name || '-'}</td>
        <td>₹${o.totalAmount}</td>
        <td><span class="badge bg-${getStatusColor(o.orderStatus)}">${formatStatus(o.orderStatus)}</span></td>
        <td>${formatDate(o.createdAt)}</td>
        <td><button class="btn btn-sm btn-info">View</button></td>
      </tr>`).join('');
  } catch (err) {
    console.error('❌ Load orders error:', err);
  }
}

// =============================
// Sellers
// =============================
async function loadSellers() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/sellers`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error("Failed to fetch sellers");
    const data = await res.json();
    const sellers = data.data?.sellers || [];

    document.getElementById('sellers-table').innerHTML = sellers.map(s => `
      <tr>
        <td>${s.businessName}</td>
        <td>${s.user?.name || '-'}</td>
        <td>${s.status}</td>
        <td>${s.stats?.totalProducts || 0}</td>
        <td>₹${s.stats?.totalRevenue || 0}</td>
        <td><button class="btn btn-sm btn-info">View</button></td>
      </tr>`).join('');
  } catch (err) {
    console.error('❌ Load sellers error:', err);
  }
}

// =============================
// Seller Requests
// =============================
// =============================
// Seller Requests
// =============================
async function loadSellerRequests() {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/seller/requests`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch requests");

    const requests = data.data?.requests || [];

    // Build table rows
    document.getElementById("seller-requests-table").innerHTML = requests.length
      ? requests.map(req => `
        <tr>
          <td>${req.user?.name || '-'}</td>
          <td>${req.user?.email || '-'}</td>
          <td>${req.businessName || '-'}</td>
          <td>
            <span class="badge bg-${req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "danger"}">
              ${formatStatus(req.status)}
            </span>
          </td>
          <td>${formatDate(req.createdAt)}</td>
          <td>
            ${req.status === "pending" ? `
              <button class="btn btn-sm btn-success" onclick="approveSellerRequest('${req._id}')">Approve</button>
              <button class="btn btn-sm btn-danger" onclick="rejectSellerRequest('${req._id}')">Reject</button>
            ` : "-"}
          </td>
        </tr>
      `).join('')
      : `<tr><td colspan="6" class="text-center">No seller requests found</td></tr>`;

  } catch (err) {
    console.error("❌ Load seller requests error:", err);
    showAlert("Error loading seller requests: " + err.message, "danger");
  }
}

async function approveSellerRequest(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/seller/requests/${id}/approve`, {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showAlert("✅ Seller approved successfully", "success");
      loadSellerRequests();
    } else {
      throw new Error(data.message || "Failed to approve seller");
    }
  } catch (err) {
    console.error("❌ Approve seller error:", err);
    showAlert("Error approving seller: " + err.message, "danger");
  }
}

async function rejectSellerRequest(id) {
  try {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    const res = await fetch(`${API_BASE_URL}/admin/seller/requests/${id}/reject`, {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showAlert("❌ Seller request rejected", "warning");
      loadSellerRequests();
    } else {
      throw new Error(data.message || "Failed to reject seller");
    }
  } catch (err) {
    console.error("❌ Reject seller error:", err);
    showAlert("Error rejecting seller: " + err.message, "danger");
  }
}

// =============================
// Helpers
// =============================
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatStatus(status) {
  const map = { pending:'Pending', approved:'Approved', rejected:'Rejected', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled' };
  return map[status] || status;
}

function getStatusColor(status) {
  const map = { pending:'warning', approved:'success', rejected:'danger', shipped:'info', delivered:'success', cancelled:'danger' };
  return map[status] || 'secondary';
}

function getRoleColor(role) {
  const map = { admin:'danger', seller:'warning', user:'primary' };
  return map[role] || 'secondary';
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
  alertDiv.innerHTML = `
    <div><i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${message}</div>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 4000);
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}
