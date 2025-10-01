/**
 * Storage Module
 * Manages reading position persistence using localStorage
 */

class Storage {
    constructor() {
        this.storagePrefix = 'epub_reader_';
        this.isAvailable = this.checkStorageAvailability();
        
        if (!this.isAvailable) {
            console.warn('localStorage is not available. Reading progress will not be saved.');
        }
    }
    
    /**
     * Check if localStorage is available
     * @returns {boolean}
     */
    checkStorageAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Generate storage key for a book
     * @param {string} bookIdentifier - Book identifier (filename or unique ID)
     * @returns {string} - Storage key
     */
    getStorageKey(bookIdentifier) {
        // Create a simple hash of the book identifier
        const hash = this.simpleHash(bookIdentifier);
        return `${this.storagePrefix}position_${hash}`;
    }
    
    /**
     * Simple hash function for book identifiers
     * @param {string} str - String to hash
     * @returns {string} - Hash string
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    
    /**
     * Save reading position for a book
     * @param {string} bookIdentifier - Book identifier
     * @param {string} location - CFI location string
     * @returns {boolean} - Success status
     */
    saveReadingPosition(bookIdentifier, location) {
        if (!this.isAvailable || !bookIdentifier || !location) {
            return false;
        }
        
        try {
            const key = this.getStorageKey(bookIdentifier);
            const data = {
                location: location,
                timestamp: Date.now(),
                bookIdentifier: bookIdentifier
            };
            
            localStorage.setItem(key, JSON.stringify(data));
            console.log('Reading position saved:', bookIdentifier);
            return true;
            
        } catch (error) {
            console.error('Error saving reading position:', error);
            
            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                console.warn('Storage quota exceeded. Cleaning up old data...');
                this.cleanupOldData();
                
                // Try saving again after cleanup
                try {
                    const key = this.getStorageKey(bookIdentifier);
                    const data = {
                        location: location,
                        timestamp: Date.now(),
                        bookIdentifier: bookIdentifier
                    };
                    localStorage.setItem(key, JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    console.error('Failed to save after cleanup:', retryError);
                    return false;
                }
            }
            
            return false;
        }
    }
    
    /**
     * Get saved reading position for a book
     * @param {string} bookIdentifier - Book identifier
     * @returns {string|null} - CFI location string or null
     */
    getReadingPosition(bookIdentifier) {
        if (!this.isAvailable || !bookIdentifier) {
            return null;
        }
        
        try {
            const key = this.getStorageKey(bookIdentifier);
            const dataStr = localStorage.getItem(key);
            
            if (!dataStr) {
                return null;
            }
            
            const data = JSON.parse(dataStr);
            console.log('Reading position loaded:', bookIdentifier);
            return data.location;
            
        } catch (error) {
            console.error('Error loading reading position:', error);
            return null;
        }
    }
    
    /**
     * Remove reading position for a book
     * @param {string} bookIdentifier - Book identifier
     * @returns {boolean} - Success status
     */
    removeReadingPosition(bookIdentifier) {
        if (!this.isAvailable || !bookIdentifier) {
            return false;
        }
        
        try {
            const key = this.getStorageKey(bookIdentifier);
            localStorage.removeItem(key);
            console.log('Reading position removed:', bookIdentifier);
            return true;
        } catch (error) {
            console.error('Error removing reading position:', error);
            return false;
        }
    }
    
    /**
     * Get all saved reading positions
     * @returns {Array} - Array of saved positions
     */
    getAllReadingPositions() {
        if (!this.isAvailable) {
            return [];
        }
        
        const positions = [];
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                // Check if key belongs to this app
                if (key && key.startsWith(this.storagePrefix)) {
                    const dataStr = localStorage.getItem(key);
                    if (dataStr) {
                        try {
                            const data = JSON.parse(dataStr);
                            positions.push(data);
                        } catch (parseError) {
                            console.error('Error parsing saved position:', parseError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error getting all positions:', error);
        }
        
        return positions;
    }
    
    /**
     * Clean up old reading positions (older than 90 days)
     */
    cleanupOldData() {
        if (!this.isAvailable) {
            return;
        }
        
        const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
        const now = Date.now();
        const keysToRemove = [];
        
        try {
            // Find old entries
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                
                if (key && key.startsWith(this.storagePrefix)) {
                    const dataStr = localStorage.getItem(key);
                    if (dataStr) {
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.timestamp && (now - data.timestamp) > maxAge) {
                                keysToRemove.push(key);
                            }
                        } catch (parseError) {
                            // Remove corrupted entries
                            keysToRemove.push(key);
                        }
                    }
                }
            }
            
            // Remove old entries
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`Cleaned up ${keysToRemove.length} old reading positions`);
            
        } catch (error) {
            console.error('Error cleaning up old data:', error);
        }
    }
    
    /**
     * Clear all reading positions
     * @returns {boolean} - Success status
     */
    clearAllReadingPositions() {
        if (!this.isAvailable) {
            return false;
        }
        
        try {
            const keysToRemove = [];
            
            // Find all app keys
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`Cleared ${keysToRemove.length} reading positions`);
            return true;
            
        } catch (error) {
            console.error('Error clearing all positions:', error);
            return false;
        }
    }
    
    /**
     * Get storage usage statistics
     * @returns {Object} - Storage statistics
     */
    getStorageStats() {
        if (!this.isAvailable) {
            return {
                available: false,
                count: 0,
                totalSize: 0
            };
        }
        
        let count = 0;
        let totalSize = 0;
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    count++;
                    const value = localStorage.getItem(key);
                    if (value) {
                        // Rough estimate of size in bytes
                        totalSize += (key.length + value.length) * 2;
                    }
                }
            }
        } catch (error) {
            console.error('Error getting storage stats:', error);
        }
        
        return {
            available: true,
            count: count,
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2)
        };
    }
}

export default Storage;