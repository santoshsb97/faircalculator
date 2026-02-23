/* nz-gst-calculator.js – New Zealand 15% GST, IRD Compliant */

document.addEventListener('DOMContentLoaded', () => {
    // ---- Inputs ----
    const amountInput = document.getElementById('amount');
    const gstRateInput = document.getElementById('gstRate');
    const modeSelect = document.getElementById('mode');
    const calculateBtn = document.getElementById('calculateBtn');

    // ---- Output displays ----
    const netDisplay = document.getElementById('netAmount');
    const gstDisplay = document.getElementById('gstAmount');
    const totalDisplay = document.getElementById('totalAmount');

    // ---- Search bar: redirect to home with query instead of hiding page content ----
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.value.trim().length > 0) {
                window.location.href = '../../index.html?q=' + encodeURIComponent(e.target.value.trim());
            }
        });
    }

    /**
     * Format a number as NZD currency (e.g. $1,234.56).
     * @param {number} num
     * @returns {string}
     */
    const formatMoney = (num) =>
        new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: 'NZD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);

    /**
     * Perform the GST calculation and update the UI.
     */
    function calculateGST() {
        const amount = parseFloat(amountInput.value);
        const rate = parseFloat(gstRateInput.value);
        const mode = modeSelect.value;

        // Validate inputs
        if (isNaN(amount) || isNaN(rate) || amount < 0 || rate < 0) return;

        let netAmount, gstAmount, totalAmount;

        if (mode === 'exclusive') {
            // Add GST: input is the net (ex-GST) price
            netAmount = amount;
            gstAmount = (amount * rate) / 100;
            totalAmount = amount + gstAmount;
        } else {
            // Remove GST: input is the GST-inclusive total
            totalAmount = amount;
            netAmount = amount / (1 + rate / 100);
            gstAmount = totalAmount - netAmount;
        }

        // Update displayed values
        netDisplay.textContent = formatMoney(netAmount);
        gstDisplay.textContent = formatMoney(gstAmount);
        totalDisplay.textContent = formatMoney(totalAmount);

        // Update the "GST (x%)" label dynamically
        const gstLabel = gstDisplay.nextElementSibling;
        if (gstLabel) gstLabel.textContent = `GST (${rate}%)`;

        // Smooth scroll to results on smaller screens
        if (window.innerWidth < 768) {
            netDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // ---- Event listeners ----
    calculateBtn.addEventListener('click', calculateGST);

    // Real-time updates as user types or changes fields
    amountInput.addEventListener('input', calculateGST);
    gstRateInput.addEventListener('input', calculateGST);
    modeSelect.addEventListener('change', calculateGST);

    // Run once on load with default values
    calculateGST();

    // ---- FAQ Accordion (with chevron icon flip) ----
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Close all items and reset all icons to chevron-down
            faqItems.forEach(i => {
                i.classList.remove('active');
                const icon = i.querySelector('.faq-question i');
                if (icon) { icon.classList.remove('fa-chevron-up'); icon.classList.add('fa-chevron-down'); }
            });
            // If it wasn't already open, open it and flip its icon
            if (!isActive) {
                item.classList.add('active');
                const icon = question.querySelector('i');
                if (icon) { icon.classList.remove('fa-chevron-down'); icon.classList.add('fa-chevron-up'); }
            }
        });
    });
});
