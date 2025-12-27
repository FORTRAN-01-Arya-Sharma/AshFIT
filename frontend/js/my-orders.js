// This is the final, complete code for my-orders.js

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const ordersTbody = document.getElementById('orders-tbody');
    const logoutBtn = document.getElementById('account-logout-btn');

    // --- PAGE GUARD ---
    if (!token) { 
        window.location.href = 'login.html'; 
        return; 
    }

    // --- LOGOUT LOGIC (This part was missing) ---
    if(logoutBtn) {
        logoutBtn.addEventListener('click', (e) => { 
            e.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            alert('You have been logged out.');
            window.location.href = 'login.html';
        });
    }

    // --- FETCH AND DISPLAY ORDERS ---
    try {
        const response = await fetch('http://localhost:3000/api/orders/myorders', {
            headers: { 'x-auth-token': token }
        });
        if (!response.ok) throw new Error('Could not fetch orders.');

        const orders = await response.json();

        if (orders.length === 0) {
            ordersTbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">You have not placed any orders yet.</td></tr>`;
        } else {
            ordersTbody.innerHTML = '';
            orders.forEach(order => {
                const row = document.createElement('tr');
                const orderDate = new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                row.innerHTML = `
                    <td data-label="Order ID">#${order.id}</td>
                    <td data-label="Date">${orderDate}</td>
                    <td data-label="Total">$${order.total_price}</td>
                    <td data-label="Status">${order.order_status}</td>
                `;
                ordersTbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('My Orders page error:', error);
        ordersTbody.innerHTML = `<tr><td colspan="4">Error loading your orders.</td></tr>`;
    }
});