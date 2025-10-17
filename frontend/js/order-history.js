// ===============================
// Order History Functionality
// ===============================
const API_BASE_URL = 'http://localhost:5000/api';

let currentPage = 1;
let currentFilter = 'all';
let orders = [];
let pagination = {};

// Initialize order history page
document.addEventListener('DOMContentLoaded', function () {
  initializeOrderHistory();
});

function initializeOrderHistory() {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to view your orders');
    window.location.href = 'login.html';
    return;
  }

  // Setup filter handlers
  setupFilterHandlers();

  // Load orders
  loadOrders();
}

function setupFilterHandlers() {
  document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', function () {
      currentFilter = this.value;
      currentPage = 1;
      loadOrders();
    });
  });
}

async function loadOrders() {
  showLoading(true);
  hideEmptyState();
  hideOrdersList();

  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit: 10
    });

    const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();

      // ✅ match backend response
      orders = data.data.orders;
      pagination = {
        totalPages: data.data.totalPages || 1,
        currentPage: data.data.currentPage || 1
      };

      // Filter orders based on selected filter
      let filteredOrders = orders;
      if (currentFilter !== 'all') {
        filteredOrders = orders.filter(order => order.orderStatus === currentFilter);
      }

      if (filteredOrders.length === 0) {
        showEmptyState();
      } else {
        displayOrders(filteredOrders);
        updatePagination();
      }
    } else {
      const error = await response.json();
      showAlert('Error loading orders: ' + error.message, 'danger');
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    showAlert('Error loading orders. Please try again.', 'danger');
  } finally {
    showLoading(false);
  }
}

function changePage(direction) {
  if (direction === 'next' && currentPage < pagination.totalPages) {
    currentPage++;
    loadOrders();
  } else if (direction === 'prev' && currentPage > 1) {
    currentPage--;
    loadOrders();
  }
}

function updatePagination() {
  const paginationEl = document.getElementById('pagination');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');

  if (pagination.totalPages > 1) {
    paginationEl.style.display = 'block';
    prevBtn.classList.toggle('disabled', currentPage === 1);
    nextBtn.classList.toggle('disabled', currentPage === pagination.totalPages);
  } else {
    paginationEl.style.display = 'none';
  }
}

function displayOrders(orders) {
  const ordersList = document.getElementById('orders-list');

  const ordersHtml = orders.map(order => `
        <div class="card mb-3 order-card" data-order-id="${order._id}">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-3">
                        <h6 class="mb-1">Order #${order.orderNumber}</h6>
                        <small class="text-muted">${formatDate(order.createdAt)}</small>
                    </div>
                    <div class="col-md-2">
                        <span class="badge bg-${getStatusColor(order.orderStatus)} fs-6">
                            ${formatStatus(order.orderStatus)}
                        </span>
                    </div>
                    <div class="col-md-2">
                        <strong>₹${order.totalAmount}</strong>
                    </div>
                    <div class="col-md-3">
                        <small class="text-muted">
                            ${order.items.length} item${order.items.length > 1 ? 's' : ''}
                        </small>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails('${order._id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        ${order.orderStatus === 'shipped' || order.orderStatus === 'delivered'
      ? `<button class="btn btn-outline-success btn-sm ms-1" onclick="trackOrder('${order._id}')">
                                <i class="fas fa-truck"></i> Track
                            </button>` : ''}
                    </div>
                </div>
                
                <!-- Order Items Preview -->
                <div class="mt-3">
                    <div class="row">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="col-md-4">
                                <div class="d-flex align-items-center">
                                    <img src="${item.product?.images?.[0]?.url || 'placeholder.jpg'}" 
                                         alt="${item.title}" 
                                         class="me-2" 
                                         style="width: 40px; height: 50px; object-fit: cover;">
                                    <div>
                                        <small class="fw-bold">${item.title}</small><br>
                                        <small class="text-muted">Qty: ${item.quantity}</small>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `
                            <div class="col-md-4">
                                <div class="d-flex align-items-center">
                                    <div class="text-muted">
                                        <small>+${order.items.length - 3} more items</small>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');

  ordersList.innerHTML = ordersHtml;
  document.getElementById('orders-list').style.display = 'block';
}

async function viewOrderDetails(orderId) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const order = data.data.order;
      displayOrderDetailsModal(order);
    } else {
      const error = await response.json();
      showAlert('Error loading order details: ' + error.message, 'danger');
    }
  } catch (error) {
    console.error('Error loading order details:', error);
    showAlert('Error loading order details', 'danger');
  }
}

