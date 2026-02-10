function calculateAustralianTax(income, year, residency, monthsResided = 12) {
    // 1. Validate Input
    if (income < 0) return { incomeTax: 0, medicareLevy: 0, totalTax: 0, netIncome: 0 };

    // 2. Get Data for Year
    const yearData = australianTaxData[year];
    if (!yearData) {
        console.error("Year data not found for:", year);
        return null;
    }

    // 3. Get Brackets based on Residency
    // If Part-Year, we start with 'resident' brackets but modify the first bracket (tax-free threshold)
    let brackets = [];
    if (residency === 'resident' || residency === 'part_year') {
        // Clone to avoid mutating original data
        brackets = JSON.parse(JSON.stringify(yearData.resident));

        // Adjust Tax-Free Threshold if Part-Year
        if (residency === 'part_year') {
            // Formula: $13,464 + ($4,736 * months / 12)
            // But this formula (from ATO) assumes a standard tax-free threshold of $18,200 ($13,464 + $4,736).
            // This applies from 2012-13 onwards.
            // Before that, the threshold was $6,000.
            // Logic: Calculate the new threshold, then replace the limit of the first 0% bracket.

            const firstBracket = brackets[0];
            if (firstBracket.rate === 0) {
                const fullThreshold = firstBracket.limit;
                let newThreshold = fullThreshold;

                if (fullThreshold === 18200) {
                    // Modern Formula
                    newThreshold = 13464 + (4736 * (monthsResided / 12));
                } else {
                    // Legacy Pro-rata (fallback for pre-2012)
                    newThreshold = fullThreshold * (monthsResided / 12);
                }

                // Round down to nearest dollar? ATO usually rounds in specific ways, but standard rounding is safe for estimates.
                firstBracket.limit = Math.floor(newThreshold);
            }
        }

    } else {
        brackets = yearData.non_resident;
    }

    // 4. Calculate Income Tax (Progressive)
    let tax = 0;
    let previousLimit = 0;

    for (let i = 0; i < brackets.length; i++) {
        const bracket = brackets[i];
        const limit = bracket.limit;
        const rate = bracket.rate;

        // Effective limit for this bracket calculation
        // If this is the last bracket (Infinity), effective limit is income (if higher than previous)

        if (income > previousLimit) {
            const taxableInBracket = Math.min(income, limit) - previousLimit;
            tax += taxableInBracket * rate;
        } else {
            break;
        }

        previousLimit = limit;
    }

    // 5. Calculate Medicare Levy
    // Policy: Residents pay it. Non-residents don't. Part-year residents?
    // Part-year residents pay Medicare levy on their taxable income allowed to them as a resident.
    // Generally, if you are a resident for part of the year, you may pay the levy.
    // For simplicity and safety (over-estimating is better than under), we apply it for part-year too.
    // "Where applicable" - Part-year residents are eligible for Medicare, so they likely pay the levy.

    let medicareLevy = 0;
    if (residency === 'resident' || residency === 'part_year') {
        medicareLevy = income * yearData.medicare_levy;

        // Note: Part-year residents might claim an exemption for the non-resident period, 
        // effectively pro-rating the levy.
        // E.g. (365 - days non-resident) / 365 exemption.
        // Let's apply a pro-rata to the Medicare Levy as well for part-year to be more accurate.
        if (residency === 'part_year') {
            medicareLevy = medicareLevy * (monthsResided / 12);
        }
    }

    const totalTax = tax + medicareLevy;
    const netIncome = income - totalTax;

    return {
        incomeTax: tax,
        medicareLevy: medicareLevy,
        totalTax: totalTax,
        netIncome: netIncome
    };
}

document.addEventListener('DOMContentLoaded', function () {
    const incomeInput = document.getElementById('income');
    const yearSelect = document.getElementById('tax-year');
    const residencyRadios = document.getElementsByName('residency');
    const monthsContainer = document.getElementById('months-container');
    const monthsSelect = document.getElementById('resident-months');
    const resultContainer = document.getElementById('result-container');

    // Output Elements
    const valIncomeTax = document.getElementById('val-income-tax');
    const valMedicare = document.getElementById('val-medicare');
    const valTotalTax = document.getElementById('val-total-tax');
    const valNetIncome = document.getElementById('val-net-income');

    // Populate Years
    const years = Object.keys(australianTaxData).sort().reverse();
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });

    // Default calculations
    function update() {
        const income = parseFloat(incomeInput.value) || 0;
        const year = yearSelect.value;
        const residency = document.querySelector('input[name="residency"]:checked').value;
        const months = parseInt(monthsSelect.value);

        // Toggle Months Dropdown
        if (residency === 'part_year') {
            monthsContainer.style.display = 'block';
        } else {
            monthsContainer.style.display = 'none';
        }

        const results = calculateAustralianTax(income, year, residency, months);
        if (!results) return;

        // Format Currency
        const fmt = (num) => {
            return new Intl.NumberFormat('en-AU', {
                style: 'currency',
                currency: 'AUD',
                maximumFractionDigits: 0
            }).format(num);
        };

        valIncomeTax.textContent = fmt(results.incomeTax);
        valMedicare.textContent = fmt(results.medicareLevy);
        valTotalTax.textContent = fmt(results.totalTax);
        valNetIncome.textContent = fmt(results.netIncome); // Updates Hero Card

        // Show/Hide Medicare Row if non-resident
        const medicareRow = valMedicare.closest('.breakdown-row'); // Class Updated for new UI
        if (medicareRow) {
            if (residency === 'non_resident') {
                medicareRow.style.display = 'none';
            } else {
                medicareRow.style.display = 'flex';
            }
        }

        // --- NEW: Chart & Effective Rate Logic ---
        const effectiveRate = income > 0 ? (results.totalTax / income) * 100 : 0;
        const valEffectiveRate = document.getElementById('val-effective-rate');
        if (valEffectiveRate) {
            valEffectiveRate.textContent = effectiveRate.toFixed(1) + '%';
        }

        // Percentages for Chart
        // Tax portion
        const taxPercent = income > 0 ? (results.incomeTax / income) * 100 : 0;
        // Medicare portion
        const medPercent = income > 0 ? (results.medicareLevy / income) * 100 : 0;

        const chartContainer = document.getElementById('tax-chart');
        if (chartContainer) {
            // Update CSS Variables for Conic Gradient
            // --tax: Ends at tax %
            // --med: Ends at tax + med %
            chartContainer.style.setProperty('--tax', `${taxPercent}%`);
            chartContainer.style.setProperty('--med', `${taxPercent + medPercent}%`);
        }

        // Ensure Result Container is Visible
        if (resultContainer.style.display !== 'block') {
            resultContainer.style.display = 'block';
        }
    }

    // Listeners
    incomeInput.addEventListener('input', update);
    yearSelect.addEventListener('change', update);
    residencyRadios.forEach(r => r.addEventListener('change', update));
    monthsSelect.addEventListener('change', update);

    // Initial run
    update();
});
