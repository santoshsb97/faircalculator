/* India GST Calculator - Redesigned Visual Edition 2026 */

document.addEventListener('DOMContentLoaded', () => {
    // Inputs
    const amountInput = document.getElementById('amount');
    const gstRateSelect = document.getElementById('gstRate');
    const modeSelect = document.getElementById('mode');
    const calculateBtn = document.getElementById('calculateBtn');

    // Result Containers (Visual Cards)
    const netDisplay = document.getElementById('netAmount');
    const gstDisplay = document.getElementById('gstAmount');
    const totalDisplay = document.getElementById('totalAmount');

    // Optional Breakdown
    const taxBreakdownSection = document.getElementById('taxBreakdownSection');
    const taxBreakdownGrid = document.getElementById('taxBreakdownGrid');
    const taxBreakdownInfo = document.getElementById('taxBreakdownInfo');

    // --- 1. Utils ---

    const formatRupee = (num) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0, // Mockup shows whole numbers for 0, but let's keep it flexible
            maximumFractionDigits: 2
        }).format(num).replace('INR', '₹').trim();
    };

    // --- 2. Calculation Engine ---

    const calculateGST = () => {
        const amount = parseFloat(amountInput.value) || 0;
        const rate = parseFloat(gstRateSelect.value) || 0;
        const currentMode = modeSelect.value;

        let baseAmount, gstTotal, finalTotal;

        if (currentMode === 'exclusive') {
            // Formula: Selling Price + GST
            baseAmount = amount;
            gstTotal = (amount * rate) / 100;
            finalTotal = amount + gstTotal;
        } else {
            // Formula: Extract GST from Total Price
            finalTotal = amount;
            baseAmount = amount / (1 + (rate / 100));
            gstTotal = finalTotal - baseAmount;
        }

        // --- 3. Update Visual UI ---
        netDisplay.textContent = formatRupee(baseAmount);
        gstDisplay.textContent = formatRupee(gstTotal);
        totalDisplay.textContent = formatRupee(finalTotal);

        // Update Indian Split logic (Hidden by default in new UI but logic remains)
        if (taxBreakdownGrid) {
            const cgst = gstTotal / 2;
            const sgst = gstTotal / 2;
            const splitRate = rate / 2;

            taxBreakdownInfo.textContent = `Intra-state: CGST (${splitRate}%) + SGST (${splitRate}%)`;

            taxBreakdownGrid.innerHTML = `
                <div class="breakdown-item" style="padding: 10px; background: #fff; border-radius: 6px; text-align: center;">
                    <div style="font-size: 0.8rem; color: #64748b;">CGST</div>
                    <div style="font-weight: 700;">${formatRupee(cgst)}</div>
                </div>
                <div class="breakdown-item" style="padding: 10px; background: #fff; border-radius: 6px; text-align: center;">
                    <div style="font-size: 0.8rem; color: #64748b;">SGST</div>
                    <div style="font-weight: 700;">${formatRupee(sgst)}</div>
                </div>
            `;
        }
    };

    // --- 3. Event Listeners ---

    // Real-time calculation
    amountInput.addEventListener('input', calculateGST);
    gstRateSelect.addEventListener('change', calculateGST);
    modeSelect.addEventListener('change', calculateGST);

    // Button trigger (and breakdown toggle)
    calculateBtn.addEventListener('click', () => {
        calculateGST();
        if (taxBreakdownSection) taxBreakdownSection.style.display = 'block';

        // Scroll to results if needed
        if (window.innerWidth < 768) {
            document.getElementById('totalAmount').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Initial run
    calculateGST();

});
