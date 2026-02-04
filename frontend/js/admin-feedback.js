document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const messagesTbody = document.getElementById('messages-tbody');
    const reviewsTbody = document.getElementById('reviews-tbody');

    // --- FETCH ALL CONTACT MESSAGES ---
    async function fetchMessages() {
        try {
            const response = await fetch('https://ashfit.onrender.com/api/admin/messages', {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) throw new Error('Could not fetch messages.');
            
            const messages = await response.json();
            renderMessages(messages);
        } catch (error) {
            console.error('Fetch messages error:', error);
            messagesTbody.innerHTML = `<tr><td colspan="5">Error loading messages.</td></tr>`;
        }
    }

    function renderMessages(messages) {
        if (messages.length === 0) {
            messagesTbody.innerHTML = `<tr><td colspan="5">No messages found.</td></tr>`;
            return;
        }
        document.querySelector('#messages-table thead tr').innerHTML = `<th>Date</th><th>From</th><th>Email</th><th>Message</th><th>Actions</th>`;
        messagesTbody.innerHTML = '';
        messages.forEach(msg => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Date">${new Date(msg.submitted_at).toLocaleString()}</td>
                <td data-label="From">${msg.name}</td>
                <td data-label="Email">${msg.email}</td>
                <td data-label="Message">${msg.message}</td>
                <td data-label="Actions">
                    <a href="mailto:${msg.email}?subject=RE: Your message to Ashgrtz Fitness" class="edit-btn">Reply</a>
                </td>
            `;
            messagesTbody.appendChild(row);
        });
    }

    // --- FETCH ALL PRODUCT REVIEWS ---
    async function fetchReviews() {
        try {
            const response = await fetch('https://ashfit.onrender.com/api/admin/reviews', {
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) throw new Error('Could not fetch reviews.');

            const reviews = await response.json();
            renderReviews(reviews);
        } catch (error) {
            console.error('Fetch reviews error:', error);
            reviewsTbody.innerHTML = `<tr><td colspan="6">Error loading reviews.</td></tr>`;
        }
    }

    function renderReviews(reviews) {
        if (reviews.length === 0) {
            reviewsTbody.innerHTML = `<tr><td colspan="6">No reviews found.</td></tr>`;
            return;
        }
        document.querySelector('#reviews-table thead tr').innerHTML = `<th>Date</th><th>User</th><th>Product</th><th>Rating</th><th>Review</th><th>Actions</th>`;
        reviewsTbody.innerHTML = '';
        reviews.forEach(review => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Date">${new Date(review.created_at).toLocaleDateString()}</td>
                <td data-label="User">${review.user_name}</td>
                <td data-label="Product">${review.product_name}</td>
                <td data-label="Rating">${'★'.repeat(review.rating)}</td>
                <td data-label="Review">${review.review_text || ''}</td>
                <td data-label="Actions">
                    <a href="mailto:${review.user_email}?subject=RE: Your review on ${review.product_name}" class="edit-btn">Reply</a>
                </td>
            `;
            reviewsTbody.appendChild(row);
        });
    }

    // --- INITIALIZATION ---
    fetchMessages();
    fetchReviews();
});