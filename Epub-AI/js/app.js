/**
 * Main Application Initialization
 * Handles app startup, module initialization, and global error handling
 */

import EPUBHandler from './epub-handler.js';
import Reader from './reader.js';
import Navigation from './navigation.js';
import Storage from './storage.js';

class App {
    constructor() {
        this.epubHandler = null;
        this.reader = null;
        this.navigation = null;
        this.storage = null;
        
        // DOM elements
        this.uploadContainer = null;
        this.loadingContainer = null;
        this.readerContainer = null;
        this.errorContainer = null;
        this.fileInput = null;
        this.fileInfo = null;
        this.backBtn = null;
        this.errorDismiss = null;
        
        // State
        this.currentBook = null;
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Get DOM references
            this.getDOMReferences();
            
            // Initialize modules
            this.initializeModules();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Set up global error handling
            this.setupErrorHandling();
            
            console.log('App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    /**
     * Get references to DOM elements
     */
    getDOMReferences() {
        this.uploadContainer = document.getElementById('upload-container');
        this.loadingContainer = document.getElementById('loading-container');
        this.readerContainer = document.getElementById('reader-container');
        this.errorContainer = document.getElementById('error-container');
        this.fileInput = document.getElementById('epub-file-input');
        this.fileInfo = document.getElementById('file-info');
        this.backBtn = document.getElementById('back-btn');
        this.errorDismiss = document.getElementById('error-dismiss');
        
        // Validate that all required elements exist
        if (!this.uploadContainer || !this.loadingContainer || !this.readerContainer || 
            !this.errorContainer || !this.fileInput) {
            throw new Error('Required DOM elements not found');
        }
    }
    
    /**
     * Initialize application modules
     */
    initializeModules() {
        this.storage = new Storage();
        this.epubHandler = new EPUBHandler();
        this.reader = new Reader();
        this.navigation = new Navigation();
        
        console.log('Modules initialized');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Back button
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.returnToUpload());
        }
        
        // Error dismiss
        if (this.errorDismiss) {
            this.errorDismiss.addEventListener('click', () => this.dismissError());
        }
    }
    
    /**
     * Set up global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // Don't show error UI for every error, just log it
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            // Don't show error UI for every rejection, just log it
        });
    }
    
    /**
     * Handle file selection
     */
    async handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }
        
        // Validate file
        if (!file.name.toLowerCase().endsWith('.epub')) {
            this.showError('Please select a valid EPUB file.');
            this.fileInput.value = '';
            return;
        }
        
        // Check file size (50MB limit)
        const maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.size > maxSize) {
            this.showError('File is too large. Maximum size is 50MB.');
            this.fileInput.value = '';
            return;
        }
        
        try {
            // Show loading state
            this.showLoading();
            
            // Load the EPUB file
            const book = await this.epubHandler.loadBook(file);
            this.currentBook = book;
            
            // Initialize reader with the book
            await this.reader.init(book, document.getElementById('viewer'));
            
            // Initialize navigation
            this.navigation.init(book, this.reader);
            
            // Try to restore reading position
            const savedPosition = this.storage.getReadingPosition(file.name);
            if (savedPosition) {
                await this.reader.goToLocation(savedPosition);
            } else {
                await this.reader.displayFirstPage();
            }
            
            // Set up progress saving
            this.setupProgressSaving(file.name);
            
            // Show reader interface
            this.showReader();
            
        } catch (error) {
            console.error('Error loading EPUB:', error);
            this.showError(`Failed to load EPUB file: ${error.message}`);
            this.fileInput.value = '';
        }
    }
    
    /**
     * Set up automatic progress saving
     */
    setupProgressSaving(bookName) {
        // Save progress when navigating
        this.navigation.onNavigate(() => {
            const location = this.reader.getCurrentLocation();
            if (location) {
                this.storage.saveReadingPosition(bookName, location);
            }
        });
        
        // Save progress before page unload
        window.addEventListener('beforeunload', () => {
            const location = this.reader.getCurrentLocation();
            if (location) {
                this.storage.saveReadingPosition(bookName, location);
            }
        });
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        this.uploadContainer.style.display = 'none';
        this.loadingContainer.style.display = 'flex';
        this.readerContainer.style.display = 'none';
        this.errorContainer.style.display = 'none';
    }
    
    /**
     * Show reader interface
     */
    showReader() {
        this.uploadContainer.style.display = 'none';
        this.loadingContainer.style.display = 'none';
        this.readerContainer.style.display = 'flex';
        this.errorContainer.style.display = 'none';
    }
    
    /**
     * Show upload interface
     */
    showUpload() {
        this.uploadContainer.style.display = 'flex';
        this.loadingContainer.style.display = 'none';
        this.readerContainer.style.display = 'none';
        this.errorContainer.style.display = 'none';
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.uploadContainer.style.display = 'none';
        this.loadingContainer.style.display = 'none';
        this.readerContainer.style.display = 'none';
        this.errorContainer.style.display = 'flex';
        
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
    
    /**
     * Dismiss error and return to upload
     */
    dismissError() {
        this.showUpload();
    }
    
    /**
     * Return to upload screen
     */
    returnToUpload() {
        // Clean up current book
        if (this.reader) {
            this.reader.destroy();
        }
        if (this.navigation) {
            this.navigation.destroy();
        }
        if (this.currentBook) {
            this.currentBook.destroy();
            this.currentBook = null;
        }
        
        // Reset file input
        this.fileInput.value = '';
        if (this.fileInfo) {
            this.fileInfo.textContent = '';
        }
        
        // Show upload interface
        this.showUpload();
    }
}

// Initialize app when script loads
const app = new App();
app.init();

// Export for potential debugging
window.app = app;