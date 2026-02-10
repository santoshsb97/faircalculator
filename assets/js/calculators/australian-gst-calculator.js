/* australian-gst-calculator.js - Australian Optimized Version */

document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const amountInput = document.getElementById('amount');
    const gstRateInput = document.getElementById('gstRate');
    const calculateBtn = document.getElementById('calculateBtn');

    // Outputs
    const resultContainer = document.getElementById('resultContainer');
    const netDisplay = document.getElementById('netAmount');
    const gstDisplay = document.getElementById('gstAmount');
    const totalDisplay = document.getElementById('totalAmount');
    const modeSelect = document.getElementById('mode');

    // Search Logic
    const searchInput = document.getElementById('searchInput');
    const toolContainer = document.getElementById('tool-container');
    if (searchInput && toolContainer) {
        searchInput.addEventListener('input', (e) => {
            toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
        });
    }

    /**
     * Format Number as AUD
     */
    const formatMoney = (num) => {
        return new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
    };

    /**
     * Perform calculation
     */
    function calculateGST() {
        const amount = parseFloat(amountInput.value);
        const rate = parseFloat(gstRateInput.value);
        const mode = modeSelect.value;

        if (isNaN(amount) || isNaN(rate) || amount < 0 || rate < 0) {
            return;
        }

        let netAmount, gstAmount, totalAmount;

        if (mode === 'exclusive') {
            // Mode: Add GST
            netAmount = amount;
            gstAmount = (amount * rate) / 100;
            totalAmount = amount + gstAmount;
        } else {
            // Mode: Remove GST (Inclusive)
            totalAmount = amount;
            netAmount = amount / (1 + (rate / 100));
            gstAmount = totalAmount - netAmount;
        }

        // Display Results
        netDisplay.textContent = formatMoney(netAmount);
        gstDisplay.textContent = formatMoney(gstAmount);
        totalDisplay.textContent = formatMoney(totalAmount);

        // Scroll on mobile
        if (window.innerWidth < 768) {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    calculateBtn.addEventListener('click', calculateGST);

    // Initial calculation
    calculateGST();

    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active')); // Close others
            if (!isActive) item.classList.add('active'); // Toggle current
        });
    });
});
