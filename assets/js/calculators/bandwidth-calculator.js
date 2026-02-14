/**
 * Bandwidth Calculator - FIXED & ENHANCED
 * All bugs fixed, validation added, notifications implemented
 * Version: 2.0
 */

document.addEventListener('DOMContentLoaded', function () {

    // ══════════════════════════════════════
    //  CONFIGURATION
    // ══════════════════════════════════════
    const CONFIG = {
        BITS_PER_BYTE: 8,
        BYTES_PER_KB: 1024,
        DAYS_PER_MONTH: 30,
        SECONDS_PER_DAY: 86400,
        PEAK_TRAFFIC_MULTIPLIER: 10,
        MAX_INPUT_VALUE: 1000000000,
        DECIMAL_PLACES: 4
    };

    // ══════════════════════════════════════
    //  UTILITY FUNCTIONS
    // ══════════════════════════════════════

    /**
     * Show notification message
     * @param {string} message - Message to display
     * @param {string} type - Type: 'success', 'error', 'info'
     */
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${icons[type]} notification-icon"></i>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Close notification">&times;</button>
        `;

        container.appendChild(notification);

        // Close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            removeNotification(notification);
        });

        // Auto remove after 4 seconds
        setTimeout(() => {
            removeNotification(notification);
        }, 4000);
    }

    /**
     * Remove notification with animation
     */
    function removeNotification(notification) {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    /**
     * Validate input value
     * @param {string} value - Input value
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {Object} Validation result
     */
    function validateInput(value, min = 0, max = CONFIG.MAX_INPUT_VALUE) {
        const num = parseFloat(value);

        if (!value || value.trim() === '') {
            return { valid: false, error: 'Please enter a value' };
        }

        if (isNaN(num)) {
            return { valid: false, error: 'Please enter a valid number' };
        }

        if (num < min) {
            return { valid: false, error: `Value must be at least ${min}` };
        }

        if (num > max) {
            return { valid: false, error: `Value cannot exceed ${max.toLocaleString()}` };
        }

        if (!isFinite(num)) {
            return { valid: false, error: 'Value is too large' };
        }

        return { valid: true, value: num };
    }

    /**
     * Smart number formatting
     */
    function smartFormat(num) {
        if (num === 0) return '0';
        if (!isFinite(num)) return 'Invalid';
        if (num >= 1e15) return num.toExponential(CONFIG.DECIMAL_PLACES);
        if (num >= 1) return num.toLocaleString(undefined, { maximumFractionDigits: CONFIG.DECIMAL_PLACES });
        if (num >= 0.0001) return num.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
        return num.toExponential(CONFIG.DECIMAL_PLACES);
    }

    /**
     * Format bytes to human-readable
     */
    function formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        let value = bytes;
        let unitIndex = 0;

        while (value >= 1024 && unitIndex < units.length - 1) {
            value /= 1024;
            unitIndex++;
        }

        return `${value.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * Format speed to human-readable
     */
    function formatSpeed(bps) {
        if (bps >= 1e9) return `${(bps / 1e9).toFixed(2)} Gbps`;
        if (bps >= 1e6) return `${(bps / 1e6).toFixed(2)} Mbps`;
        if (bps >= 1e3) return `${(bps / 1e3).toFixed(2)} Kbps`;
        return `${bps.toFixed(2)} bps`;
    }

    /**
     * Copy text to clipboard
     */
    function copyToClipboard(text, button) {
        // Remove units and formatting for pure number
        const cleanText = text.replace(/[^\d.-]/g, '');
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(cleanText).then(() => {
                // Visual feedback
                const originalClass = button.className;
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.className = originalClass;
                }, 1500);
                
                showNotification('Copied to clipboard!', 'success');
            }).catch(err => {
                console.error('Copy failed:', err);
                showNotification('Failed to copy', 'error');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = cleanText;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                showNotification('Copied to clipboard!', 'success');
                
                const originalClass = button.className;
                button.classList.add('copied');
                setTimeout(() => {
                    button.className = originalClass;
                }, 1500);
            } catch (err) {
                console.error('Copy failed:', err);
                showNotification('Failed to copy', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }

    /**
     * Add loading state to button
     */
    function setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // ══════════════════════════════════════
    //  TAB SWITCHING LOGIC
    // ══════════════════════════════════════
    const tabs = document.querySelectorAll('.tool-tab');
    const slides = document.querySelectorAll('.slide-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const toolId = tab.getAttribute('data-tool');
            
            // Update ARIA attributes
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            // Show matching slide
            slides.forEach(s => {
                s.classList.remove('active');
                if (s.id === 'slide-' + toolId) {
                    void s.offsetWidth; // Trigger reflow
                    s.classList.add('active');
                }
            });
        });

        // Keyboard navigation
        tab.addEventListener('keydown', (e) => {
            let targetTab = null;
            
            if (e.key === 'ArrowRight') {
                targetTab = tab.nextElementSibling || tabs[0];
            } else if (e.key === 'ArrowLeft') {
                targetTab = tab.previousElementSibling || tabs[tabs.length - 1];
            }
            
            if (targetTab) {
                targetTab.click();
                targetTab.focus();
            }
        });
    });

    // ══════════════════════════════════════
    //  COPY BUTTON HANDLERS
    // ══════════════════════════════════════
    document.addEventListener('click', (e) => {
        if (e.target.closest('.copy-btn')) {
            const button = e.target.closest('.copy-btn');
            const resultValue = button.previousElementSibling;
            if (resultValue && resultValue.textContent) {
                copyToClipboard(resultValue.textContent, button);
            }
        }
    });

    // ══════════════════════════════════════
    //  TOOL 1: Data Unit Converter
    // ══════════════════════════════════════
    const dataValueInput = document.getElementById('dataValue');
    const dataUnitSelect = document.getElementById('dataUnit');
    const convertDataBtn = document.getElementById('convertDataBtn');
    const resetDataBtn = document.getElementById('resetDataBtn');
    const dataResults = document.getElementById('dataResults');

    // All units expressed in BITS (Binary: 1 KB = 1024 bytes)
    const unitToBits = {
        'bit': 1,
        'B': 8,
        'KB': 8 * 1024,
        'MB': 8 * 1024 * 1024,
        'GB': 8 * 1024 * 1024 * 1024,
        'TB': 8 * 1024 * 1024 * 1024 * 1024,
        'PB': 8 * 1024 * 1024 * 1024 * 1024 * 1024,
        'Kbit': 1000,
        'Mbit': 1000 * 1000,
        'Gbit': 1000 * 1000 * 1000
    };

    function convertData() {
        const validation = validateInput(dataValueInput.value, 0, 999999999);
        
        if (!validation.valid) {
            showNotification(validation.error, 'error');
            return;
        }

        const value = validation.value;
        const unit = dataUnitSelect.value;

        try {
            setButtonLoading(convertDataBtn, true);

            // Small delay to show loading state
            setTimeout(() => {
                const totalBits = value * unitToBits[unit];

                // Check for overflow
                if (!isFinite(totalBits)) {
                    showNotification('Value is too large to convert', 'error');
                    setButtonLoading(convertDataBtn, false);
                    return;
                }

                Object.keys(unitToBits).forEach(u => {
                    const el = document.getElementById('res-' + u);
                    if (el) {
                        const converted = totalBits / unitToBits[u];
                        el.textContent = smartFormat(converted);
                    }
                });

                dataResults.style.display = 'block';
                showNotification('Conversion completed successfully!', 'success');
                setButtonLoading(convertDataBtn, false);
            }, 300);

        } catch (error) {
            console.error('Conversion error:', error);
            showNotification('An error occurred during conversion', 'error');
            setButtonLoading(convertDataBtn, false);
        }
    }

    convertDataBtn.addEventListener('click', convertData);
    
    resetDataBtn.addEventListener('click', () => {
        dataValueInput.value = '';
        dataResults.style.display = 'none';
        Object.keys(unitToBits).forEach(u => {
            const el = document.getElementById('res-' + u);
            if (el) el.textContent = '-';
        });
        showNotification('Form reset', 'info');
    });
    
    dataValueInput.addEventListener('keypress', e => { 
        if (e.key === 'Enter') {
            e.preventDefault();
            convertData();
        }
    });

    // ══════════════════════════════════════
    //  TOOL 2: Download/Upload Time Calculator
    // ══════════════════════════════════════
    const fileSizeInput = document.getElementById('fileSize');
    const fileUnitSelect = document.getElementById('fileUnit');
    const bandwidthInput = document.getElementById('bandwidth');
    const speedUnitSelect = document.getElementById('speedUnit');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const resultsSection = document.getElementById('resultsSection');
    const calculatedTimeSpan = document.getElementById('calculatedTime');
    const convertedMbpsSpan = document.getElementById('convertedMbps');
    const convertedMBpsSpan = document.getElementById('convertedMBps');

    // Size to bytes conversion (Binary)
    const sizeToBytes = {
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024,
        'TB': 1024 * 1024 * 1024 * 1024
    };

    // Speed to bps conversion
    const speedToBps = {
        'Kbps': 1000,
        'Mbps': 1000 * 1000,
        'Gbps': 1000 * 1000 * 1000
    };

    /**
     * Convert file size to bits
     */
    function convertFileToBits(size, unit) {
        const bytes = size * sizeToBytes[unit];
        return bytes * CONFIG.BITS_PER_BYTE;
    }

    /**
     * Convert speed to bps
     */
    function convertSpeedToBps(speed, unit) {
        return speed * speedToBps[unit];
    }

    /**
     * Convert speed to Mbps
     */
    function convertToMbps(speed, unit) {
        const bps = convertSpeedToBps(speed, unit);
        return bps / 1000000;
    }

    /**
     * Format time in human-readable format
     */
    function formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) {
            return 'Invalid';
        }

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
        if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    }

    function calculateDownload() {
        // Validate file size
        const fileSizeValidation = validateInput(fileSizeInput.value, 0.001, 1000000);
        if (!fileSizeValidation.valid) {
            showNotification('File Size: ' + fileSizeValidation.error, 'error');
            return;
        }

        // Validate bandwidth
        const bandwidthValidation = validateInput(bandwidthInput.value, 0.001, 100000);
        if (!bandwidthValidation.valid) {
            showNotification('Bandwidth: ' + bandwidthValidation.error, 'error');
            return;
        }

        const fileSize = fileSizeValidation.value;
        const bandwidth = bandwidthValidation.value;

        try {
            setButtonLoading(calculateBtn, true);

            setTimeout(() => {
                const fileSizeInBits = convertFileToBits(fileSize, fileUnitSelect.value);
                const bandwidthInBps = convertSpeedToBps(bandwidth, speedUnitSelect.value);
                
                // Calculate time
                const timeInSeconds = fileSizeInBits / bandwidthInBps;

                // Validate result
                if (!isFinite(timeInSeconds) || timeInSeconds < 0) {
                    showNotification('Calculation resulted in invalid time', 'error');
                    setButtonLoading(calculateBtn, false);
                    return;
                }

                calculatedTimeSpan.textContent = formatTime(timeInSeconds);

                // Convert speeds
                const speedInMbps = convertToMbps(bandwidth, speedUnitSelect.value);
                const speedInMBps = speedInMbps / 8;

                convertedMbpsSpan.textContent = `${speedInMbps.toFixed(2)} Mbps`;
                convertedMBpsSpan.textContent = `${speedInMBps.toFixed(2)} MB/s`;

                resultsSection.style.display = 'block';
                showNotification('Download time calculated!', 'success');
                setButtonLoading(calculateBtn, false);
            }, 300);

        } catch (error) {
            console.error('Download calculation error:', error);
            showNotification('An error occurred during calculation', 'error');
            setButtonLoading(calculateBtn, false);
        }
    }

    calculateBtn.addEventListener('click', calculateDownload);
    
    resetBtn.addEventListener('click', () => {
        fileSizeInput.value = '';
        bandwidthInput.value = '';
        resultsSection.style.display = 'none';
        showNotification('Form reset', 'info');
    });
    
    [fileSizeInput, bandwidthInput].forEach(input => {
        input.addEventListener('keypress', e => { 
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateDownload();
            }
        });
    });

    // Continue to Part 2...
    // ══════════════════════════════════════
    //  TOOL 3: Website Bandwidth Calculator
    // ══════════════════════════════════════
    const pageSizeInput = document.getElementById('pageSize');
    const pageSizeUnitSelect = document.getElementById('pageSizeUnit');
    const pageViewsInput = document.getElementById('pageViews');
    const redundancyInput = document.getElementById('redundancy');
    const calcWebBwBtn = document.getElementById('calcWebBwBtn');
    const resetWebBwBtn = document.getElementById('resetWebBwBtn');
    const webBwResults = document.getElementById('webBwResults');

    function calculateWebBandwidth() {
        // Validate page size
        const pageSizeValidation = validateInput(pageSizeInput.value, 0.001, 1000);
        if (!pageSizeValidation.valid) {
            showNotification('Page Size: ' + pageSizeValidation.error, 'error');
            return;
        }

        // Validate page views
        const pageViewsValidation = validateInput(pageViewsInput.value, 1, 1000000000);
        if (!pageViewsValidation.valid) {
            showNotification('Page Views: ' + pageViewsValidation.error, 'error');
            return;
        }

        // Validate redundancy (fixed default to 1.5)
        const redundancyValidation = validateInput(redundancyInput.value || '1.5', 1, 10);
        if (!redundancyValidation.valid) {
            showNotification('Redundancy: ' + redundancyValidation.error, 'error');
            return;
        }

        const pageSize = pageSizeValidation.value;
        const pageViews = pageViewsValidation.value;
        const redundancy = redundancyValidation.value;

        try {
            setButtonLoading(calcWebBwBtn, true);

            setTimeout(() => {
                // Convert page size to MB
                let pageSizeMB = pageSize;
                if (pageSizeUnitSelect.value === 'KB') {
                    pageSizeMB = pageSize / 1024;
                }

                // Monthly bandwidth in GB
                const monthlyGB = (pageSizeMB * pageViews * redundancy) / 1024;
                const dailyGB = monthlyGB / CONFIG.DAYS_PER_MONTH;

                // Average required speed (evenly distributed)
                const avgRequiredMbps = (monthlyGB * 1024 * 8) / (CONFIG.DAYS_PER_MONTH * CONFIG.SECONDS_PER_DAY);

                // Peak speed (assuming 10x traffic during busy hours)
                const peakRequiredMbps = avgRequiredMbps * CONFIG.PEAK_TRAFFIC_MULTIPLIER;

                // Format and display results
                document.getElementById('monthlyBandwidth').textContent = monthlyGB >= 1000
                    ? `${(monthlyGB / 1024).toFixed(2)} TB`
                    : `${monthlyGB.toFixed(2)} GB`;
                
                document.getElementById('dailyBandwidth').textContent = dailyGB >= 1
                    ? `${dailyGB.toFixed(2)} GB`
                    : `${(dailyGB * 1024).toFixed(2)} MB`;
                
                document.getElementById('avgSpeed').textContent = formatSpeed(avgRequiredMbps * 1000000);
                
                document.getElementById('peakSpeed').textContent = peakRequiredMbps >= 1000
                    ? `${(peakRequiredMbps / 1000).toFixed(2)} Gbps`
                    : `${peakRequiredMbps.toFixed(2)} Mbps`;

                webBwResults.style.display = 'block';
                showNotification('Website bandwidth calculated!', 'success');
                setButtonLoading(calcWebBwBtn, false);
            }, 300);

        } catch (error) {
            console.error('Website bandwidth calculation error:', error);
            showNotification('An error occurred during calculation', 'error');
            setButtonLoading(calcWebBwBtn, false);
        }
    }

    calcWebBwBtn.addEventListener('click', calculateWebBandwidth);
    
    resetWebBwBtn.addEventListener('click', () => {
        pageSizeInput.value = '';
        pageViewsInput.value = '';
        redundancyInput.value = '1.5';
        webBwResults.style.display = 'none';
        showNotification('Form reset', 'info');
    });
    
    [pageSizeInput, pageViewsInput, redundancyInput].forEach(input => {
        input.addEventListener('keypress', e => { 
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateWebBandwidth();
            }
        });
    });

    // ══════════════════════════════════════
    //  TOOL 4: Hosting Bandwidth Converter
    // ══════════════════════════════════════
    const monthlyTransferInput = document.getElementById('monthlyTransfer');
    const transferUnitSelect = document.getElementById('transferUnit');
    const calcHostBtn = document.getElementById('calcHostBtn');
    const resetHostBtn = document.getElementById('resetHostBtn');
    const hostResults = document.getElementById('hostResults');

    function calculateHosting() {
        // Validate monthly transfer
        const transferValidation = validateInput(monthlyTransferInput.value, 0.001, 1000000);
        if (!transferValidation.valid) {
            showNotification('Monthly Transfer: ' + transferValidation.error, 'error');
            return;
        }

        const transfer = transferValidation.value;

        try {
            setButtonLoading(calcHostBtn, true);

            setTimeout(() => {
                // Convert to GB
                let transferGB = transfer;
                if (transferUnitSelect.value === 'TB') {
                    transferGB = transfer * 1024;
                }

                const secondsInMonth = CONFIG.DAYS_PER_MONTH * 24 * 3600;

                // Total bits transferred in the month
                const totalBits = transferGB * 1024 * 1024 * 1024 * CONFIG.BITS_PER_BYTE;

                // Check for overflow
                if (!isFinite(totalBits)) {
                    showNotification('Transfer value is too large', 'error');
                    setButtonLoading(calcHostBtn, false);
                    return;
                }

                // Average bitrate in Mbps
                const avgBitrate = totalBits / secondsInMonth / 1e6;
                const dailyTransfer = transferGB / CONFIG.DAYS_PER_MONTH;
                const sustainedMBps = avgBitrate / CONFIG.BITS_PER_BYTE;

                // Format and display results
                document.getElementById('avgBitrate').textContent = avgBitrate >= 1000
                    ? `${(avgBitrate / 1000).toFixed(2)} Gbps`
                    : `${avgBitrate.toFixed(2)} Mbps`;
                
                document.getElementById('dailyTransfer').textContent = dailyTransfer >= 1
                    ? `${dailyTransfer.toFixed(2)} GB/day`
                    : `${(dailyTransfer * 1024).toFixed(2)} MB/day`;
                
                document.getElementById('sustainedSpeed').textContent = sustainedMBps >= 1
                    ? `${sustainedMBps.toFixed(2)} MB/s`
                    : `${(sustainedMBps * 1024).toFixed(2)} KB/s`;

                hostResults.style.display = 'block';
                showNotification('Hosting bandwidth calculated!', 'success');
                setButtonLoading(calcHostBtn, false);
            }, 300);

        } catch (error) {
            console.error('Hosting calculation error:', error);
            showNotification('An error occurred during calculation', 'error');
            setButtonLoading(calcHostBtn, false);
        }
    }

    calcHostBtn.addEventListener('click', calculateHosting);
    
    resetHostBtn.addEventListener('click', () => {
        monthlyTransferInput.value = '';
        hostResults.style.display = 'none';
        showNotification('Form reset', 'info');
    });
    
    monthlyTransferInput.addEventListener('keypress', e => { 
        if (e.key === 'Enter') {
            e.preventDefault();
            calculateHosting();
        }
    });

    // ══════════════════════════════════════
    //  TOOLTIP FUNCTIONALITY
    // ══════════════════════════════════════
    document.querySelectorAll('.tooltip-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            const tooltip = icon.getAttribute('data-tooltip');
            if (tooltip) {
                showNotification(tooltip, 'info');
            }
        });

        // Keyboard accessibility
        icon.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tooltip = icon.getAttribute('data-tooltip');
                if (tooltip) {
                    showNotification(tooltip, 'info');
                }
            }
        });
    });

    // ══════════════════════════════════════
    //  INITIALIZATION
    // ══════════════════════════════════════
    console.log('Bandwidth Calculator v2.0 - All systems operational');
    
    // Show welcome notification (optional)
    // setTimeout(() => {
    //     showNotification('Welcome! Select a calculator from the tabs above.', 'info');
    // }, 500);

});
