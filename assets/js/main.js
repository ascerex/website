/**
 * ASCEREX - Main JavaScript
 * Header scroll behavior, mobile menu, and smooth scrolling
 */

(function() {
    'use strict';

    // DOM Elements
    const stage = document.querySelector('.Stage');
    const hamburger = document.querySelector('.hamburger');
    const navMobile = document.querySelector('.nav-mobile');
    const navLinks = document.querySelectorAll('.nav-link');

    // State
    let lastScrollY = 0;
    let ticking = false;
    const scrollThreshold = 100;

    /**
     * Header Scroll Behavior
     * Hides header on scroll down, shows on scroll up
     */
    function updateHeader() {
        const currentScrollY = window.scrollY;

        // Don't hide header if mobile menu is open
        if (navMobile.classList.contains('open')) {
            ticking = false;
            return;
        }

        // Only trigger after passing threshold
        if (currentScrollY > scrollThreshold) {
            if (currentScrollY > lastScrollY) {
                // Scrolling down - hide header
                stage.dataset.state = 'isCollapsed';
            } else {
                // Scrolling up - show header
                stage.dataset.state = 'isOpen';
            }
        } else {
            // At top of page - always show header
            stage.dataset.state = 'isOpen';
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    /**
     * Mobile Menu Toggle
     */
    function toggleMobileMenu() {
        const isOpen = navMobile.classList.toggle('open');
        hamburger.classList.toggle('active');

        // Ensure header stays visible when menu is open
        if (isOpen) {
            stage.dataset.state = 'isOpen';
        }
    }

    function closeMobileMenu() {
        navMobile.classList.remove('open');
        hamburger.classList.remove('active');
    }

    /**
     * Smooth Scroll to Section
     */
    function handleNavClick(e) {
        const href = e.currentTarget.getAttribute('href');

        if (href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Close mobile menu if open
                closeMobileMenu();

                // Smooth scroll to target
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }

    /**
     * Initialize
     */
    function init() {
        // Scroll listener for header behavior
        window.addEventListener('scroll', onScroll, { passive: true });

        // Mobile menu toggle
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileMenu);
        }

        // Navigation link clicks
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavClick);
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeMobileMenu();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMobile.classList.contains('open') &&
                !e.target.closest('.nav-mobile') &&
                !e.target.closest('.hamburger')) {
                closeMobileMenu();
            }
        });
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
