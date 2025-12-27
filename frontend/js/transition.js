// This is the complete code for frontend/js/transition.js

document.addEventListener('DOMContentLoaded', () => {
    // --- FADE-IN EFFECT ---
    // On page load, the body starts with the 'fade-out' class.
    // We remove it to trigger the fade-in transition.
    document.body.classList.remove('fade-out');

    // --- FADE-OUT EFFECT ---
    // Select all navigation links
    const navLinks = document.querySelectorAll('a'); // A bit broad, but effective for this example

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            // Check if it's a valid, internal link and not a special link
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !link.hasAttribute('target')) {
                // Prevent the browser from navigating instantly
                event.preventDefault();

                // Add the fade-out class to trigger the CSS transition
                document.body.classList.add('fade-out');

                // Wait for the animation to finish, then navigate
                setTimeout(() => {
                    window.location.href = href;
                }, 500); // This duration must match the CSS transition duration
            }
        });
    });
});