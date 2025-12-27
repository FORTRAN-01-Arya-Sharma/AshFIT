document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENT SELECTORS ---
    const productGrid = document.getElementById("product-grid");
    const modal = document.getElementById("product-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const modalProductDetail = document.getElementById("modal-product-detail");
    const sizeChartModal = document.getElementById("size-chart-modal");
    const sizeChartCloseBtn = document.getElementById("size-chart-modal-close-btn");
    let currentProductId = null;

    // --- SMART LOGIC: DETERMINE WHICH PAGE WE ARE ON ---
    const path = window.location.pathname;
    const page = path.split("/").pop();
    let category = '';
    if (page === 'shop-men.html') {
        category = 'Men';
    } else if (page === 'shop-women.html') {
        category = 'Women';
    }

    // --- API & DISPLAY LOGIC ---
    async function initializeShop() {
        let apiUrl = 'http://localhost:3000/api/products';
        if (category) {
            apiUrl += `/category/${category}`;
        }
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response failed');
            const products = await response.json();
            displayProducts(products);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            if(productGrid) productGrid.innerHTML = '<p>Error loading products.</p>';
        }
    }
    
    async function fetchSingleProduct(productId) {
        try {
            const response = await fetch(`http://localhost:3000/api/products/${productId}`);
            if (!response.ok) throw new Error("Product not found");
            const product = await response.json();
            displayProductInModal(product);
        } catch (error) {
            console.error("Failed to fetch single product:", error);
            modalProductDetail.innerHTML = "<p>Could not load product details.</p>";
        }
    }

    async function fetchReviews(productId) {
        const reviewsList = document.getElementById('reviews-list');
        if (!reviewsList) return;
        reviewsList.innerHTML = '<p>Loading reviews...</p>';
        try {
            const response = await fetch(`http://localhost:3000/api/reviews/${productId}`);
            const reviews = await response.json();
            renderReviews(reviews);
        } catch (error) {
            reviewsList.innerHTML = '<p>Could not load reviews.</p>';
        }
    }

    // --- RENDERING LOGIC ---
    function displayProducts(products) {
        if (!productGrid) return;
        productGrid.innerHTML = "";
        products.forEach((product) => {
            const imageUrl = product.image_url.startsWith('http') ? product.image_url : `images/${product.image_url}`;
            const productCard = document.createElement("div");
            productCard.className = "product-card";
            productCard.setAttribute("data-product-id", product.id);
            productCard.innerHTML = `
                <img src="${imageUrl}" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-price">$${product.price}</p>
                    <button class="btn-add-to-cart">View Details</button>
                </div>
            `;
            productGrid.appendChild(productCard);
        });
    }

    function displayProductInModal(product) {
        const imageUrl = product.image_url.startsWith('http') ? product.image_url : `images/${product.image_url}`;
        modalProductDetail.innerHTML = `
            <div class="product-detail-layout">
                <div class="product-image-container"><img src="${imageUrl}" alt="${product.name}"></div>
                <div class="product-details-container">
                    <h1>${product.name}</h1>
                    <p class="price">$${product.price}</p>
                    <p class="description">${product.description}</p>
                    <div class="product-controls">
                        <div class="control-group"><label for="color">Color:</label><select name="color" id="color"><option value="Inferno Bloom">Inferno Bloom</option><option value="Sinister Potion">Sinister Potion</option><option value="Demonic Choice">Demonic Choice</option></select></div>
                        <div class="control-group"><label for="size">Size:</label><select name="size" id="size"><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option></select></div>
                        <div class="control-group"><label for="quantity">Quantity:</label><input type="number" id="quantity" name="quantity" value="1" min="1"></div>
                    </div>
                    <a class="size-chart-link">View Size Chart</a>
                    <button class="btn-add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                    <div class="reviews-section">
                        <hr>
                        <h2>Customer Reviews</h2>
                        <div id="review-form-container"></div>
                        <div id="reviews-list"></div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderReviews(reviews) {
        const reviewsList = document.getElementById('reviews-list');
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p>No reviews yet. Be the first!</p>';
        } else {
            reviewsList.innerHTML = reviews.map(review => `
                <div class="review"><div class="review-header"><span class="review-user">${review.user_name}</span><span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span></div><p class="review-text">${review.review_text || ''}</p></div>
            `).join('');
        }
    }

    function renderReviewForm() {
        const reviewFormContainer = document.getElementById('review-form-container');
        const token = localStorage.getItem('authToken');
        if (token) {
            reviewFormContainer.innerHTML = `<h4>Leave a Review</h4><form id="review-form" class="review-form"><div class="form-group star-rating"><input type="radio" id="star5" name="rating" value="5" /><label for="star5" title="5 stars">★</label><input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="4 stars">★</label><input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="3 stars">★</label><input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="2 stars">★</label><input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="1 star">★</label></div><div class="form-group"><textarea id="review_text" name="review_text" rows="4" placeholder="Share your thoughts..."></textarea></div><button type="submit" class="btn-primary">Submit Review</button></form>`;
        } else {
            reviewFormContainer.innerHTML = '<p>You must be <a href="login.html">logged in</a> to leave a review.</p>';
        }
    }
    
    function addToCart(productId, size, quantity, color) {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === size && item.color === color);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({ id: productId, size: size, quantity: quantity, color: color });
        }
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        console.log('Cart updated:', cart);
    }

    // --- EVENT LISTENERS ---
    if (productGrid) {
        productGrid.addEventListener('click', (event) => {
            const card = event.target.closest('.product-card');
            if (card) {
                const productId = card.dataset.productId;
                currentProductId = productId;
                
                modalProductDetail.innerHTML = "<p>Loading...</p>";
                modal.style.display = "flex";
                setTimeout(() => modal.classList.add("active"), 10);
                
                (async () => {
                    await fetchSingleProduct(productId);
                    renderReviewForm();
                    fetchReviews(productId);
                })();
            }
        });
    }

    if (modalProductDetail) {
        modalProductDetail.addEventListener('click', (event) => {
            if (event.target.classList.contains('btn-add-to-cart')) {
                const colorSelector = document.getElementById('color');
                const selectedColor = colorSelector.value;
                if (selectedColor !== 'Inferno Bloom') {
                    alert('This color is currently sold out. Please select Inferno Bloom.');
                    return;
                }
                const productId = currentProductId;
                const sizeSelector = document.getElementById('size');
                const selectedSize = sizeSelector.value;
                const quantityInput = document.getElementById('quantity');
                const quantity = parseInt(quantityInput.value);
                addToCart(productId, selectedSize, quantity, selectedColor);
                event.target.textContent = 'Added!';
                setTimeout(() => { event.target.textContent = 'Add to Cart'; }, 1500);
            }
            if (event.target.classList.contains('size-chart-link')) {
                sizeChartModal.style.display = 'flex';
                setTimeout(() => sizeChartModal.classList.add('active'), 10);
            }
        });

        modalProductDetail.addEventListener('change', (event) => {
            if (event.target.id === 'color') {
                const selectedColor = event.target.value;
                if (selectedColor !== 'Inferno Bloom') {
                    alert('This color is currently sold out. Please select Inferno Bloom.');
                }
            }
        });

        modalProductDetail.addEventListener('submit', async (event) => {
            if (event.target.id === 'review-form') {
                event.preventDefault();
                const token = localStorage.getItem('authToken');
                const productId = currentProductId;
                
                if (!productId) { alert('Could not identify the product. Please try again.'); return; }
                
                const formData = new FormData(event.target);
                const data = { rating: formData.get('rating'), review_text: formData.get('review_text') };
                if (!data.rating) { alert('Please select a star rating.'); return; }

                try {
                    const response = await fetch(`http://localhost:3000/api/reviews/${productId}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    alert(result.message);
                    if (response.ok) {
                        fetchReviews(productId);
                        document.getElementById('review-form-container').innerHTML = '<h4>Thank you for your feedback!</h4>';
                    }
                } catch (error) {
                    console.error('Failed to submit review:', error);
                    alert('An error occurred while submitting your review.');
                }
            }
        });
    }

    // --- MODAL CLOSE LOGIC ---
    function closeModal(modalElement) {
        if (!modalElement) return;
        modalElement.classList.remove('active');
        setTimeout(() => { modalElement.style.display = 'none'; }, 300);
    }
    
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => closeModal(modal));
    if (modal) modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); });
    
    if (sizeChartCloseBtn) sizeChartCloseBtn.addEventListener('click', () => closeModal(sizeChartModal));
    if (sizeChartModal) sizeChartModal.addEventListener('click', (event) => { if (event.target === sizeChartModal) closeModal(sizeChartModal); });

    // --- INITIALIZATION ---
    initializeShop();
});