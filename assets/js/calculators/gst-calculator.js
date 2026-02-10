/* gst-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Inputs
            const amountInput = document.getElementById('amount');
            const gstRateInput = document.getElementById('gstRate');
            const calculateBtn = document.getElementById('calculateBtn');

            // Selectors
            const modeCards = document.querySelectorAll('.mode-card');
            const percentBtns = document.querySelectorAll('.percent-btn');

            // Outputs
            const resultContainer = document.getElementById('resultContainer');
            const netDisplay = document.getElementById('netAmount');
            const gstDisplay = document.getElementById('gstAmount');
            const totalDisplay = document.getElementById('totalAmount');

            // Search Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            let currentMode = 'exclusive'; // Default

            // --- 1. Mode Switcher Logic ---
            modeCards.forEach(card => {
                card.addEventListener('click', () => {
                    modeCards.forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    currentMode = card.dataset.mode;
                });
            });

            // --- 2. Percentage Button Logic ---
            percentBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    // Remove active from all
                    percentBtns.forEach(b => b.classList.remove('active'));
                    // Add to clicked
                    btn.classList.add('active');
                    // Update input field
                    gstRateInput.value = btn.dataset.rate;
                });
            });

            // Listener to clear button highlight if user types custom rate
            gstRateInput.addEventListener('input', () => {
                percentBtns.forEach(b => b.classList.remove('active'));
            });

            // --- 3. Format Number ---
            const formatMoney = (num) => {
                return new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }).format(num);
            };

            // --- 4. Calculation Logic ---
            calculateBtn.addEventListener('click', () => {
                const amount = parseFloat(amountInput.value);
                const rate = parseFloat(gstRateInput.value);

                if (isNaN(amount) || isNaN(rate) || amount < 0 || rate < 0) {
                    alert('Please enter valid positive numbers.');
                    return;
                }

                let netAmount, gstAmount, totalAmount;

                if (currentMode === 'exclusive') {
                    // Mode: Add GST
                    // Logic: Total = Base + (Base * Rate / 100)
                    netAmount = amount;
                    gstAmount = (amount * rate) / 100;
                    totalAmount = amount + gstAmount;
                } else {
                    // Mode: Remove GST (Inclusive)
                    // Logic: Base = Total / (1 + Rate/100)
                    totalAmount = amount;
                    netAmount = amount / (1 + (rate / 100));
                    gstAmount = totalAmount - netAmount;
                }

                // Display Results
                netDisplay.textContent = formatMoney(netAmount);
                gstDisplay.textContent = formatMoney(gstAmount);
                totalDisplay.textContent = formatMoney(totalAmount);

                resultContainer.style.display = 'block';

                // Scroll on mobile
                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });