/* =============================================================
   ssy-calculator.js  —  FairCalculator.com
   Sukanya Samriddhi Yojana (SSY) Calculation Logic
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    const investInput = document.getElementById('yearly-investment');
    const investSlider = document.getElementById('yearly-investment-slider');
    const rateInput = document.getElementById('ssy-rate');
    const ageInput = document.getElementById('child-age');
    const startYearInput = document.getElementById('start-year');

    const maturityValueDisplay = document.getElementById('maturity-value');
    const investedAmountDisplay = document.getElementById('invested-amount');
    const interestEarnedDisplay = document.getElementById('interest-earned');
    const maturityYearDisplay = document.getElementById('maturity-year');

    const chartInvested = document.querySelector('.donut-invested');
    const chartInterest = document.querySelector('.donut-interest');
    const chartInvPct = document.getElementById('inv-pct');
    const chartIntPct = document.getElementById('int-pct');

    const tableBody = document.getElementById('schedule-body');

    /* ── FORMATTERS ───────────────────────────────────────────── */
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    });

    function toShort(n) {
        if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
        if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
        return currencyFormatter.format(n);
    }

    /* ── SYNC SLIDERS ─────────────────────────────────────────── */
    if (investSlider && investInput) {
        investSlider.addEventListener('input', (e) => {
            investInput.value = e.target.value;
            syncSliderTrack(e.target);
            calculateSSY();
        });
        investInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value) || 0;
            if (val > 150000) val = 150000;
            investSlider.value = val;
            syncSliderTrack(investSlider);
            calculateSSY();
        });
    }

    function syncSliderTrack(slider) {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.setProperty('--pct', pct + '%');
    }

    [rateInput, ageInput, startYearInput].forEach(el => {
        if (el) el.addEventListener('input', calculateSSY);
    });

    /* ── MAIN CALCULATION ─────────────────────────────────────── */
    function calculateSSY() {
        const yearlyInvest = parseFloat(investInput.value) || 0;
        const annualRate = parseFloat(rateInput.value) || 8.2;
        const childAge = parseInt(ageInput.value) || 0;
        const startYear = parseInt(startYearInput.value) || new Date().getFullYear();

        // SSY Rules: 
        // 1. Deposits for 15 years.
        // 2. Maturity after 21 years from start.

        let totalInvested = 0;
        let balance = 0;
        let schedule = [];
        const r = annualRate / 100;

        for (let year = 1; year <= 21; year++) {
            let deposit = 0;
            if (year <= 15) {
                deposit = yearlyInvest;
                totalInvested += deposit;
            }

            // Balance at start + deposit
            balance += deposit;

            // Interest calculated at end of year
            const interest = balance * r;
            balance += interest;

            schedule.push({
                yearNumber: year,
                calendarYear: startYear + year - 1,
                age: childAge + year - 1,
                deposit: deposit,
                interest: interest,
                balance: balance
            });
        }

        const totalReturns = balance - totalInvested;

        /* ── UPDATE UI ────────────────────────────────────────── */
        if (maturityValueDisplay) maturityValueDisplay.textContent = toShort(balance);
        if (investedAmountDisplay) investedAmountDisplay.textContent = toShort(totalInvested);
        if (interestEarnedDisplay) interestEarnedDisplay.textContent = toShort(totalReturns);
        if (maturityYearDisplay) maturityYearDisplay.textContent = startYear + 21;

        updateDonut(totalInvested, totalReturns, balance);
        updateTable(schedule);
    }

    function updateDonut(inv, ret, total) {
        if (!chartInvested || !chartInterest || total <= 0) return;
        const CIRC = 2 * Math.PI * 54;
        const invPct = inv / total;
        const retPct = ret / total;

        const invArc = invPct * CIRC;
        const retArc = retPct * CIRC;

        chartInvested.setAttribute('stroke-dasharray', `${invArc} ${CIRC - invArc}`);
        chartInterest.setAttribute('stroke-dasharray', `${retArc} ${CIRC - retArc}`);
        chartInterest.setAttribute('stroke-dashoffset', `${-invArc}`);

        if (chartInvPct) chartInvPct.textContent = (invPct * 100).toFixed(1) + '%';
        if (chartIntPct) chartIntPct.textContent = (retPct * 100).toFixed(1) + '%';
    }

    function updateTable(data) {
        if (!tableBody) return;
        tableBody.innerHTML = data.map(row => `
            <tr>
                <td>Year ${row.yearNumber} (${row.calendarYear})</td>
                <td>${currencyFormatter.format(row.deposit)}</td>
                <td>${currencyFormatter.format(row.interest)}</td>
                <td><strong>${currencyFormatter.format(row.balance)}</strong></td>
            </tr>
        `).join('');
    }

    // Initialize
    calculateSSY();
    if (investSlider) syncSliderTrack(investSlider);
});
