// This is the complete code for frontend/js/order-confirmation.js

document.addEventListener('DOMContentLoaded', async () => {
    const confirmationContent = document.getElementById('confirmation-content');
    const token = localStorage.getItem('authToken');

    // 1. Get the orderId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId || !token) {
        confirmationContent.innerHTML = '<h1>Error</h1><p>No order ID found or you are not logged in.</p>';
        return;
    }

    try {
        // 2. Fetch the order details from the new backend endpoint
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            throw new Error('Could not fetch order details.');
        }

        const order = await response.json();

        // 3. Display the details on the page
        confirmationContent.innerHTML = `
            <h1>Thank You!</h1>
            <p>Your order has been placed successfully. A confirmation email will be sent to you shortly.</p>
            
            <div class="order-details">
                <h4>Order ID: #${order.order_id}</h4>
                <p>
                    <strong>Total:</strong> $${order.total_price} <br>
                    <strong>Status:</strong> ${order.order_status}
                </p>
                <h4>Shipping to:</h4>
                <p>
                    ${order.full_name}<br>
                    ${order.street_address}<br>
                    ${order.city}, ${order.zip_code}
                </p>
            </div>
        `;

    } catch (error) {
        console.error('Confirmation page error:', error);
        confirmationContent.innerHTML = '<h1>Error</h1><p>There was a problem retrieving your order details.</p>';
    }
});