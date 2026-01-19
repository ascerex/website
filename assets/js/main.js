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
            // Clear any pending hover timeout
            clearTimeout(hoverTimeout);

            // If click during autoscroll cooldown, don't scroll but take over control
            if (autoscrollCooldown) {
                autoscrollCooldown = false;
                // Stop autoscroll by clearing hover flags until mouse re-enters
                isHoveringLeft = false;
                isHoveringRight = false;
                clickCooldown = true;
                setTimeout(() => {
                    clickCooldown = false;
                }, 100);
                return;
            }

            // Navigate
            if (direction === 'next') {
                nextSlide();
            } else {
                prevSlide();
            }

            // Set cooldown to prevent hover from triggering immediately after click
            clickCooldown = true;
            setTimeout(() => {
                clickCooldown = false;
            }, 400);
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

                    // Set brief cooldown to prevent click double-scroll
                    autoscrollCooldown = true;
                    setTimeout(() => {
                        autoscrollCooldown = false;
                    }, 400);

                    // Continue scrolling if still hovering
                    setTimeout(() => {
                        if (!clickCooldown && ((direction === 'next' && isHoveringRight) ||
                            (direction === 'prev' && isHoveringLeft))) {
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
        constructor(el, speed = 25) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#________';
            this.originalText = el.textContent;
            this.isAnimating = false;
            this.speed = speed;
        }

        scramble() {
            if (this.isAnimating) return;
            this.isAnimating = true;

            const text = this.originalText;
            const length = text.length;
            let iteration = 0;
            // Faster reveal: use 1.5x multiplier instead of 2x
            const maxIterations = Math.ceil(length * 1.5);

            const interval = setInterval(() => {
                this.el.textContent = text
                    .split('')
                    .map((char, index) => {
                        // Reveal characters faster
                        if (index < iteration / 1.5) {
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
            }, this.speed);
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

        // Initialize scramble instances for each card (type = fast, status = normal with delay)
        cards.forEach(card => {
            const typeEl = card.querySelector('.propulsion-card-type');
            const statusEl = card.querySelector('.propulsion-card-status');
            scrambleInstances.set(card, {
                type: typeEl ? new TextScramble(typeEl, 15) : null,  // Faster speed
                status: statusEl ? new TextScramble(statusEl, 20) : null  // Slightly slower
            });
        });

        // Hover handlers for scramble effect - type starts immediately, status delayed
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const instances = scrambleInstances.get(card);
                if (instances) {
                    // Start type immediately
                    if (instances.type) instances.type.scramble();
                    // Start status after short delay
                    setTimeout(() => {
                        if (instances.status) instances.status.scramble();
                    }, 100);
                }
            });
        });

        // Get card width for scrolling
        function getCardWidth() {
            const card = cards[0];
            const gap = 24;
            return card.offsetWidth + gap;
        }

        // Get current card index based on scroll position
        let currentCardIndex = 0;

        function getCurrentCardIndex() {
            const cardWidth = getCardWidth();
            const bounds = getScrollBounds();
            const scrollPos = slidesContainer.scrollLeft - bounds.min;
            return Math.round(scrollPos / cardWidth);
        }

        // Get scroll boundaries (accounting for spacers)
        function getScrollBounds() {
            const cardWidth = getCardWidth();
            const totalCards = cards.length;
            const gap = 24;

            // Calculate actual content width (all cards + gaps between them)
            const contentWidth = (cardWidth * totalCards) + (gap * (totalCards - 1));

            // Spacer width is (scrollWidth - contentWidth) / 2
            const totalScrollWidth = slidesContainer.scrollWidth;
            const spacerWidth = (totalScrollWidth - contentWidth) / 2;

            const maxScroll = totalScrollWidth - slidesContainer.clientWidth;

            return {
                min: Math.max(0, spacerWidth - cardWidth * 0.1),
                max: Math.min(maxScroll, maxScroll - spacerWidth + cardWidth * 0.1),
                spacerWidth: spacerWidth
            };
        }

        // Scroll to specific card index
        function scrollToCard(index) {
            const bounds = getScrollBounds();
            const cardWidth = getCardWidth();
            const targetScroll = bounds.min + (index * cardWidth);

            // Clamp to bounds
            const clampedScroll = Math.max(bounds.min, Math.min(bounds.max, targetScroll));
            slidesContainer.scrollTo({ left: clampedScroll, behavior: 'smooth' });
            currentCardIndex = index;
        }

        // Check if at start boundary
        function isAtStart() {
            return currentCardIndex <= 0;
        }

        // Check if at end boundary
        function isAtEnd() {
            return currentCardIndex >= cards.length - 1;
        }

        // Scroll to next/prev
        function scrollNext() {
            if (isAtEnd()) return false;
            currentCardIndex = Math.min(cards.length - 1, getCurrentCardIndex() + 1);
            scrollToCard(currentCardIndex);
            return true;
        }

        function scrollPrev() {
            if (isAtStart()) return false;
            currentCardIndex = Math.max(0, getCurrentCardIndex() - 1);
            scrollToCard(currentCardIndex);
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

        // Check if card is fully visible (not an edge/peeking card)
        function isCardFullyVisible(card) {
            const containerRect = slidesContainer.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();

            // Card must be fully within container bounds (with small tolerance)
            const tolerance = 10;
            return cardRect.left >= containerRect.left - tolerance &&
                   cardRect.right <= containerRect.right + tolerance;
        }

        // Get card index
        function getCardIndex(card) {
            return Array.from(cards).indexOf(card);
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
            // Clear any pending hover timeout
            clearTimeout(hoverTimeout);

            // If click during autoscroll cooldown, don't scroll but take over control
            if (autoscrollCooldown) {
                autoscrollCooldown = false;
                // Stop autoscroll by clearing hover flags until mouse re-enters
                isHoveringLeft = false;
                isHoveringRight = false;
                clickCooldown = true;
                setTimeout(() => {
                    clickCooldown = false;
                }, 100);
                return;
            }

            if (direction === 'next') {
                scrollNext();
            } else {
                scrollPrev();
            }

            // Set cooldown to prevent hover from triggering immediately after click
            clickCooldown = true;
            setTimeout(() => {
                clickCooldown = false;
            }, 400);
        }

        // Handle hover autoscroll
        function handleHover(direction) {
            if (clickCooldown) return;

            // Check boundaries before starting
            if (direction === 'next' && isAtEnd()) return;
            if (direction === 'prev' && isAtStart()) return;

            hoverTimeout = setTimeout(() => {
                if (!clickCooldown) {
                    if (direction === 'next') {
                        scrollNext();
                    } else {
                        scrollPrev();
                    }

                    // Set brief cooldown to prevent click double-scroll
                    autoscrollCooldown = true;
                    setTimeout(() => {
                        autoscrollCooldown = false;
                    }, 400);

                    // Continue scrolling if still hovering
                    setTimeout(() => {
                        if (!clickCooldown && ((direction === 'next' && isHoveringRight && !isAtEnd()) ||
                            (direction === 'prev' && isHoveringLeft && !isAtStart()))) {
                            handleHover(direction);
                        }
                    }, 650);
                }
            }, 300);
        }

        // Snap to nearest card after manual scrolling ends
        let scrollEndTimeout = null;

        function snapToNearestCard() {
            // Don't snap if hovering on nav fields
            if (isHoveringLeft || isHoveringRight) return;

            // Update index based on current position and snap to it
            currentCardIndex = getCurrentCardIndex();
            currentCardIndex = Math.max(0, Math.min(cards.length - 1, currentCardIndex));
            scrollToCard(currentCardIndex);
        }

        // Scroll event - update line, close expanded, and snap to card
        slidesContainer.addEventListener('scroll', () => {
            // Clear previous timeout
            clearTimeout(scrollEndTimeout);

            // Handle expanded card visibility
            if (activeCard && expandedWrapper.classList.contains('active')) {
                if (isCardVisible(activeCard)) {
                    updateLinePosition();
                } else {
                    closeExpanded();
                }
            }

            // Snap to nearest card after scrolling stops (debounced)
            scrollEndTimeout = setTimeout(snapToNearestCard, 150);

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

        // Initialize scroll position to first card
        function initScrollPosition() {
            currentCardIndex = 0;
            scrollToCard(0);
        }

        // Set initial position after a brief delay to ensure layout is complete
        setTimeout(initScrollPosition, 100);

        // Recalculate on resize - maintain current card
        window.addEventListener('resize', () => {
            scrollToCard(currentCardIndex);
        });

        // Show expanded content for a card
        function showExpandedContent(card) {
            if (!expandedWrapper) return;

            // Remove active from previous card
            if (activeCard && activeCard !== card) {
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
        }

        // Click handler for expansion
        cards.forEach((card) => {
            card.addEventListener('click', () => {
                if (!expandedWrapper) return;

                // If clicking the same card, close it
                if (activeCard === card) {
                    closeExpanded();
                    return;
                }

                // If card is an edge/peeking card (not fully visible), scroll by 1 in appropriate direction
                if (!isCardFullyVisible(card)) {
                    const cardRect = card.getBoundingClientRect();
                    const containerRect = slidesContainer.getBoundingClientRect();
                    const containerCenter = containerRect.left + containerRect.width / 2;
                    const cardCenter = cardRect.left + cardRect.width / 2;

                    // Determine direction based on where the card is relative to center
                    if (cardCenter > containerCenter) {
                        // Card is on the right edge, scroll right (next)
                        scrollNext();
                    } else {
                        // Card is on the left edge, scroll left (prev)
                        scrollPrev();
                    }

                    // Show details after scroll animation completes
                    setTimeout(() => {
                        showExpandedContent(card);
                    }, 450);
                    return;
                }

                // Card is fully visible, show details immediately
                showExpandedContent(card);
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
