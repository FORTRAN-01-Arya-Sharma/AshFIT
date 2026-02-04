document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENT SELECTORS ---
    const accountContent = document.getElementById("account-content");
    const logoutBtn = document.getElementById("account-logout-btn");
    const avatarUploadInput = document.getElementById("avatar-upload-page");
    const token = localStorage.getItem("authToken");

    // --- PAGE GUARD ---
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    // --- EVENT LISTENERS ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            alert('You have been logged out.');
            window.location.href = 'login.html';
        });
    }

    if (avatarUploadInput) {
        avatarUploadInput.addEventListener("change", async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("avatar", file);

            try {
                const response = await fetch(
                    "https://ashfit.onrender.com/api/users/upload-avatar",
                    {
                        method: "POST",
                        headers: { "x-auth-token": token },
                        body: formData,
                    }
                );
                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    loadUserProfile(); // Reload the profile to show the new picture
                } else {
                    alert(`Upload failed: ${result.message}`);
                }
            } catch (error) {
                console.error("File upload error:", error);
                alert("An error occurred during upload.");
            }
        });
    }

    // --- MAIN FUNCTION TO FETCH AND DISPLAY USER DATA ---
    async function loadUserProfile() {
        try {
            // --- FETCH USER and ORDERS DATA IN PARALLEL ---
            const [userResponse, ordersResponse] = await Promise.all([
                fetch('https://ashfit.onrender.com/api/users/me', { headers: { 'x-auth-token': token }, cache: 'no-cache' }),
                fetch('https://ashfit.onrender.com/api/orders/myorders', { headers: { 'x-auth-token': token }, cache: 'no-cache' })
            ]);

            if (!userResponse.ok || !ordersResponse.ok) {
                throw new Error('Could not fetch account data.');
            }

            const user = await userResponse.json();
            const orders = await ordersResponse.json();
            
            // --- DATA FORMATTING ---
            const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            const imageUrl = user.profile_image_url 
                ? `https://ashfit.onrender.com/${user.profile_image_url}` 
                : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%2300ff99" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

            // --- RENDER HTML ---
            accountContent.innerHTML = `
                <div class="profile-header">
                    <label for="avatar-upload-page" class="profile-pic-label">
                        <div class="profile-pic-large" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
                            <span class="edit-overlay">Change</span>
                        </div>
                    </label>
                    <div class="profile-info">
                        <h2>${user.name}</h2>
                        <p>${user.email}</p>
                    </div>
                </div>
                <hr>
                <div class="profile-details">
                    <h3>Account Details</h3>
                    <p><strong>Member Since:</strong> ${joinDate}</p>
                    <p><strong>User ID:</strong> #${user.id}</p>
                    <p><strong>Total Orders:</strong> ${orders.length}</p>
                </div>
            `;
            
        } catch (error) {
            console.error('CRITICAL ERROR in loadUserProfile:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            alert('Your session may have expired. Please log in again.');
            window.location.href = 'login.html';
        }
    }

    // --- INITIALIZATION ---
    loadUserProfile();
});