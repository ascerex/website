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
     * Policy Carousel
     */
    function initPolicyCarousel() {
        const bubbles = document.querySelectorAll('.radial-bubble');
        const slides = document.querySelectorAll('.policy-slide');
        const slidesContainer = document.querySelector('.policy-carousel-slides');
        const leftNav = document.querySelector('.policy-nav-left');
        const rightNav = document.querySelector('.policy-nav-right');

        if (!bubbles.length || !slides.length || !slidesContainer) return;

        let currentIndex = 0;
        const totalSlides = slides.length;
        let hoverTimeout = null;
        let clickCooldown = false;
        let autoscrollCooldown = false;
        let isHoveringLeft = false;
        let isHoveringRight = false;

        // Calculate slide width including gap
        function getSlideOffset() {
            const slide = slides[0];
            const gap = 24; // matches CSS gap
            return slide.offsetWidth + gap;
        }

        function goToSlide(index) {
            // Wrap around
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;

            currentIndex = index;

            // Calculate offset to center the active slide
            // Leaves room for prev/next peeks on either side
            const slideWidth = getSlideOffset();
            const offset = currentIndex * slideWidth;
            slidesContainer.style.transform = `translateX(-${offset}px)`;

            // Update active states
            bubbles.forEach((bubble, i) => {
                bubble.classList.toggle('active', i === currentIndex);
            });
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === currentIndex);
            });
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        function handleClick(direction) {
            // Block clicks if autoscroll just happened
            if (autoscrollCooldown) return;

            // Clear any pending hover timeout
            clearTimeout(hoverTimeout);

            // Navigate
            if (direction === 'next') {
                nextSlide();
            } else {
                prevSlide();
            }

            // Set cooldown to prevent hover from triggering immediately
            clickCooldown = true;
            setTimeout(() => {
                clickCooldown = false;
            }, 600);
        }

        function handleHover(direction) {
            if (clickCooldown) return;

            hoverTimeout = setTimeout(() => {
                if (!clickCooldown) {
                    if (direction === 'next') {
                        nextSlide();
                    } else {
                        prevSlide();
                    }

                    // Set autoscroll cooldown to prevent click from double-scrolling
                    autoscrollCooldown = true;
                    setTimeout(() => {
                        autoscrollCooldown = false;
                    }, 800);

                    // Continue scrolling if still hovering
                    setTimeout(() => {
                        if ((direction === 'next' && isHoveringRight) ||
                            (direction === 'prev' && isHoveringLeft)) {
                            handleHover(direction);
                        }
                    }, 500);
                }
            }, 300);
        }

        // Bubble clicks
        bubbles.forEach((bubble, index) => {
            bubble.addEventListener('click', () => {
                clearTimeout(hoverTimeout);
                goToSlide(index);
            });
        });

        // Check if device has touch (mobile)
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Nav field clicks and hover
        if (leftNav) {
            leftNav.addEventListener('click', () => handleClick('prev'));

            // Only enable hover autoscroll on non-touch devices
            if (!isTouchDevice) {
                leftNav.addEventListener('mouseenter', () => {
                    isHoveringLeft = true;
                    handleHover('prev');
                });
                leftNav.addEventListener('mouseleave', () => {
                    isHoveringLeft = false;
                    clearTimeout(hoverTimeout);
                });
            }
        }

        if (rightNav) {
            rightNav.addEventListener('click', () => handleClick('next'));

            // Only enable hover autoscroll on non-touch devices
            if (!isTouchDevice) {
                rightNav.addEventListener('mouseenter', () => {
                    isHoveringRight = true;
                    handleHover('next');
                });
                rightNav.addEventListener('mouseleave', () => {
                    isHoveringRight = false;
                    clearTimeout(hoverTimeout);
                });
            }
        }

        // Recalculate on resize
        window.addEventListener('resize', () => {
            goToSlide(currentIndex);
        });

        // Initialize first slide as active
        goToSlide(0);
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

        // Initialize policy carousel
        initPolicyCarousel();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
