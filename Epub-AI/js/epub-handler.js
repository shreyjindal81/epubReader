/**
 * EPUB Handler Module
 * Manages EPUB file loading and ePub.js integration
 */

class EPUBHandler {
    constructor() {
        this.currentBook = null;
    }
    
    /**
     * Load an EPUB file
     * @param {File} file - The EPUB file to load
     * @returns {Promise<Book>} - ePub.js Book instance
     */
    async loadBook(file) {
        try {
            // Validate that ePub.js is loaded
            if (typeof ePub === 'undefined') {
                throw new Error('ePub.js library not loaded. Please check your internet connection.');
            }
            
            // Read file as ArrayBuffer
            const arrayBuffer = await this.readFileAsArrayBuffer(file);
            
            // Create ePub.js book instance
            const book = ePub(arrayBuffer);
            
            // Wait for book to be ready
            await book.ready;
            
            // Store reference
            this.currentBook = book;
            
            console.log('EPUB loaded successfully:', {
                title: book.packaging?.metadata?.title || 'Unknown',
                author: book.packaging?.metadata?.creator || 'Unknown',
                identifier: book.packaging?.metadata?.identifier || 'Unknown'
            });
            
            return book;
            
        } catch (error) {
            console.error('Error loading EPUB:', error);
            throw new Error(`Failed to load EPUB: ${error.message}`);
        }
    }
    
    /**
     * Read file as ArrayBuffer
     * @param {File} file - File to read
     * @returns {Promise<ArrayBuffer>}
     */
    readFileAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            
            reader.onerror = (error) => {
                reject(new Error(`Failed to read file: ${error}`));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }
    
    /**
     * Get book metadata
     * @returns {Object} - Book metadata
     */
    getMetadata() {
        if (!this.currentBook) {
            return null;
        }
        
        const metadata = this.currentBook.packaging?.metadata || {};
        
        return {
            title: metadata.title || 'Unknown Title',
            author: metadata.creator || 'Unknown Author',
            publisher: metadata.publisher || 'Unknown Publisher',
            language: metadata.language || 'en',
            identifier: metadata.identifier || 'unknown',
            description: metadata.description || '',
            pubdate: metadata.pubdate || '',
            rights: metadata.rights || ''
        };
    }
    
    /**
     * Get table of contents
     * @returns {Promise<Array>} - Table of contents
     */
    async getTOC() {
        if (!this.currentBook) {
            return [];
        }
        
        try {
            const navigation = await this.currentBook.loaded.navigation;
            return navigation.toc || [];
        } catch (error) {
            console.error('Error getting TOC:', error);
            return [];
        }
    }
    
    /**
     * Get cover image URL
     * @returns {Promise<string|null>} - Cover image URL or null
     */
    async getCoverURL() {
        if (!this.currentBook) {
            return null;
        }
        
        try {
            const cover = await this.currentBook.coverUrl();
            return cover;
        } catch (error) {
            console.error('Error getting cover:', error);
            return null;
        }
    }
    
    /**
     * Get total number of locations/pages
     * @returns {number} - Total locations
     */
    getTotalLocations() {
        if (!this.currentBook || !this.currentBook.locations) {
            return 0;
        }
        
        return this.currentBook.locations.total || 0;
    }
    
    /**
     * Get current book instance
     * @returns {Book|null}
     */
    getCurrentBook() {
        return this.currentBook;
    }
    
    /**
     * Destroy current book and clean up
     */
    destroy() {
        if (this.currentBook) {
            this.currentBook.destroy();
            this.currentBook = null;
        }
    }
}

export default EPUBHandler;