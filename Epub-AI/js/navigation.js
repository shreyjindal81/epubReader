/**
 * Navigation Module
 * Handles page navigation through touch gestures, buttons, and keyboard
 */

class Navigation {
    constructor() {
        this.book = null;
        this.reader = null;
        
        // Touch tracking
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isSwiping = false;
        
        // Swipe threshold (in pixels)
        this.swipeThreshold = 50;
        
        // Callbacks
        this.navigateCallbacks = [];
        
        // DOM elements
        this.viewer = null;
        this.prevBtn = null;
        this.nextBtn = null;
        
        // Bound methods for event listeners
        this.boundHandleTouchStart = this.handleTouchStart.bind(this);
        this.boundHandleTouchMove = this.handleTouchMove.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandlePrevClick = this.handlePrevClick.bind(this);
        this.boundHandleNextClick = this.handleNextClick.bind(this);
        this.boundHandleResize = this.handleResize.bind(this);
    }
    
    /**
     * Initialize navigation
     * @param {Book} book - ePub.js Book instance
     * @param {Reader} reader - Reader instance
     */
    init(book, reader) {
        this.book = book;
        this.reader = reader;
        
        // Get DOM elements
        this.viewer = document.getElementById('viewer');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Navigation initialized');
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Touch gestures
        if (this.viewer) {
            this.viewer.addEventListener('touchstart', this.boundHandleTouchStart, { passive: true });
            this.viewer.addEventListener('touchmove', this.boundHandleTouchMove, { passive: true });
            this.viewer.addEventListener('touchend', this.boundHandleTouchEnd, { passive: true });
            
            // Tap zones (click)
            this.viewer.addEventListener('click', this.boundHandleClick);
        }
        
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', this.boundHandlePrevClick);
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', this.boundHandleNextClick);
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', this.boundHandleKeyDown);
        
        // Handle window resize/orientation change
        window.addEventListener('resize', this.boundHandleResize);
    }
    
    /**
     * Handle touch start
     * @param {TouchEvent} e - Touch event
     */
    handleTouchStart(e) {
        if (!e.touches || e.touches.length === 0) return;
        
        this.touchStartX = e.touches[0].screenX;
        this.touchStartY = e.touches[0].screenY;
        this.isSwiping = false;
    }
    
    /**
     * Handle touch move
     * @param {TouchEvent} e - Touch event
     */
    handleTouchMove(e) {
        if (!e.touches || e.touches.length === 0) return;
        
        const deltaX = Math.abs(e.touches[0].screenX - this.touchStartX);
        const deltaY = Math.abs(e.touches[0].screenY - this.touchStartY);
        
        // Detect horizontal swipe (more horizontal than vertical movement)
        if (deltaX > deltaY && deltaX > 10) {
            this.isSwiping = true;
        }
    }
    
    /**
     * Handle touch end
     * @param {TouchEvent} e - Touch event
     */
    handleTouchEnd(e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
        
        if (this.isSwiping) {
            this.handleSwipe();
        }
        
        // Reset
        this.isSwiping = false;
    }
    
    /**
     * Handle swipe gesture
     */
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = Math.abs(this.touchEndY - this.touchStartY);
        
        // Check if horizontal swipe exceeds threshold
        if (Math.abs(deltaX) < this.swipeThreshold) {
            return;
        }
        
        // Ensure it's primarily horizontal (not vertical scroll)
        if (deltaY > Math.abs(deltaX) * 0.5) {
            return;
        }
        
        if (deltaX < 0) {
            // Swipe left - next page
            this.next();
        } else {
            // Swipe right - previous page
            this.prev();
        }
    }
    
    /**
     * Handle tap zones
     * @param {MouseEvent} e - Click event
     */
    handleClick(e) {
        // Don't handle if clicking on navigation buttons or links
        if (e.target.closest('button') || e.target.closest('a')) {
            return;
        }
        
        const clickX = e.clientX;
        const viewerWidth = this.viewer.offsetWidth;
        
        // Left 30% = previous page
        if (clickX < viewerWidth * 0.3) {
            this.prev();
        }
        // Right 30% = next page
        else if (clickX > viewerWidth * 0.7) {
            this.next();
        }
        // Center 40% = reserved for future menu/settings
    }
    
    /**
     * Handle previous button click
     * @param {Event} e - Click event
     */
    handlePrevClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.prev();
    }
    
    /**
     * Handle next button click
     * @param {Event} e - Click event
     */
    handleNextClick(e) {
        e.preventDefault();
        e.stopPropagation();
        this.next();
    }
    
    /**
     * Handle keyboard navigation
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyDown(e) {
        // Only handle if reader is visible
        const readerContainer = document.getElementById('reader-container');
        if (!readerContainer || readerContainer.style.display === 'none') {
            return;
        }
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                this.prev();
                break;
                
            case 'ArrowRight':
            case 'ArrowDown':
            case 'PageDown':
            case ' ': // Spacebar
                e.preventDefault();
                this.next();
                break;
                
            case 'Home':
                e.preventDefault();
                // Go to beginning - future enhancement
                break;
                
            case 'End':
                e.preventDefault();
                // Go to end - future enhancement
                break;
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Debounce resize events
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            if (this.reader) {
                this.reader.resize();
            }
        }, 250);
    }
    
    /**
     * Navigate to next page
     */
    async next() {
        if (!this.reader) return;
        
        try {
            await this.reader.nextPage();
            this.triggerNavigateCallbacks();
        } catch (error) {
            console.error('Error navigating to next page:', error);
        }
    }
    
    /**
     * Navigate to previous page
     */
    async prev() {
        if (!this.reader) return;
        
        try {
            await this.reader.prevPage();
            this.triggerNavigateCallbacks();
        } catch (error) {
            console.error('Error navigating to previous page:', error);
        }
    }
    
    /**
     * Register callback for navigation events
     * @param {Function} callback - Callback function
     */
    onNavigate(callback) {
        if (typeof callback === 'function') {
            this.navigateCallbacks.push(callback);
        }
    }
    
    /**
     * Trigger all navigate callbacks
     */
    triggerNavigateCallbacks() {
        this.navigateCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in navigate callback:', error);
            }
        });
    }
    
    /**
     * Clean up and remove event listeners
     */
    destroy() {
        // Remove touch listeners
        if (this.viewer) {
            this.viewer.removeEventListener('touchstart', this.boundHandleTouchStart);
            this.viewer.removeEventListener('touchmove', this.boundHandleTouchMove);
            this.viewer.removeEventListener('touchend', this.boundHandleTouchEnd);
            this.viewer.removeEventListener('click', this.boundHandleClick);
        }
        
        // Remove button listeners
        if (this.prevBtn) {
            this.prevBtn.removeEventListener('click', this.boundHandlePrevClick);
        }
        
        if (this.nextBtn) {
            this.nextBtn.removeEventListener('click', this.boundHandleNextClick);
        }
        
        // Remove keyboard listener
        document.removeEventListener('keydown', this.boundHandleKeyDown);
        
        // Remove resize listener
        window.removeEventListener('resize', this.boundHandleResize);
        
        // Clear references
        this.book = null;
        this.reader = null;
        this.viewer = null;
        this.prevBtn = null;
        this.nextBtn = null;
        this.navigateCallbacks = [];
    }
}

export default Navigation;