const API_BASE_URL = 'https://smart-book-172w.onrender.com/api';


let currentProduct = null;
let isInWishlist = false;

// Initialize page
document.addEventListener('DOMContentLoaded', initializeProductDetail);

function initializeProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (!productId) return showNotFound();

    loadProductDetails(productId);
    setupEventHandlers();
}

// Load product from API
async function loadProductDetails(productId) {
    showLoading(true);
    hideNotFound();
    hideProductDetails();

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) {
            if (response.status === 404) showNotFound();
            else throw new Error('Failed to load product');
            return;
        }

        const data = await response.json();
        currentProduct = data.data.product;

        displayProductDetails(currentProduct);
        loadReviews();
        checkWishlistStatus();
        loadRelatedProducts();
    } catch (err) {
        console.error(err);
        showAlert('Error loading product. Please try again.', 'danger');
    } finally {
        showLoading(false);
    }
}

// Display main product info
function displayProductDetails(product) {
    document.getElementById('category-breadcrumb').textContent = product.category;
    document.getElementById('product-breadcrumb').textContent = product.title;
    document.getElementById('product-title').textContent = product.title;
    document.getElementById('product-author').textContent = `by ${product.author}`;
    displayRating(product.rating);
    displayPrice(product);
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-stock').textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';

    if (product.seller) {
        document.getElementById('seller-name').textContent = product.seller.businessName || product.seller.name;
        document.getElementById('seller-rating').textContent = `Rating: ${product.seller.stats?.averageRating || 0}/5`;
    }

    displayImages(product.images);
    document.getElementById('product-details').style.display = 'block';
}

// Display rating stars
function displayRating(rating) {
    const ratingContainer = document.getElementById('product-rating');
    const ratingText = document.getElementById('rating-text');
    ratingContainer.innerHTML = generateStarRating(rating.average);
    ratingText.textContent = `(${rating.count} reviews)`;
}

// Display price and discount
function displayPrice(product) {
    const priceElement = document.getElementById('product-price');
    const originalPriceElement = document.getElementById('original-price');
    const discountBadge = document.getElementById('discount-badge');

    priceElement.textContent = `₹${product.price}`;
    if (product.originalPrice && product.originalPrice > product.price) {
        const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        originalPriceElement.textContent = `₹${product.originalPrice}`;
        originalPriceElement.style.display = 'inline';
        discountBadge.textContent = `-${discountPercent}%`;
        discountBadge.style.display = 'inline';
    } else {
        originalPriceElement.style.display = 'none';
        discountBadge.style.display = 'none';
    }
}

// Display main + thumbnails
function displayImages(images) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnailContainer = document.getElementById('thumbnail-images');

    if (!images || images.length === 0) {
        mainImage.src = 'placeholder.jpg';
        mainImage.alt = currentProduct.title;
        thumbnailContainer.innerHTML = '';
        return;
    }

    const primary = images.find(img => img.isPrimary) || images[0];
    mainImage.src = primary.url;
    mainImage.alt = primary.alt || currentProduct.title;

    thumbnailContainer.innerHTML = images.map((img, index) => `
        <img src="${img.url}" alt="${img.alt || currentProduct.title}" 
             class="thumbnail ${index === 0 ? 'active' : ''}" 
             style="width:60px;height:80px;cursor:pointer;border:2px solid transparent"
             onclick="changeMainImage('${img.url}', this)">
    `).join('');
}

function changeMainImage(url, thumb) {
    document.getElementById('main-product-image').src = url;
    document.querySelectorAll('.thumbnail').forEach(t => {
        t.classList.remove('active');
        t.style.border = '2px solid transparent';
    });
    thumb.classList.add('active');
    thumb.style.border = '2px solid #007bff';
}

// Reviews
function loadReviews() {
    if (!currentProduct?.reviews) return;
    const reviews = currentProduct.reviews;

    document.getElementById('average-rating').textContent = currentProduct.rating.average.toFixed(1);
    document.getElementById('average-rating-stars').innerHTML = generateStarRating(currentProduct.rating.average);
    document.getElementById('total-reviews').textContent = `${reviews.length} reviews`;

    displayRatingBreakdown(reviews);
    displayReviews(reviews);
    document.getElementById('reviews-section').style.display = 'block';
}

function displayRatingBreakdown(reviews) {
    const breakdown = [0,0,0,0,0];
    reviews.forEach(r => breakdown[5 - r.rating]++);
    const html = breakdown.map((count,i) => {
        const stars = 5 - i;
        const percentage = reviews.length ? (count/reviews.length)*100 : 0;
        return `<div class="d-flex align-items-center mb-2">
            <span class="me-2">${stars} <i class="fas fa-star text-warning"></i></span>
            <div class="progress flex-grow-1 me-2" style="height:8px;">
                <div class="progress-bar" style="width:${percentage}%"></div>
            </div>
            <span class="text-muted">${count}</span>
        </div>`;
    }).join('');
    document.getElementById('rating-breakdown').innerHTML = html;
}

function displayReviews(reviews) {
    const html = reviews.map(r => `
        <div class="review-item border-bottom pb-3 mb-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div class="d-flex align-items-center mb-2">
                        <div class="stars me-2">${generateStarRating(r.rating)}</div>
                        <strong>${r.user.name}</strong>
                    </div>
                    <p class="text-muted small">${formatDate(r.createdAt)}</p>
                </div>
            </div>
            ${r.comment ? `<p class="mt-2">${r.comment}</p>` : ''}
        </div>
    `).join('');
    document.getElementById('reviews-list').innerHTML = html;
}

