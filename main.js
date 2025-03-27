document.addEventListener('DOMContentLoaded', function() {
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            // In a real app, you would send this to a server
            alert('Thank you for subscribing to our newsletter!');
            this.reset();
        });
    }
    
    // Mobile menu toggle
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.id = 'mobile-menu-btn';
    mobileMenuBtn.style.display = 'none';
    document.querySelector('header .container').appendChild(mobileMenuBtn);
    
    function toggleMobileMenu() {
        const nav = document.querySelector('header nav');
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
            nav.style.display = 'none';
        } else {
            mobileMenuBtn.style.display = 'none';
            nav.style.display = 'block';
        }
    }
    
    mobileMenuBtn.addEventListener('click', function() {
        const nav = document.querySelector('header nav');
        nav.style.display = nav.style.display === 'block' ? 'none' : 'block';
    });
    
    window.addEventListener('resize', toggleMobileMenu);
    toggleMobileMenu();
    
    // Check if user is admin and adjust menu
    const adminBtn = document.querySelector('.admin-btn');
    if (adminBtn) {
        import('./firebase.js').then(({ auth }) => {
            auth.onAuthStateChanged(user => {
                if (user) {
                    adminBtn.textContent = 'Dashboard';
                    adminBtn.href = 'dashboard.html';
                } else {
                    adminBtn.textContent = 'Admin Login';
                    adminBtn.href = 'dashboard.html';
                }
            });
        });
    }
});