function displayOrderDetailsModal(order) {
  const modalContent = document.getElementById('order-details-content');

  modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6>Order Information</h6>
                <div class="card">
                    <div class="card-body">
                        <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                        <p><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
                        <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(order.orderStatus)}">${formatStatus(order.orderStatus)}</span></p>
                        <p><strong>Payment Method:</strong> ${formatPaymentMethod(order.paymentMethod)}</p>
                        <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                        ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <h6>Delivery Address</h6>
                <div class="card">
                    <div class="card-body">
                        <p><strong>${order.shippingAddress.street}</strong></p>
                        <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                        <p>${order.shippingAddress.country}</p>
                    </div>
                </div>
            </div>
        </div>

        <hr>

        <h6>Order Items</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <img src="${item.product?.images?.[0]?.url || 'placeholder.jpg'}" 
                                         alt="${item.title}" 
                                         class="me-2" 
                                         style="width: 40px; height: 50px; object-fit: cover;">
                                    <div>
                                        <div class="fw-bold">${item.title}</div>
                                        <small class="text-muted">by ${item.author}</small>
                                    </div>
                                </div>
                            </td>
                            <td>₹${item.price}</td>
                            <td>${item.quantity}</td>
                            <td>₹${item.price * item.quantity}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="row">
            <div class="col-md-6">
                <h6>Order Summary</h6>
                <div class="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>₹${order.subtotal}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Shipping:</span>
                    <span>₹${order.shippingCost}</span>
                </div>
                <div class="d-flex justify-content-between">
                    <span>Tax:</span>
                    <span>₹${order.tax}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>₹${order.totalAmount}</span>
                </div>
            </div>
        </div>
    `;

  // Show/hide track order button
  const trackBtn = document.getElementById('track-order-btn');
  if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
    trackBtn.style.display = 'inline-block';
    trackBtn.onclick = () => trackOrder(order._id);
  } else {
    trackBtn.style.display = 'none';
  }

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
  modal.show();
}

async function trackOrder(orderId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to track your order");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to track order");

    const order = data.data.order;
    alert(`Order ${order.orderNumber} is currently: ${order.orderStatus}`);
  } catch (err) {
    console.error("❌ Track order error:", err);
    alert("Failed to track order. Please try again.");
  }
}

// ===============================
// Helpers
// ===============================
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatStatus(status) {
  const statusLabels = {
    'pending': 'Pending',
    'confirmed': 'Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'returned': 'Returned'
  };
  return statusLabels[status] || status;
}

function formatPaymentMethod(method) {
  const methodLabels = {
    'cod': 'Cash on Delivery',
    'card': 'Credit/Debit Card',
    'upi': 'UPI',
    'netbanking': 'Net Banking',
    'wallet': 'Wallet'
  };
  return methodLabels[method] || method;
}

function getStatusColor(status) {
  const statusColors = {
    'pending': 'warning',
    'confirmed': 'info',
    'processing': 'primary',
    'shipped': 'success',
    'delivered': 'success',
    'cancelled': 'danger',
    'returned': 'secondary'
  };
  return statusColors[status] || 'secondary';
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function hideEmptyState() {
  document.getElementById('empty-state').style.display = 'none';
}

function hideOrdersList() {
  document.getElementById('orders-list').style.display = 'none';
}

function showEmptyState() {
  document.getElementById('empty-state').style.display = 'block';
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  // Insert at the top of the container
  const container = document.getElementById('orders-container');
  container.insertBefore(alertDiv, container.firstChild);

  // Auto-dismiss after 5 seconds
  setTimeout(() => {
    if (alertDiv.parentNode) {
      alertDiv.remove();
    }
  }, 5000);
}
