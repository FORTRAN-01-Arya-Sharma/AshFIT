document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("authToken");
  const ordersTbody = document.getElementById("orders-tbody");

  async function fetchOrders() {
    try {
      const response = await fetch("https://ashfit.onrender.com/api/admin/orders", {
        headers: {
          "x-auth-token": token,
        },
      });

      if (!response.ok) {
        throw new Error("Could not fetch orders.");
      }

      const orders = await response.json();
      renderOrders(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      ordersTbody.innerHTML = `<tr><td colspan="6">Error loading orders.</td></tr>`;
    }
  }


function renderOrders(orders) {
    if (orders.length === 0) {
        ordersTbody.innerHTML = `<tr><td colspan="6">No orders found.</td></tr>`;
        return;
    }

    ordersTbody.innerHTML = '';
    orders.forEach(order => {
        const row = document.createElement('tr');
        const orderDate = new Date(order.created_at).toLocaleDateString();

        // Create the options for the dropdown, with the current status selected
        const statuses = ['Processing', 'Shipped', 'Cancelled'];
        const optionsHtml = statuses.map(status => 
            `<option value="${status}" ${order.order_status === status ? 'selected' : ''}>${status}</option>`
        ).join('');
        
        row.innerHTML = `
            <td data-label="Order ID">#${order.order_id}</td>
            <td data-label="Date">${orderDate}</td>
            <td data-label="Customer">${order.user_name} (${order.user_email})</td>
            <td data-label="Shipping To">${order.shipping_name}, ${order.street_address}, ${order.city}</td>
            <td data-label="Total">$${order.total_price}</td>
            <td data-label="Status">
                <select class="order-status-select" data-order-id="${order.order_id}">
                    ${optionsHtml}
                </select>
            </td>
        `;
        ordersTbody.appendChild(row);
    });
}


// Listen for changes on any of the status dropdowns
ordersTbody.addEventListener('change', async (event) => {
    if (event.target.classList.contains('order-status-select')) {
        const orderId = event.target.dataset.orderId;
        const newStatus = event.target.value;

        if (!confirm(`Are you sure you want to change Order #${orderId} to "${newStatus}"?`)) {
            // If admin cancels, revert the dropdown to its original state
            fetchOrders(); // Just re-fetch and re-render the whole table
            return;
        }

        try {
            const response = await fetch(`https://ashfit.onrender.com/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ newStatus: newStatus })
            });

            const result = await response.json();
            alert(result.message); // Show success message

            if (!response.ok) {
                fetchOrders(); // Re-fetch to reset if there was an error
            }

        } catch (error) {
            console.error('Failed to update status:', error);
            alert('An error occurred. Please try again.');
            fetchOrders(); // Re-fetch to reset
        }
    }
});

  // --- INITIALIZATION ---
  fetchOrders();
});