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
                    }, 650);
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
     * Text Scramble Effect
     */
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.originalText = el.textContent;
            this.isAnimating = false;
        }

        scramble() {
            if (this.isAnimating) return;
            this.isAnimating = true;

            const text = this.originalText;
            const length = text.length;
            let iteration = 0;
            const maxIterations = length * 2;

            const interval = setInterval(() => {
                this.el.textContent = text
                    .split('')
                    .map((char, index) => {
                        if (index < iteration / 2) {
                            return text[index];
                        }
                        if (char === ' ') return ' ';
                        return this.chars[Math.floor(Math.random() * this.chars.length)];
                    })
                    .join('');

                iteration++;

                if (iteration >= maxIterations) {
                    clearInterval(interval);
                    this.el.textContent = text;
                    this.isAnimating = false;
                }
            }, 25);
        }

        reset() {
            this.el.textContent = this.originalText;
            this.isAnimating = false;
        }
    }

    /**
     * Propulsion Cards Carousel with Scramble Effect
     */
    function initPropulsionCards() {
        const cards = document.querySelectorAll('.propulsion-card');
        const slidesContainer = document.querySelector('.propulsion-carousel-slides');
        const expandedWrapper = document.getElementById('propulsion-expanded');
        const leftNav = document.querySelector('.propulsion-nav-left');
        const rightNav = document.querySelector('.propulsion-nav-right');

        if (!cards.length || !slidesContainer) return;

        let activeCard = null;
        const scrambleInstances = new Map();
        let hoverTimeout = null;
        let clickCooldown = false;
        let autoscrollCooldown = false;
        let isHoveringLeft = false;
        let isHoveringRight = false;
        let lastScrollPosition = slidesContainer.scrollLeft;

        // Initialize scramble instances for each card
        cards.forEach(card => {
            const scrambleElements = card.querySelectorAll('.scramble-text');
            const instances = [];
            scrambleElements.forEach(el => {
                instances.push(new TextScramble(el));
            });
            scrambleInstances.set(card, instances);
        });

        // Hover handlers for scramble effect
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const instances = scrambleInstances.get(card);
                if (instances) {
                    instances.forEach(instance => instance.scramble());
                }
            });
        });

        // Get card width for scrolling
        function getCardWidth() {
            const card = cards[0];
            const gap = 24;
            return card.offsetWidth + gap;
        }

        // Get scroll boundaries (accounting for spacers)
        function getScrollBounds() {
            const cardWidth = getCardWidth();
            const spacerWidth = cardWidth * 1.17; // Approximate spacer width (35% vs 30%)
            const maxScroll = slidesContainer.scrollWidth - slidesContainer.clientWidth;
            return {
                min: spacerWidth - cardWidth * 0.15, // Allow small peek at start
                max: maxScroll - spacerWidth + cardWidth * 0.15 // Allow small peek at end
            };
        }

        // Check if at start boundary
        function isAtStart() {
            const bounds = getScrollBounds();
            return slidesContainer.scrollLeft <= bounds.min + 10;
        }

        // Check if at end boundary
        function isAtEnd() {
            const bounds = getScrollBounds();
            return slidesContainer.scrollLeft >= bounds.max - 10;
        }

        // Scroll to next/prev
        function scrollNext() {
            if (isAtEnd()) return false;
            const cardWidth = getCardWidth();
            slidesContainer.scrollBy({ left: cardWidth, behavior: 'smooth' });
            return true;
        }

        function scrollPrev() {
            if (isAtStart()) return false;
            const cardWidth = getCardWidth();
            slidesContainer.scrollBy({ left: -cardWidth, behavior: 'smooth' });
            return true;
        }

        // Close expanded content
        function closeExpanded() {
            if (activeCard) {
                activeCard.classList.remove('active');
                activeCard = null;
            }
            if (expandedWrapper) {
                expandedWrapper.classList.remove('active');
            }
        }

        // Check if card is visible in the carousel viewport
        function isCardVisible(card) {
            const containerRect = slidesContainer.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();

            // Card is visible if its center is within the container bounds
            const cardCenter = cardRect.left + cardRect.width / 2;
            const buffer = 50; // Small buffer for edge cases

            return cardCenter > containerRect.left - buffer &&
                   cardCenter < containerRect.right + buffer;
        }

        // Update the connecting line position
        function updateLinePosition() {
            if (!activeCard || !expandedWrapper) return;

            const cardRect = activeCard.getBoundingClientRect();
            const wrapperRect = expandedWrapper.getBoundingClientRect();
            const cardCenterX = cardRect.left + cardRect.width / 2 - wrapperRect.left;
            const linePercent = Math.max(5, Math.min(95, (cardCenterX / wrapperRect.width) * 100));

            expandedWrapper.querySelector('.propulsion-expanded-line').style.left = `${linePercent}%`;
        }

        // Handle navigation click
        function handleNavClick(direction) {
            if (autoscrollCooldown) return;

            clearTimeout(hoverTimeout);

            if (direction === 'next') {
                scrollNext();
            } else {
                scrollPrev();
            }

            clickCooldown = true;
            setTimeout(() => {
                clickCooldown = false;
            }, 600);
        }

        // Handle hover autoscroll
        function handleHover(direction) {
            if (clickCooldown) return;

            // Check boundaries before starting
            if (direction === 'next' && isAtEnd()) return;
            if (direction === 'prev' && isAtStart()) return;

            hoverTimeout = setTimeout(() => {
                if (!clickCooldown) {
                    let scrolled = false;
                    if (direction === 'next') {
                        scrolled = scrollNext();
                    } else {
                        scrolled = scrollPrev();
                    }

                    // Only set cooldown and continue if we actually scrolled
                    if (scrolled) {
                        autoscrollCooldown = true;
                        setTimeout(() => {
                            autoscrollCooldown = false;
                        }, 800);

                        // Continue scrolling if still hovering and not at boundary
                        setTimeout(() => {
                            if ((direction === 'next' && isHoveringRight && !isAtEnd()) ||
                                (direction === 'prev' && isHoveringLeft && !isAtStart())) {
                                handleHover(direction);
                            }
                        }, 650);
                    }
                }
            }, 300);
        }

        // Scroll event - update line or close expanded based on card visibility
        slidesContainer.addEventListener('scroll', () => {
            if (!activeCard || !expandedWrapper.classList.contains('active')) {
                lastScrollPosition = slidesContainer.scrollLeft;
                return;
            }

            // Check if active card is still visible
            if (isCardVisible(activeCard)) {
                // Card is still visible, just update the line position
                updateLinePosition();
            } else {
                // Card scrolled out of view, close expanded
                closeExpanded();
            }

            lastScrollPosition = slidesContainer.scrollLeft;
        });

        // Check if device has touch
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Nav field clicks and hover
        if (leftNav) {
            leftNav.addEventListener('click', () => handleNavClick('prev'));

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
            rightNav.addEventListener('click', () => handleNavClick('next'));

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

        // Initialize scroll position to first card (skip spacer)
        function initScrollPosition() {
            const bounds = getScrollBounds();
            slidesContainer.scrollLeft = bounds.min;
        }

        // Set initial position after a brief delay to ensure layout is complete
        setTimeout(initScrollPosition, 100);

        // Recalculate on resize
        window.addEventListener('resize', () => {
            // Clamp scroll position to valid bounds
            const bounds = getScrollBounds();
            if (slidesContainer.scrollLeft < bounds.min) {
                slidesContainer.scrollLeft = bounds.min;
            } else if (slidesContainer.scrollLeft > bounds.max) {
                slidesContainer.scrollLeft = bounds.max;
            }
        });

        // Click handler for expansion
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                if (!expandedWrapper) return;

                // If clicking the same card, close it
                if (activeCard === card) {
                    closeExpanded();
                    return;
                }

                // Remove active from previous card
                if (activeCard) {
                    activeCard.classList.remove('active');
                }

                // Set new active card
                activeCard = card;
                card.classList.add('active');

                // Get card data
                const data = {
                    title: card.dataset.title,
                    type: card.dataset.type,
                    status: card.dataset.status,
                    statusLabel: card.dataset.statusLabel,
                    rationale: card.dataset.rationale,
                    analysis: card.dataset.analysis,
                    takeaway: card.dataset.takeaway
                };

                // Calculate line position based on card position
                const cardRect = card.getBoundingClientRect();
                const wrapperRect = expandedWrapper.getBoundingClientRect();
                const cardCenterX = cardRect.left + cardRect.width / 2 - wrapperRect.left;
                const linePercent = Math.max(5, Math.min(95, (cardCenterX / wrapperRect.width) * 100));

                // Update expanded content
                expandedWrapper.querySelector('.propulsion-expanded-title').textContent = data.title;
                expandedWrapper.querySelector('.propulsion-expanded-type').textContent = data.type;
                expandedWrapper.querySelector('.propulsion-expanded-status').textContent = data.statusLabel;
                expandedWrapper.querySelector('#expanded-rationale').textContent = data.rationale;
                expandedWrapper.querySelector('#expanded-analysis').textContent = data.analysis;
                expandedWrapper.querySelector('#expanded-takeaway').textContent = data.takeaway;

                // Set status color
                expandedWrapper.dataset.status = data.status;

                // Set line position
                expandedWrapper.querySelector('.propulsion-expanded-line').style.left = `${linePercent}%`;

                // Reset content offset for carousel layout
                expandedWrapper.querySelector('.propulsion-expanded-body').style.marginLeft = '0';

                // Fade in/update
                if (!expandedWrapper.classList.contains('active')) {
                    expandedWrapper.classList.add('active');
                } else {
                    // Quick fade for content switch
                    expandedWrapper.style.opacity = '0';
                    setTimeout(() => {
                        expandedWrapper.style.opacity = '1';
                    }, 50);
                }
            });
        });
    }

    /**
     * Testing Groups - Collapsible Accordion
     */
    function initTestingGroups() {
        const groups = document.querySelectorAll('.testing-group');

        if (!groups.length) return;

        groups.forEach(group => {
            const header = group.querySelector('.testing-group-header');

            if (header) {
                header.addEventListener('click', () => {
                    // Toggle open state
                    group.classList.toggle('open');
                });
            }
        });
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

        // Initialize vehicle page components
        initPropulsionCards();
        initTestingGroups();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
