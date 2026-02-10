/* income-tax-calculator - Final Verified 2026 Model
   Aligned with Tax Foundation 2026 brackets
   Includes earners logic + auto hide
*/

document.addEventListener('DOMContentLoaded', () => {

    const calculateBtn = document.getElementById('calculateBtn');
    const annualIncome = document.getElementById('annualIncome');
    const filingStatus = document.getElementById('filingStatus');
    const stateSelect = document.getElementById('state');
    const deductions = document.getElementById('deductions');
    const earnersInput = document.getElementById('earners');
    const earnersWrapper = document.getElementById('earnersWrapper');

    const resultContainer = document.getElementById('resultContainer');
    const netPayEl = document.getElementById('netPay');
    const grossDisplay = document.getElementById('grossDisplay');
    const taxableDisplay = document.getElementById('taxableDisplay');
    const fedTaxEl = document.getElementById('fedTax');
    const ficaTaxEl = document.getElementById('ficaTax');
    const stateTaxEl = document.getElementById('stateTax');
    const totalTaxEl = document.getElementById('totalTax');
    const effectiveRateEl = document.getElementById('effectiveRate');
    const taxChart = document.getElementById('taxChart');

    // Guard clause - exit early if critical elements are missing
    if (!calculateBtn || !annualIncome) {
        console.error('Income Tax Calculator: Critical elements not found');
        return;
    }

    /* 2026 Federal Tax Brackets – Tax Foundation */
    const taxBrackets = {
        single: [
            { limit: 12400, rate: 0.10 },
            { limit: 50400, rate: 0.12 },
            { limit: 105700, rate: 0.22 },
            { limit: 201775, rate: 0.24 },
            { limit: 256225, rate: 0.32 },
            { limit: 640600, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
        ],
        married: [
            { limit: 24800, rate: 0.10 },
            { limit: 100800, rate: 0.12 },
            { limit: 211400, rate: 0.22 },
            { limit: 403550, rate: 0.24 },
            { limit: 512450, rate: 0.32 },
            { limit: 768600, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
        ],
        head: [
            { limit: 17700, rate: 0.10 },
            { limit: 67450, rate: 0.12 },
            { limit: 105700, rate: 0.22 },
            { limit: 201775, rate: 0.24 },
            { limit: 256200, rate: 0.32 },
            { limit: 640600, rate: 0.35 },
            { limit: Infinity, rate: 0.37 }
        ]
    };

    /* 2026 Standard Deductions */
    const standardDeductions = {
        single: 16100,
        married: 32200,
        head: 24150
    };

    /* 2026 Social Security Wage Base */
    const ssCap = 184500;

    const formatMoney = n =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(n || 0);

    function calculateFederalTax(taxableIncome, status) {
        let tax = 0;
        let prev = 0;

        for (const b of taxBrackets[status]) {
            const amount = Math.min(taxableIncome, b.limit) - prev;
            if (amount > 0) tax += amount * b.rate;
            if (taxableIncome <= b.limit) break;
            prev = b.limit;
        }
        return tax;
    }

    /* 2026 State Tax Estimates (Simplified) */
    /* Based on enacted 2026 legislation and 2025 extrapolations */
    const stateTaxRates = {
        NONE: ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'],
        FLAT: {
            AZ: 0.025,
            CO: 0.0425,
            GA: 0.0509, // 2026 Scheduled
            ID: 0.05695,
            IL: 0.0495,
            IN: 0.0295, // 2026 Scheduled
            IA: 0.039,  // 2026 Flat
            KY: 0.035,  // 2026 Scheduled
            MI: 0.0425,
            MS: 0.04,   // 2026 Scheduled
            NC: 0.0399, // 2026 Scheduled
            OH: 0.0275, // 2026 Scheduled
            PA: 0.0307,
            UT: 0.0455
        },
        BRACKETS: {
            AL: [[500, 0.02], [3000, 0.04], [Infinity, 0.05]],
            AR: [[5000, 0.02], [10000, 0.03], [Infinity, 0.039]],
            CA: [[10412, 0.01], [24684, 0.02], [38959, 0.04], [54081, 0.06], [68350, 0.08], [349137, 0.093], [418961, 0.103], [698271, 0.113], [Infinity, 0.123]],
            CT: [[10000, 0.03], [50000, 0.05], [Infinity, 0.0699]],
            DE: [[2000, 0], [5000, 0.022], [10000, 0.039], [20000, 0.048], [25000, 0.052], [60000, 0.0555], [Infinity, 0.066]],
            DC: [[10000, 0.04], [40000, 0.06], [60000, 0.065], [250000, 0.085], [500000, 0.0925], [Infinity, 0.1075]],
            HI: [[2400, 0.014], [4800, 0.032], [9600, 0.055], [14400, 0.064], [19200, 0.068], [24000, 0.072], [36000, 0.076], [48000, 0.079], [Infinity, 0.0825]],
            KS: [[15000, 0.031], [30000, 0.0525], [Infinity, 0.057]], // Est
            LA: [[12500, 0.0185], [50000, 0.035], [Infinity, 0.0425]],
            ME: [[26050, 0.058], [61600, 0.0675], [Infinity, 0.0715]],
            MD: [[1000, 0.02], [2000, 0.03], [3000, 0.04], [100000, 0.0475], [125000, 0.05], [150000, 0.0525], [250000, 0.055], [Infinity, 0.0575]],
            MA: [[Infinity, 0.05]], // Flat 5% base
            MN: [[30070, 0.0535], [98760, 0.068], [183340, 0.0785], [Infinity, 0.0985]],
            MO: [[1000, 0.02], [9000, 0.04], [Infinity, 0.047]], // Est 2026
            MT: [[Infinity, 0.0565]], // 2026 Top Rate Simplified
            NE: [[Infinity, 0.0455]], // 2026 Target
            NJ: [[20000, 0.014], [35000, 0.0175], [40000, 0.035], [75000, 0.05525], [500000, 0.0637], [Infinity, 0.0897]],
            NM: [[5500, 0.017], [11000, 0.032], [16000, 0.047], [Infinity, 0.049]], // Reduced top
            NY: [[8500, 0.04], [11700, 0.045], [13900, 0.0525], [80650, 0.055], [215400, 0.06], [Infinity, 0.0685]], // Simplified middle
            ND: [[44725, 0.011], [Infinity, 0.0204]], // Est
            OK: [[Infinity, 0.045]], // 2026 Target
            OR: [[4050, 0.0475], [10200, 0.0675], [125000, 0.0875], [Infinity, 0.099]],
            RI: [[74400, 0.0375], [169050, 0.0475], [Infinity, 0.0599]],
            SC: [[Infinity, 0.064]], // Simplified top
            VT: [[45400, 0.0335], [110050, 0.066], [229550, 0.076], [Infinity, 0.0875]],
            VA: [[3000, 0.02], [5000, 0.03], [17000, 0.05], [Infinity, 0.0575]],
            WV: [[10000, 0.0236], [25000, 0.0315], [40000, 0.0354], [60000, 0.0512], [Infinity, 0.065]],
            WI: [[14320, 0.035], [28640, 0.044], [315310, 0.053], [Infinity, 0.0765]]
        }
    };

    function calculateStateTax(income, state, status) {
        if (!state || state === 'none' || stateTaxRates.NONE.includes(state)) return 0;

        // Handle Flat Tax
        if (stateTaxRates.FLAT[state]) {
            return income * stateTaxRates.FLAT[state];
        }

        // Handle Brackets
        const brackets = stateTaxRates.BRACKETS[state];
        if (!brackets) return 0;

        // Simple doubling of brackets for married filing jointly (standard for many states)
        // Some states (like NY, CA) have specific married tables, but doubling is the standard "estimator" approximation
        let adjustedBrackets = brackets;
        if (status === 'married') {
            // Deep copy and double specific limits (simplified)
            // Note: Many states simply double the widths.
            if (['AL', 'AZ', 'CA', 'CT', 'HI', 'ID', 'KS', 'LA', 'ME', 'NE', 'NM', 'NY', 'OK', 'OR', 'RI', 'UT', 'VT'].includes(state)) {
                adjustedBrackets = brackets.map(b => [b[0] === Infinity ? Infinity : b[0] * 2, b[1]]);
            }
        }

        let tax = 0;
        let prev = 0;
        for (const b of adjustedBrackets) {
            const limit = b[0];
            const rate = b[1];
            const amount = Math.min(income, limit) - prev;
            if (amount > 0) tax += amount * rate;
            if (income <= limit) break;
            prev = limit;
        }
        return tax;
    }

    function toggleEarnersVisibility() {
        if (filingStatus.value === 'married') {
            earnersWrapper.style.display = 'block';
        } else {
            earnersWrapper.style.display = 'none';
            earnersInput.value = '1';
        }
    }

    toggleEarnersVisibility();
    filingStatus.addEventListener('change', toggleEarnersVisibility);

    // Helper to show validation error with visual feedback
    function showValidationError(message) {
        annualIncome.style.borderColor = '#ef4444';
        annualIncome.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.2)';
        annualIncome.classList.add('shake');

        // Remove existing error message if any
        const existingError = annualIncome.parentElement.querySelector('.validation-error');
        if (existingError) existingError.remove();

        // Add error message
        const errorEl = document.createElement('div');
        errorEl.className = 'validation-error';
        errorEl.style.cssText = 'color: #ef4444; font-size: 0.85rem; margin-top: 5px; font-weight: 500;';
        errorEl.textContent = message;
        annualIncome.parentElement.appendChild(errorEl);

        // Focus the input
        annualIncome.focus();

        // Remove shake animation after it completes
        setTimeout(() => {
            annualIncome.classList.remove('shake');
        }, 500);
    }

    // Clear validation error when user starts typing
    annualIncome.addEventListener('input', () => {
        annualIncome.style.borderColor = '';
        annualIncome.style.boxShadow = '';
        const existingError = annualIncome.parentElement.querySelector('.validation-error');
        if (existingError) existingError.remove();
    });

    // Main calculation function
    function performCalculation() {
        const income = parseFloat(annualIncome.value);

        // Validation with user feedback
        if (!annualIncome.value.trim()) {
            showValidationError('Please enter your annual income');
            return;
        }

        if (isNaN(income) || income <= 0) {
            showValidationError('Please enter a valid income amount greater than 0');
            return;
        }

        const status = filingStatus.value;
        const state = stateSelect.value;
        const useDeduction = deductions.checked;
        const earners = parseInt(earnersInput.value || 1, 10);

        const deductionAmount = useDeduction ? standardDeductions[status] : 0;
        const taxableIncome = Math.max(0, income - deductionAmount);

        const fedTax = calculateFederalTax(taxableIncome, status);

        const incomePerEarner = income / earners;
        let socialSecurity = 0;
        let medicare = 0;
        let additionalMedicare = 0;

        for (let i = 0; i < earners; i++) {
            socialSecurity += Math.min(incomePerEarner, ssCap) * 0.062;
            medicare += incomePerEarner * 0.0145;

            const addMedThreshold =
                status === 'married' ? 250000 / earners : 200000;

            if (incomePerEarner > addMedThreshold) {
                additionalMedicare +=
                    (incomePerEarner - addMedThreshold) * 0.009;
            }
        }

        const ficaTax = socialSecurity + medicare + additionalMedicare;

        const stateTax = calculateStateTax(taxableIncome, state, status);

        const totalTax = fedTax + ficaTax + stateTax;
        const netPay = income - totalTax;
        const effectiveRate = (totalTax / income) * 100;

        grossDisplay.textContent = formatMoney(income);
        // Update new Standard Deduction field
        const dedEl = document.getElementById('deductionDisplay');
        if (dedEl) dedEl.textContent = formatMoney(deductionAmount);

        taxableDisplay.textContent = formatMoney(taxableIncome);
        fedTaxEl.textContent = formatMoney(fedTax);

        // Update separate FICA fields
        const ssEl = document.getElementById('ssTax');
        const medEl = document.getElementById('medTax');
        const ssLabel = document.getElementById('ssLabel');
        const medLabel = document.getElementById('medLabel');

        if (ssEl) ssEl.textContent = formatMoney(socialSecurity);
        if (medEl) medEl.textContent = formatMoney(medicare + additionalMedicare);

        // Dynamic Label Update for Earners
        if (ssLabel && medLabel) {
            const suffix = earners > 1 ? ' (Combined)' : '';
            ssLabel.textContent = `Social Security${suffix}`;
            medLabel.textContent = `Medicare${suffix}`;
        }

        stateTaxEl.textContent = formatMoney(stateTax);
        totalTaxEl.textContent = formatMoney(totalTax);
        netPayEl.textContent = formatMoney(netPay);
        effectiveRateEl.textContent = effectiveRate.toFixed(1) + '%';

        const fedPct = (fedTax / income) * 100;
        const statePct = (stateTax / income) * 100;
        const ficaPct = (ficaTax / income) * 100; // Total FICA pct for chart

        // Individual Percentages for Display
        const ssPct = (socialSecurity / income) * 100;
        const medPct = ((medicare + additionalMedicare) / income) * 100;

        taxChart.style.setProperty('--fed', `${fedPct}%`);
        taxChart.style.setProperty('--state', `${fedPct + statePct}%`);
        taxChart.style.setProperty('--fica', `${fedPct + statePct + ficaPct}%`);

        // Update Percentage Displays
        const fedPctEl = document.getElementById('fedPctDisplay');
        const ssPctEl = document.getElementById('ssPctDisplay');
        const medPctEl = document.getElementById('medPctDisplay');
        const statePctEl = document.getElementById('statePctDisplay');

        if (fedPctEl) fedPctEl.textContent = `(${fedPct.toFixed(2)}%)`;
        if (ssPctEl) ssPctEl.textContent = `(${ssPct.toFixed(2)}%)`;
        if (medPctEl) medPctEl.textContent = `(${medPct.toFixed(2)}%)`;
        if (statePctEl) statePctEl.textContent = `(${statePct.toFixed(2)}%)`;

        resultContainer.style.display = 'block';

        // Scroll results into view smoothly
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Button click handler
    calculateBtn.addEventListener('click', performCalculation);

    // Enter key support for income input
    annualIncome.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performCalculation();
        }
    });
});
