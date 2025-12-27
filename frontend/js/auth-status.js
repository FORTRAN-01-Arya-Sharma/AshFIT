document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS (for both desktop and mobile) ---
    const loginButton = document.getElementById('login-button');
    const userProfile = document.getElementById('user-profile');
    const logoutButton = document.getElementById('logout-button');
    const profilePicDisplay = document.getElementById('profile-pic-display');

    const mobileLoginButton = document.getElementById('mobile-login-button');
    const mobileUserProfile = document.getElementById('mobile-user-profile');
    const mobileLogoutButton = document.getElementById('mobile-logout-button');
    const mobileProfilePicDisplay = document.getElementById('mobile-profile-pic-display');
    
    // Get stored data
    const token = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');
    const userData = userDataString ? JSON.parse(userDataString) : null;

    // --- 1. DEFINE a reusable function to update the UI ---
    function updateAuthUI() {
        if (token && userData) {
            // --- USER IS LOGGED IN ---
            // Desktop
            loginButton.style.display = 'none';
            userProfile.style.display = 'flex';
            // Mobile
            mobileLoginButton.style.display = 'none';
            mobileUserProfile.style.display = 'list-item';

            // Load profile picture if it exists
            if (userData.profile_image_url) {
                const imageUrl = `http://localhost:3000/${userData.profile_image_url}`;
                // Set for both desktop and mobile pics
                profilePicDisplay.style.backgroundImage = `url('${imageUrl}')`;
                profilePicDisplay.style.backgroundSize = 'cover';
                mobileProfilePicDisplay.style.backgroundImage = `url('${imageUrl}')`;
                mobileProfilePicDisplay.style.backgroundSize = 'cover';
            }

        } else {
            // --- USER IS LOGGED OUT ---
            // Desktop
            loginButton.style.display = 'block';
            userProfile.style.display = 'none';
            // Mobile
            mobileLoginButton.style.display = 'list-item';
            mobileUserProfile.style.display = 'none';
        }
    }

    // --- 2. LOGOUT LOGIC ---
    
    
    // --- 3. AVATAR UPLOAD LOGIC ---
    // (This part stays exactly the same, no changes needed here)
    const avatarUploadInput = document.getElementById('avatar-upload');
    if (avatarUploadInput) {
        avatarUploadInput.addEventListener('change', async (event) => {
            // ... (keep all the existing upload logic)
            const file = event.target.files[0];
            if (!file || !token) { return; }
            const formData = new FormData();
            formData.append('avatar', file);
            try {
                const response = await fetch('http://localhost:3000/api/users/upload-avatar', {
                    method: 'POST',
                    headers: { 'x-auth-token': token },
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    if (userData) {
                        userData.profile_image_url = result.profile_image_url;
                        localStorage.setItem('userData', JSON.stringify(userData));
                    }
                    // updateAuthUI(); // Re-run the UI update to show the new picture
                    alert(result.message);
                } else {
                    alert(`Upload failed: ${result.message}`);
                }
            } catch (error) {
                console.error('File upload error:', error);
                alert('An error occurred during upload.');
            }
        });
    }



    // --- 4. INITIALIZATION ---
    updateAuthUI(); // Run the function once on page load

    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
    
    if (logoutButton) logoutButton.addEventListener('click', logout);
    if (mobileLogoutButton) mobileLogoutButton.addEventListener('click', logout);
});