// Related products
async function loadRelatedProducts() {
    if (!currentProduct) return;
    try {
        const res = await fetch(`${API_BASE_URL}/products?category=${currentProduct.category}&limit=4`);
        if (!res.ok) return;
        const data = await res.json();
        const related = data.data.products.filter(p => p._id !== currentProduct._id);
        displayRelatedProducts(related);
    } catch (err) { console.error(err); }
}

function displayRelatedProducts(products) {
    if (!products || !products.length) return;
    const html = products.map(p => `
        <div class="col-md-3 mb-3">
            <div class="card h-100">
                <img src="${p.images[0]?.url || 'placeholder.jpg'}" alt="${p.title}" class="card-img-top" style="height:200px;object-fit:cover;">
                <div class="card-body">
                    <h6 class="card-title">${p.title}</h6>
                    <p class="text-muted small">by ${p.author}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold">₹${p.price}</span>
                        <div class="stars">${generateStarRating(p.rating.average)}</div>
                    </div>
                </div>
                <div class="card-footer">
                    <a href="productdetail.html?id=${p._id}" class="btn btn-primary btn-sm w-100">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('related-products-list').innerHTML = html;
    document.getElementById('related-products').style.display = 'block';
}

// Wishlist
async function checkWishlistStatus() {
    const token = localStorage.getItem('token');
    if (!token || !currentProduct) return;

    try {
        const res = await fetch(`${API_BASE_URL}/wishlist/check/${currentProduct._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        isInWishlist = data.data.isInWishlist;
        updateWishlistButton();
    } catch(err){ console.error(err); }
}

function updateWishlistButton() {
    const btn = document.getElementById('wishlist-btn');
    if (!btn) return;
    btn.innerHTML = isInWishlist ? '<i class="fas fa-heart"></i> Remove from Wishlist' : '<i class="fas fa-heart"></i> Add to Wishlist';
    btn.classList.toggle('btn-danger', isInWishlist);
    btn.classList.toggle('btn-outline-danger', !isInWishlist);
}

async function toggleWishlist() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Login first'), window.location.href='login.html';
    if (!currentProduct) return;

    try {
        const url = isInWishlist ? `${API_BASE_URL}/wishlist/items/${currentProduct._id}` : `${API_BASE_URL}/wishlist/items`;
        const method = isInWishlist ? 'DELETE' : 'POST';
        const body = isInWishlist ? null : JSON.stringify({ productId: currentProduct._id });
        const res = await fetch(url, { method, headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` }, body });
        if (!res.ok) throw await res.json();
        isInWishlist = !isInWishlist;
        updateWishlistButton();
        showAlert(isInWishlist?'Added to wishlist':'Removed from wishlist','success');
    } catch(err){ console.error(err); showAlert('Error updating wishlist','danger'); }
}

// Cart
async function addToCart() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Login first'), window.location.href='login.html';
    if (!currentProduct) return;
    const qty = parseInt(document.getElementById('quantity').value || 1);

    try {
        const res = await fetch(`${API_BASE_URL}/cart/items`, { 
            method:'POST', 
            headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` },
            body: JSON.stringify({ productId: currentProduct._id, quantity: qty })
        });
        if (!res.ok) throw await res.json();
        showAlert('Added to cart!','success');
    } catch(err){ console.error(err); showAlert('Error adding to cart','danger'); }
}

// Utility
function changeQuantity(delta) {
    const input = document.getElementById('quantity');
    const val = Math.max(1, Math.min(10, parseInt(input.value)+delta));
    input.value = val;
}

function setupEventHandlers() {
    document.getElementById('review-form')?.addEventListener('submit', e=>{ e.preventDefault(); submitReview(); });
}

async function submitReview() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Login first'), window.location.href='login.html';
    if (!currentProduct) return;

    const form = new FormData(document.getElementById('review-form'));
    const rating = parseInt(form.get('rating'));
    const comment = form.get('comment');

    if (!rating) return showAlert('Please select a rating','warning');

    try {
        const res = await fetch(`${API_BASE_URL}/products/${currentProduct._id}/reviews`, { 
            method:'POST', 
            headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` },
            body: JSON.stringify({ rating, comment }) 
        });
        if (!res.ok) throw await res.json();
        showAlert('Review submitted!','success');
        document.getElementById('review-form').reset();
        loadProductDetails(currentProduct._id);
    } catch(err){ console.error(err); showAlert('Error submitting review','danger'); }
}

function generateStarRating(rating){
    const full=Math.floor(rating), half=rating%1>=0.5, empty=5-full-(half?1:0);
    let stars='';
    for(let i=0;i<full;i++) stars+='<i class="fas fa-star text-warning"></i>';
    if(half) stars+='<i class="fas fa-star-half-alt text-warning"></i>';
    for(let i=0;i<empty;i++) stars+='<i class="far fa-star text-warning"></i>';
    return stars;
}

function formatDate(dateStr){ return new Date(dateStr).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'}); }

function showLoading(show){ document.getElementById('loading').style.display=show?'block':'none'; }
function hideNotFound(){ document.getElementById('not-found').style.display='none'; }
function hideProductDetails(){ document.getElementById('product-details').style.display='none'; }
function showNotFound(){ document.getElementById('not-found').style.display='block'; }

function showAlert(message,type){
    const alertDiv=document.createElement('div');
    alertDiv.className=`alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText='top:20px;right:20px;z-index:9999;min-width:300px;';
    alertDiv.innerHTML=`<div class="d-flex align-items-center">
        <i class="fas fa-${type==='success'?'check-circle':'exclamation-circle'} me-2"></i>
        <span>${message}</span>
    </div><button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alertDiv);
    setTimeout(()=>alertDiv.remove(),5000);
}
