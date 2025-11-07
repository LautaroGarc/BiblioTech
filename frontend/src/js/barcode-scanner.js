/**
 * Barcode Scanner Invocation Module
 * Provides easy integration of the barcode scanner component
 * into any part of the BiblioTech application
 */

class BarcodeScanner {
    constructor() {
        this.isOpen = false;
        this.iframe = null;
        this.onScanCallback = null;
        this.onCloseCallback = null;
    }

    /**
     * Open the barcode scanner
     * @param {Object} options - Configuration options
     * @param {Function} options.onScan - Callback when barcode is scanned
     * @param {Function} options.onClose - Callback when scanner is closed
     * @returns {Promise} Resolves with scanned data or rejects on cancel/error
     */
    open(options = {}) {
        return new Promise((resolve, reject) => {
            if (this.isOpen) {
                console.warn('Scanner is already open');
                reject(new Error('Scanner is already open'));
                return;
            }

            this.onScanCallback = options.onScan;
            this.onCloseCallback = options.onClose;

            // Create iframe container
            this.iframe = document.createElement('iframe');
            this.iframe.id = 'barcode-scanner-iframe';
            this.iframe.src = '/components/barcode-scanner.html';
            this.iframe.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                z-index: 9999;
                background: transparent;
            `;

            // Listen for messages from iframe
            const messageHandler = (event) => {
                // Security: Validate event origin
                if (event.origin !== window.location.origin) {
                    console.warn('Ignoring message from unauthorized origin:', event.origin);
                    return;
                }

                if (event.data && event.data.type === 'BARCODE_SCANNED') {
                    const scanData = event.data.data;
                    
                    // Call callback if provided
                    if (this.onScanCallback) {
                        this.onScanCallback(scanData);
                    }

                    // Resolve promise
                    resolve(scanData);

                    // Don't auto-close here, let the iframe handle it
                }
                
                if (event.data && event.data.type === 'BARCODE_SCANNER_CLOSED') {
                    // Clean up
                    window.removeEventListener('message', messageHandler);
                    
                    if (this.onCloseCallback) {
                        this.onCloseCallback();
                    }

                    this.close();
                    
                    // If we get here without a scan, reject
                    if (!event.data.scanned) {
                        reject(new Error('Scanner closed without scanning'));
                    }
                }
            };

            window.addEventListener('message', messageHandler);

            // Add to DOM
            document.body.appendChild(this.iframe);
            this.isOpen = true;

            // Handle iframe load errors
            this.iframe.onerror = () => {
                console.error('Failed to load scanner');
                window.removeEventListener('message', messageHandler);
                this.close();
                reject(new Error('Failed to load scanner'));
            };
        });
    }

    /**
     * Close the scanner
     */
    close() {
        if (this.iframe && this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
        }
        this.iframe = null;
        this.isOpen = false;
        this.onScanCallback = null;
        this.onCloseCallback = null;
    }

    /**
     * Check if scanner is currently open
     * @returns {boolean}
     */
    isActive() {
        return this.isOpen;
    }
}

// Create singleton instance
const barcodeScannerInstance = new BarcodeScanner();

/**
 * Easy-to-use function to open scanner
 * @param {Object} options - Configuration options
 * @returns {Promise} Promise with scan result
 */
function openBarcodeScanner(options = {}) {
    return barcodeScannerInstance.open(options);
}

/**
 * Close the barcode scanner
 */
function closeBarcodeScanner() {
    barcodeScannerInstance.close();
}

/**
 * Check if scanner is active
 * @returns {boolean}
 */
function isScannerActive() {
    return barcodeScannerInstance.isActive();
}

// Export for use in different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BarcodeScanner,
        openBarcodeScanner,
        closeBarcodeScanner,
        isScannerActive
    };
}

// Also attach to window for script tag usage
if (typeof window !== 'undefined') {
    window.BarcodeScanner = BarcodeScanner;
    window.openBarcodeScanner = openBarcodeScanner;
    window.closeBarcodeScanner = closeBarcodeScanner;
    window.isScannerActive = isScannerActive;
}
