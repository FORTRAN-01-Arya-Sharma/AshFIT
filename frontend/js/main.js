// This is the complete and final code for main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger Menu Toggle ---

    // 1. Select the hamburger icon and the navigation panel
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('main-nav');

    // 2. Check if both elements actually exist on the page before adding a listener
    if (hamburger && navMenu) {
        // 3. Add a 'click' event listener to the hamburger icon
        hamburger.addEventListener('click', () => {
            // Toggle the 'toggle-active' class on the hamburger icon itself
            // This triggers the CSS animation to turn it into an 'X'
            hamburger.classList.toggle('toggle-active');

            // Toggle the 'nav-active' class on the navigation menu
            // This triggers the CSS to slide the menu into view
            navMenu.classList.toggle('nav-active');
        });
    }
});