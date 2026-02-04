// This is the complete and final code for frontend/js/transition.js

document.addEventListener('DOMContentLoaded', () => {
    // --- FADE-IN EFFECT ---
    // On page load, the body starts with the 'fade-out' class (defined in CSS).
    // We remove it to trigger the smooth fade-in transition.
    document.body.classList.remove('fade-out');

    // --- FADE-OUT EFFECT ---
    // Select all links on the page to apply smooth transitions between pages.
    const navLinks = document.querySelectorAll('a');

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');

            // Only apply transition to internal links (ignore anchors, mailto, and external tabs)
            if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !link.hasAttribute('target')) {
                
                // Prevent the browser from jumping to the next page immediately
                event.preventDefault();

                // Add the fade-out class to trigger the CSS transition
                document.body.classList.add('fade-out');

                // Wait for the animation (500ms) to finish, then navigate to the new page
                setTimeout(() => {
                    window.location.href = href;
                }, 500); // This duration matches the CSS transition-duration
            }
        });
    });
});