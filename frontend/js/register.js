// This is the complete code for frontend/js/register.js

document.addEventListener('DOMContentLoaded', () => {
    // Select the form and the message area
    const registerForm = document.getElementById('register-form');
    const formMessage = document.getElementById('form-message');

    // Add an event listener for the form submission
    registerForm.addEventListener('submit', async (event) => {
        // Prevent the default form action (which is to reload the page)
        event.preventDefault();

        // Clear any previous messages
        formMessage.innerHTML = '';
        formMessage.className = 'form-message';

        // 1. Get the form data
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        // 2. Send the data to the backend API
        try {
            const response = await fetch('http://localhost:3000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            // 3. Handle the response from the backend
            if (response.ok) {
                // Success
                formMessage.textContent = result.message;
                formMessage.classList.add('success');
                
                // Optional: Redirect to login page after a short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000); // 2-second delay
                
            } else {
                // Error
                formMessage.textContent = result.message || 'An error occurred. Please try again.';
                formMessage.classList.add('error');
            }

        } catch (error) {
            // Handle network errors
            console.error('Registration failed:', error);
            formMessage.textContent = 'Could not connect to the server. Please check your connection.';
            formMessage.classList.add('error');
        }
    });
});