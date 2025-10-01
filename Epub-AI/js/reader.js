/**
 * Reader Module
 * Manages EPUB content display and rendering
 */

class Reader {
    constructor() {
        this.book = null;
        this.rendition = null;
        this.container = null;
        this.currentLocation = null;
        
        // Progress tracking
        this.currentPage = 0;
        this.totalPages = 0;
    }
    
    /**
     * Initialize the reader with a book
     * @param {Book} book - ePub.js Book instance
     * @param {HTMLElement} container - Container element for rendering
     */
    async init(book, container) {
        try {
            this.book = book;
            this.container = container;
            
            // Clear container
            this.container.innerHTML = '';
            
            // Create rendition with responsive sizing
            this.rendition = book.renderTo(container, {
                width: '100%',
                height: '100%',
                spread: 'none', // Single page view for mobile/tablet
                flow: 'paginated' // Paginated flow for better UX
            });
            
            // Apply custom styles to content
            this.applyStyles();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Generate locations for progress tracking
            await this.generateLocations();
            
            console.log('Reader initialized successfully');
            
        } catch (error) {
            console.error('Error initializing reader:', error);
            throw new Error(`Failed to initialize reader: ${error.message}`);
        }
    }
    
    /**
     * Apply custom styles to rendered content
     */
    applyStyles() {
        if (!this.rendition) return;
        
        // Override default ePub.js styles
        this.rendition.themes.default({
            'body': {
                'font-family': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                'line-height': '1.6',
                'padding': '0 !important',
                'margin': '0 !important'
            },
            'p': {
                'margin-bottom': '1em',
                'text-align': 'justify',
                'hyphens': 'auto',
                '-webkit-hyphens': 'auto'
            },
            'img': {
                'max-width': '100%',
                'height': 'auto'
            }
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        if (!this.rendition) return;
        
        // Track location changes
        this.rendition.on('relocated', (location) => {
            this.currentLocation = location.start.cfi;
            this.updateProgress();
        });
        
        // Handle rendering errors
        this.rendition.on('error', (error) => {
            console.error('Rendering error:', error);
        });
    }
    
    /**
     * Generate locations for progress tracking
     */
    async generateLocations() {
        if (!this.book) return;
        
        try {
            // Generate 1024 locations (recommended by ePub.js)
            await this.book.locations.generate(1024);
            this.totalPages = this.book.locations.total;
            console.log('Locations generated:', this.totalPages);
        } catch (error) {
            console.error('Error generating locations:', error);
            // Continue without locations - not critical
        }
    }
    
    /**
     * Display the first page of the book
     */
    async displayFirstPage() {
        if (!this.rendition) {
            throw new Error('Reader not initialized');
        }
        
        try {
            await this.rendition.display();
            this.updateProgress();
        } catch (error) {
            console.error('Error displaying first page:', error);
            throw new Error(`Failed to display content: ${error.message}`);
        }
    }
    
    /**
     * Navigate to the next page
     * @returns {Promise<void>}
     */
    async nextPage() {
        if (!this.rendition) return;
        
        try {
            await this.rendition.next();
            this.addTransitionClass('slide-right');
        } catch (error) {
            console.error('Error navigating to next page:', error);
        }
    }
    
    /**
     * Navigate to the previous page
     * @returns {Promise<void>}
     */
    async prevPage() {
        if (!this.rendition) return;
        
        try {
            await this.rendition.prev();
            this.addTransitionClass('slide-left');
        } catch (error) {
            console.error('Error navigating to previous page:', error);
        }
    }
    
    /**
     * Go to a specific location
     * @param {string} cfi - CFI location string
     * @returns {Promise<void>}
     */
    async goToLocation(cfi) {
        if (!this.rendition) return;
        
        try {
            await this.rendition.display(cfi);
        } catch (error) {
            console.error('Error going to location:', error);
            // Fallback to first page
            await this.displayFirstPage();
        }
    }
    
    /**
     * Get current location
     * @returns {string|null} - Current CFI location
     */
    getCurrentLocation() {
        return this.currentLocation;
    }
    
    /**
     * Update progress indicators
     */
    updateProgress() {
        // Update page numbers
        if (this.book && this.book.locations && this.currentLocation) {
            const currentPage = this.book.locations.locationFromCfi(this.currentLocation);
            this.currentPage = currentPage;
            
            // Update UI
            this.updateProgressUI();
        }
    }
    
    /**
     * Update progress UI elements
     */
    updateProgressUI() {
        const currentPageEl = document.getElementById('current-page');
        const totalPagesEl = document.getElementById('total-pages');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        
        if (currentPageEl) {
            currentPageEl.textContent = this.currentPage || 0;
        }
        
        if (totalPagesEl) {
            totalPagesEl.textContent = this.totalPages || 0;
        }
        
        // Enable/disable navigation buttons
        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    }
    
    /**
     * Add transition animation class
     * @param {string} className - Animation class name
     */
    addTransitionClass(className) {
        if (!this.container) return;
        
        this.container.classList.add(className);
        
        // Remove class after animation
        setTimeout(() => {
            this.container.classList.remove(className);
        }, 300);
    }
    
    /**
     * Check if can navigate to next page
     * @returns {boolean}
     */
    canGoNext() {
        if (!this.rendition) return false;
        // ePub.js doesn't provide a direct way, so we check against total pages
        return this.currentPage < this.totalPages;
    }
    
    /**
     * Check if can navigate to previous page
     * @returns {boolean}
     */
    canGoPrev() {
        if (!this.rendition) return false;
        return this.currentPage > 1;
    }
    
    /**
     * Resize rendition (useful for orientation changes)
     */
    resize() {
        if (this.rendition) {
            this.rendition.resize();
        }
    }
    
    /**
     * Clean up and destroy reader
     */
    destroy() {
        if (this.rendition) {
            this.rendition.destroy();
            this.rendition = null;
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.book = null;
        this.currentLocation = null;
        this.currentPage = 0;
        this.totalPages = 0;
    }
}

export default Reader;