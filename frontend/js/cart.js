document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalElem = document.getElementById('cart-subtotal');
    const cartDiscountElem = document.getElementById('cart-discount');
    const cartTotalElem = document.getElementById('cart-total');
    const discountRow = document.querySelector('.discount-row');
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponInput = document.getElementById('coupon-code-input');

    // --- STATE ---
    let couponApplied = false;
    const VALID_COUPON_CODE = "ASH555";
    const DISCOUNT_PERCENTAGE = 0.10; // 10%

    // --- MAIN RENDER FUNCTION ---
    async function renderCart() {
        const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            updateTotals(0);
            return;
        }

        cartItemsContainer.innerHTML = '<h2>Loading cart...</h2>';
        let subtotal = 0;

        const productPromises = cart.map(item => fetchProductDetails(item.id));
        const products = await Promise.all(productPromises);

        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const product = products[index];
            if (product) {
                const itemTotal = product.price * item.quantity;
                subtotal += itemTotal;
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item';
                cartItemDiv.innerHTML = `
                    <div class="cart-item-img"><img src="${product.image_url.startsWith('http') ? product.image_url : `images/${product.image_url}`}" alt="${product.name}"></div>
                    <div class="cart-item-info"><h3>${product.name}</h3><p>Size: ${item.size}</p><button class="remove-item-btn" data-product-id="${item.id}" data-product-size="${item.size}">Remove</button></div>
                    <div class="cart-item-quantity"><input class="quantity-input" type="number" value="${item.quantity}" min="1" data-product-id="${item.id}" data-product-size="${item.size}"></div>
                    <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                `;
                cartItemsContainer.appendChild(cartItemDiv);
            }
        });
        
        updateTotals(subtotal);
    }

    // --- HELPER FUNCTIONS ---
    async function fetchProductDetails(productId) {
        try {
            const response = await fetch(`https://ashfit.onrender.com/api/products/${productId}`);
            if (!response.ok) throw new Error('Product not found');
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch product ${productId}:`, error);
            return null;
        }
    }

    function updateTotals(subtotal) {
        let discountAmount = 0;
        if (couponApplied) {
            discountAmount = subtotal * DISCOUNT_PERCENTAGE;
            discountRow.style.display = 'flex'; 
            cartDiscountElem.textContent = `-$${discountAmount.toFixed(2)}`;
        } else {
            discountRow.style.display = 'none'; 
        }
        
        const total = subtotal - discountAmount;

        cartSubtotalElem.textContent = `$${subtotal.toFixed(2)}`;
        cartTotalElem.textContent = `$${total.toFixed(2)}`;
    }

    function updateCartInStorage(cart) {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        renderCart();
    }
    
    function handleApplyCoupon() {
        const enteredCode = couponInput.value.trim().toUpperCase();

        if (enteredCode === VALID_COUPON_CODE) {
            if (couponApplied) {
                alert('Coupon is already applied!');
            } else {
                couponApplied = true;
                alert('Coupon "ASH555" applied successfully! You get 10% off.');
                renderCart(); 
            }
        } else {
            alert('Wrong coupon code. Please try again.');
            couponApplied = false; 
            renderCart();
        }
    }
    
    // --- EVENT LISTENERS ---
    applyCouponBtn.addEventListener('click', handleApplyCoupon);

    cartItemsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-item-btn')) {
            const productId = event.target.dataset.productId;
            const productSize = event.target.dataset.productSize;
            let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
            cart = cart.filter(item => !(item.id === productId && item.size === productSize));
            updateCartInStorage(cart);
        }
    });

    cartItemsContainer.addEventListener('change', (event) => {
        if (event.target.classList.contains('quantity-input')) {
            const productId = event.target.dataset.productId;
            const productSize = event.target.dataset.productSize;
            const newQuantity = parseInt(event.target.value);
            let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
            const itemIndex = cart.findIndex(item => item.id === productId && item.size === productSize);
            if (itemIndex > -1 && newQuantity > 0) {
                cart[itemIndex].quantity = newQuantity;
                updateCartInStorage(cart);
            }
        }
    });

    const checkoutButton = document.querySelector('.checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                window.location.href = 'checkout.html';
            } else {
                alert('You must be logged in to proceed to checkout.');
                window.location.href = 'login.html';
            }
        });
    }

    renderCart();
});