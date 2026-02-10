/* assets/js/mobile-menu.js */

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const closeMenu = document.getElementById('closeMenu');

    if (menuToggle && mobileMenu && closeMenu) {
        // Open
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.add('active');
        });

        // Close Button
        closeMenu.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });

        // Close on Outside Click
        document.addEventListener('click', (e) => {
            if (mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        });
    }
});