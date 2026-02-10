/* business-days-calculator.js - Optimized Version */

document.addEventListener('DOMContentLoaded', () => {
    // Constants
    const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
    const MAX_DATE_RANGE_DAYS = 3650; // 10 years
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // DOM Elements
    const btn = document.getElementById('calculateBtn');
    const resContainer = document.getElementById('resultContainer');
    const workDaysEl = document.getElementById('workDays');
    const totalDaysEl = document.getElementById('totalDays');
    const holidayInfoEl = document.getElementById('holidayInfo');
    const holidayListEl = document.getElementById('holidayList');
    const countrySelect = document.getElementById('country');

    const els = {
        start: {
            m: document.getElementById('startMonth'),
            d: document.getElementById('startDay'),
            y: document.getElementById('startYear')
        },
        end: {
            m: document.getElementById('endMonth'),
            d: document.getElementById('endDay'),
            y: document.getElementById('endYear')
        }
    };

    // Initialize
    populateDropdowns();
    loadFromURL();
    attachEventListeners();

    // Search Hide Logic
    const searchInput = document.getElementById('searchInput');
    const toolContainer = document.getElementById('tool-container');
    if (searchInput && toolContainer) {
        searchInput.addEventListener('input', (e) => {
            toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
        });
    }

    /**
     * Populate date dropdowns with default values
     */
    function populateDropdowns() {
        const currentYear = new Date().getFullYear();

        const addOpts = (select, start, end, selected) => {
            select.innerHTML = '';
            for (let i = start; i <= end; i++) {
                const opt = new Option(i, i);
                if (i === selected) opt.selected = true;
                select.add(opt);
            }
        };

        const addMonths = (select, selected) => {
            select.innerHTML = '';
            monthNames.forEach((m, idx) => {
                const opt = new Option(m, idx);
                if (idx === selected) opt.selected = true;
                select.add(opt);
            });
        };

        addOpts(els.start.y, currentYear - 50, currentYear + 50, currentYear);
        addOpts(els.end.y, currentYear - 50, currentYear + 50, currentYear);
        addMonths(els.start.m, new Date().getMonth());
        addMonths(els.end.m, new Date().getMonth());

        updateDays('start');
        updateDays('end');

        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        setSelects('start', today);
        setSelects('end', nextWeek);
    }

    /**
     * Update days dropdown based on selected month/year
     */
    function updateDays(type) {
        const elSet = els[type];
        const year = parseInt(elSet.y.value);
        const month = parseInt(elSet.m.value);
        const currentDay = parseInt(elSet.d.value) || 1;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        elSet.d.innerHTML = '';
        for (let i = 1; i <= daysInMonth; i++) {
            elSet.d.add(new Option(i, i));
        }
        elSet.d.value = currentDay <= daysInMonth ? currentDay : daysInMonth;
    }

    /**
     * Set date selects to a specific date
     */
    function setSelects(type, date) {
        els[type].m.value = date.getMonth();
        updateDays(type);
        els[type].d.value = date.getDate();
        els[type].y.value = date.getFullYear();
    }

    /**
     * Get Date object from selects
     */
    function getFromSelects(type) {
        return new Date(els[type].y.value, els[type].m.value, els[type].d.value);
    }

    /**
     * Check if date is a weekend
     */
    function isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday (0) or Saturday (6)
    }

    /**
     * Get nth occurrence of weekday in a month
     * @param {number} year - Year
     * @param {number} month - Month (0-indexed)
     * @param {number} dayOfWeek - Day of week (0-6)
     * @param {number} n - Which occurrence (1st, 2nd, etc.)
     */
    function getNthWeekday(year, month, dayOfWeek, n) {
        let count = 0;
        let date = new Date(year, month, 1);
        while (date.getMonth() === month) {
            if (date.getDay() === dayOfWeek) {
                count++;
                if (count === n) return date.getDate();
            }
            date.setDate(date.getDate() + 1);
        }
        return -1;
    }

    /**
     * Get last occurrence of weekday in a month
     */
    function getLastWeekday(year, month, dayOfWeek) {
        let date = new Date(year, month + 1, 0);
        while (date.getMonth() === month) {
            if (date.getDay() === dayOfWeek) return date.getDate();
            date.setDate(date.getDate() - 1);
        }
        return -1;
    }

    /**
     * Get all holidays for a specific year and country
     * @returns {Array<Date>} Array of holiday dates
     */
    function getHolidaysForYear(year, country) {
        const holidays = [];

        if (country === 'NONE') return holidays;

        if (country === 'US') {
            holidays.push(
                { date: new Date(year, 0, 1), name: "New Year's Day" },
                { date: new Date(year, 0, getNthWeekday(year, 0, 1, 3)), name: "Martin Luther King Jr. Day" },
                { date: new Date(year, 1, getNthWeekday(year, 1, 1, 3)), name: "Presidents' Day" },
                { date: new Date(year, 4, getLastWeekday(year, 4, 1)), name: "Memorial Day" },
                { date: new Date(year, 5, 19), name: "Juneteenth" },
                { date: new Date(year, 6, 4), name: "Independence Day" },
                { date: new Date(year, 8, getNthWeekday(year, 8, 1, 1)), name: "Labor Day" },
                { date: new Date(year, 9, getNthWeekday(year, 9, 1, 2)), name: "Columbus Day" },
                { date: new Date(year, 10, 11), name: "Veterans Day" },
                { date: new Date(year, 10, getNthWeekday(year, 10, 4, 4)), name: "Thanksgiving Day" },
                { date: new Date(year, 11, 25), name: "Christmas Day" }
            );
        }

        if (country === 'UK') {
            holidays.push(
                { date: new Date(year, 0, 1), name: "New Year's Day" },
                { date: new Date(year, 4, getNthWeekday(year, 4, 1, 1)), name: "Early May Bank Holiday" },
                { date: new Date(year, 4, getLastWeekday(year, 4, 1)), name: "Spring Bank Holiday" },
                { date: new Date(year, 7, getLastWeekday(year, 7, 1)), name: "Summer Bank Holiday" },
                { date: new Date(year, 11, 25), name: "Christmas Day" },
                { date: new Date(year, 11, 26), name: "Boxing Day" }
            );
        }

        if (country === 'IN') {
            holidays.push(
                { date: new Date(year, 0, 26), name: "Republic Day" },
                { date: new Date(year, 7, 15), name: "Independence Day" },
                { date: new Date(year, 9, 2), name: "Gandhi Jayanti" },
                { date: new Date(year, 11, 25), name: "Christmas Day" }
            );
        }

        if (country === 'CA') {
            holidays.push(
                { date: new Date(year, 0, 1), name: "New Year's Day" },
                { date: new Date(year, 1, getNthWeekday(year, 1, 1, 3)), name: "Family Day" },
                { date: new Date(year, 6, 1), name: "Canada Day" },
                { date: new Date(year, 8, getNthWeekday(year, 8, 1, 1)), name: "Labour Day" },
                { date: new Date(year, 9, getNthWeekday(year, 9, 1, 2)), name: "Thanksgiving Day" },
                { date: new Date(year, 10, 11), name: "Remembrance Day" },
                { date: new Date(year, 11, 25), name: "Christmas Day" },
                { date: new Date(year, 11, 26), name: "Boxing Day" }
            );

            // Victoria Day - Monday on or before May 24
            const victoriaDay = new Date(year, 4, 24);
            while (victoriaDay.getDay() !== 1) {
                victoriaDay.setDate(victoriaDay.getDate() - 1);
            }
            holidays.push({ date: victoriaDay, name: "Victoria Day" });
        }

        if (country === 'AU') {
            holidays.push(
                { date: new Date(year, 0, 1), name: "New Year's Day" },
                { date: new Date(year, 0, 26), name: "Australia Day" },
                { date: new Date(year, 3, 25), name: "Anzac Day" },
                { date: new Date(year, 5, getNthWeekday(year, 5, 1, 2)), name: "King's Birthday" },
                { date: new Date(year, 9, getNthWeekday(year, 9, 1, 1)), name: "Labour Day" },
                { date: new Date(year, 11, 25), name: "Christmas Day" },
                { date: new Date(year, 11, 26), name: "Boxing Day" }
            );
        }

        return holidays;
    }

    /**
     * Get all holidays in date range (optimized - pre-calculated)
     * @returns {Set<string>} Set of holiday date strings
     */
    function getHolidaysInRange(start, end, country) {
        const holidaysInRange = [];
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();

        for (let year = startYear; year <= endYear; year++) {
            const yearHolidays = getHolidaysForYear(year, country);
            yearHolidays.forEach(h => {
                if (h.date >= start && h.date < end && !isWeekend(h.date)) {
                    holidaysInRange.push({
                        dateString: h.date.toDateString(),
                        formattedDate: h.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
                        name: h.name
                    });
                }
            });
        }

        return holidaysInRange;
    }

    /**
     * Show custom error message
     */
    function showMessage(message, type = 'error') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-${type}`;
        messageDiv.style.cssText = type === 'error'
            ? 'background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; color: #991b1b; margin: 15px 0; font-weight: 500;'
            : 'background: #fef3c7; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; color: #92400e; margin: 15px 0; font-weight: 500;';
        messageDiv.innerHTML = `<i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;

        const form = document.getElementById('businessForm');
        const existingMessage = form.querySelector(`.message-${type}`);
        if (existingMessage) existingMessage.remove();

        form.insertAdjacentElement('afterend', messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    }

    /**
     * Update URL with current parameters (for sharing)
     */
    function updateURL(start, end, country) {
        const url = new URL(window.location);
        url.searchParams.set('start', start.toISOString().split('T')[0]);
        url.searchParams.set('end', end.toISOString().split('T')[0]);
        url.searchParams.set('country', country);
        window.history.replaceState({}, '', url);
    }

    /**
     * Load calculation from URL parameters
     */
    function loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('start') && params.has('end')) {
            const start = new Date(params.get('start') + 'T00:00:00');
            const end = new Date(params.get('end') + 'T00:00:00');

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                setSelects('start', start);
                setSelects('end', end);

                if (params.has('country')) {
                    const country = params.get('country');
                    if (['US', 'UK', 'CA', 'AU', 'IN', 'NONE'].includes(country)) {
                        countrySelect.value = country;
                    }
                }

                // Auto-calculate if valid URL params
                setTimeout(() => calculateBusinessDays(), 100);
            }
        }
    }

    /**
     * Track calculation in analytics
     */
    function trackCalculation(count, country, daysDiff) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'calculate_business_days', {
                'event_category': 'Calculator',
                'event_label': `${country}: ${count} business days`,
                'value': count,
                'date_range_days': Math.round(daysDiff)
            });
        }
    }

    /**
     * Main calculation function - OPTIMIZED
     */
    function calculateBusinessDays() {
        const d1 = getFromSelects('start');
        const d2 = getFromSelects('end');
        const country = countrySelect.value;

        // Validation
        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            showMessage('Please enter valid dates', 'error');
            return;
        }

        // Determine order
        const start = d1 < d2 ? d1 : d2;
        const end = d1 < d2 ? d2 : d1;

        // Warn if dates were swapped
        if (d1 > d2) {
            showMessage('Start date is after end date. Dates have been swapped for calculation.', 'warning');
        }

        const daysDiff = (end - start) / MILLISECONDS_PER_DAY;
        const totalDays = Math.round(daysDiff);

        // Warn if range is very large
        if (daysDiff > MAX_DATE_RANGE_DAYS) {
            showMessage(`Date range exceeds ${MAX_DATE_RANGE_DAYS} days (${Math.round(MAX_DATE_RANGE_DAYS / 365)} years). Calculation may take a moment...`, 'warning');
        }

        // Show loading state
        btn.disabled = true;
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';

        // Use setTimeout to allow UI to update
        setTimeout(() => {
            try {
                // OPTIMIZED: Pre-calculate all holidays in range
                const holidaysInRange = getHolidaysInRange(start, end, country);
                const holidayDateStrings = new Set(holidaysInRange.map(h => h.dateString));

                let count = 0;
                let current = new Date(start);

                // Count business days
                while (current < end) {
                    if (!isWeekend(current) && !holidayDateStrings.has(current.toDateString())) {
                        count++;
                    }
                    current.setDate(current.getDate() + 1);
                }

                // Update results
                workDaysEl.textContent = count;
                holidayInfoEl.textContent = `Holidays Excluded: ${holidaysInRange.length}`;

                // Render holiday list
                if (holidaysInRange.length > 0) {
                    holidayListEl.innerHTML = holidaysInRange.map(h => `
                        <div class="holiday-item">
                            <span class="holiday-date">${h.formattedDate}</span>
                            <span class="holiday-name">${h.name}</span>
                        </div>
                    `).join('');
                    holidayListEl.style.display = 'block';
                } else {
                    holidayListEl.style.display = 'none';
                }

                totalDaysEl.textContent = `Total Calendar Days: ${totalDays}`;

                // Show results with animation
                resContainer.style.display = 'block';
                resContainer.setAttribute('aria-label', `Calculation complete: ${count} business days between ${start.toDateString()} and ${end.toDateString()}`);

                // Update URL for sharing
                updateURL(start, end, country);

                // Track in analytics
                trackCalculation(count, country, daysDiff);

                // Scroll on mobile
                if (window.innerWidth < 768) {
                    resContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }

            } catch (error) {
                console.error('Calculation error:', error);
                showMessage('An error occurred during calculation. Please try again.', 'error');
            } finally {
                // Reset button
                btn.disabled = false;
                btn.innerHTML = originalBtnText;
            }
        }, 10);
    }

    /**
     * Attach all event listeners
     */
    function attachEventListeners() {
        els.start.m.addEventListener('change', () => updateDays('start'));
        els.start.y.addEventListener('change', () => updateDays('start'));
        els.end.m.addEventListener('change', () => updateDays('end'));
        els.end.y.addEventListener('change', () => updateDays('end'));
        btn.addEventListener('click', calculateBusinessDays);

        // Allow Enter key to calculate
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    calculateBusinessDays();
                }
            });
        });
    }
});