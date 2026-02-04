// This is the complete and final code for frontend/js/contact.js
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            // UPDATED: Now points to your live Render backend
            const response = await fetch('https://ashfit.onrender.com/api/messages/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                alert(result.message); // Show a success popup
                contactForm.reset(); // Clear the form
            } else {
                alert(`Error: ${result.message}`); // Show an error popup
            }

        } catch (error) {
            console.error('Contact form submission error:', error);
            alert('Could not connect to the server. Please try again.');
        } finally {
            // Restore the button after the request is complete
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
});