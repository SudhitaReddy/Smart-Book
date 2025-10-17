// Order tracking functionality
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize tracking page
document.addEventListener('DOMContentLoaded', function() {
    initializeTracking();
});

function initializeTracking() {
    // Setup form handler
    document.getElementById('tracking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        trackOrder();
    });
}

async function trackOrder() {
    const orderNumber = document.getElementById('order-number').value.trim();
    
    if (!orderNumber) {
        showAlert('Please enter an order number', 'warning');
        return;
    }

    // Show loading state
    showLoading(true);
    hideResults();

    try {
        const response = await fetch(`${API_BASE_URL}/orders/track/${orderNumber}`);
        
        if (response.ok) {
            const data = await response.json();
            displayOrderDetails(data.data.order);
        } else if (response.status === 404) {
            showNoResults();
        } else {
            const error = await response.json();
            showAlert('Error tracking order: ' + error.message, 'danger');
        }
    } catch (error) {
        console.error('Error tracking order:', error);
        showAlert('Error tracking order. Please try again.', 'danger');
    } finally {
        showLoading(false);
    }
}

function displayOrderDetails(order) {
    // Display order information
    document.getElementById('order-info').innerHTML = `
        <div class="card">
            <div class="card-body">
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(order.orderStatus)}">${formatStatus(order.orderStatus)}</span></p>
                <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
                ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${formatDate(order.estimatedDelivery)}</p>` : ''}
            </div>
        </div>
    `;

    // Display delivery address
    document.getElementById('delivery-address').innerHTML = `
        <div class="card">
            <div class="card-body">
                <p><strong>${order.shippingAddress.street}</strong></p>
                <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}</p>
                <p>${order.shippingAddress.country}</p>
            </div>
        </div>
    `;

    // Display order items
    const orderItemsHtml = order.items.map(item => `
        <div class="d-flex align-items-center mb-3">
            <img src="${item.image || 'placeholder.jpg'}" 
                 alt="${item.title}" 
                 class="me-3" 
                 style="width: 60px; height: 80px; object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="mb-1">${item.title}</h6>
                <p class="text-muted mb-1">by ${item.author}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">₹${item.price}</span>
                    <span class="text-muted">Qty: ${item.quantity}</span>
                </div>
            </div>
        </div>
    `).join('');

    document.getElementById('order-items').innerHTML = orderItemsHtml;

    // Display tracking timeline
    displayTrackingTimeline(order.statusHistory);

    // Show order details
    document.getElementById('order-details').style.display = 'block';
}

function displayTrackingTimeline(statusHistory) {
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const statusIcons = {
        'pending': 'fas fa-clock',
        'confirmed': 'fas fa-check-circle',
        'processing': 'fas fa-cog',
        'shipped': 'fas fa-truck',
        'delivered': 'fas fa-gift',
        'cancelled': 'fas fa-times-circle',
        'returned': 'fas fa-undo'
    };

    const statusLabels = {
        'pending': 'Order Placed',
        'confirmed': 'Order Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled',
        'returned': 'Returned'
    };

    let timelineHtml = '<div class="timeline">';
    
    // Create timeline items for each status
    statusOrder.forEach((status, index) => {
        const statusInfo = statusHistory.find(h => h.status === status);
        const isCompleted = statusInfo !== undefined;
        const isCurrent = index === statusOrder.indexOf(status) && isCompleted;
        
        timelineHtml += `
            <div class="timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                <div class="timeline-marker">
                    <i class="${statusIcons[status]}"></i>
                </div>
                <div class="timeline-content">
                    <h6>${statusLabels[status]}</h6>
                    ${statusInfo ? `<p class="text-muted">${formatDate(statusInfo.timestamp)}</p>` : ''}
                    ${statusInfo && statusInfo.note ? `<p class="small">${statusInfo.note}</p>` : ''}
                </div>
            </div>
        `;
    });

    timelineHtml += '</div>';
    document.getElementById('tracking-timeline').innerHTML = timelineHtml;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
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

function hideResults() {
    document.getElementById('order-details').style.display = 'none';
    document.getElementById('no-results').style.display = 'none';
}

function showNoResults() {
    document.getElementById('no-results').style.display = 'block';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the card body
    const cardBody = document.querySelector('.card-body');
    cardBody.insertBefore(alertDiv, cardBody.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}
