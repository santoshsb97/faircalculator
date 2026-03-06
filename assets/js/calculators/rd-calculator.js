<<<<<<< HEAD
/* assets/js/calculators/rd-calculator.js */

document.addEventListener('DOMContentLoaded', () => {

    const monthlyInput = document.getElementById('monthly-deposit');
    const monthlySlider = document.getElementById('monthly-deposit-slider');
    const rateInput = document.getElementById('rd-rate');
    const tenureInput = document.getElementById('rd-tenure');
    const tenureType = document.getElementById('tenure-type');

    const maturityValueDisplay = document.getElementById('maturity-value');
    const investedAmountDisplay = document.getElementById('invested-amount');
    const interestEarnedDisplay = document.getElementById('interest-earned');

    const chartInvested = document.querySelector('.donut-invested');
    const chartInterest = document.querySelector('.donut-interest');
    const chartInvPct = document.getElementById('inv-pct');
    const chartIntPct = document.getElementById('int-pct');

    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    });

    function toShort(n) {
        if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
        if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
        return currencyFormatter.format(n);
    }

    if (monthlySlider && monthlyInput) {
        monthlySlider.addEventListener('input', (e) => {
            monthlyInput.value = e.target.value;
            syncSliderTrack(e.target);
            calculateRD();
        });
        monthlyInput.addEventListener('input', (e) => {
            monthlySlider.value = e.target.value;
            syncSliderTrack(monthlySlider);
            calculateRD();
        });
    }

    function syncSliderTrack(slider) {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.setProperty('--pct', pct + '%');
    }

    [rateInput, tenureInput, tenureType].forEach(el => {
        if (el) el.addEventListener('input', calculateRD);
    });

    function calculateRD() {
        const monthly = parseFloat(monthlyInput.value) || 0;
        const annualRate = parseFloat(rateInput.value) || 0;
        let tenure = parseFloat(tenureInput.value) || 0;

        if (tenureType.value === 'years') tenure *= 12; // Convert to months

        // Standard Indian Bank RD formula (Quarterly Compounding)
        // M = P * ((1+r)^n - 1) / (1 - (1+r)^(-1/3))
        // where r = quarterly rate = i/400

        const i = annualRate / 100;
        const totalInvested = monthly * tenure;
        let maturityValue = 0;

        if (i > 0) {
            // Formula: M = R[(1+i)^n - 1] / (1-(1+i)^(-1/3))
            // n is total number of quarters, but usually it's calculated month by month compounding quarterly
            // Simplified approximation/Standard Bank formula:
            const r = i / 4; // quarterly rate
            const quarters = tenure / 3;

            // Traditional formula for monthly installments with quarterly compounding:
            // S = R * [ ( (1 + i)^n - 1 ) / ( 1 - (1+i)^(-1/3) ) ]  where i is quarterly rate
            maturityValue = monthly * ((Math.pow(1 + r, quarters) - 1) / (1 - Math.pow(1 + r, -1 / 3)));
        } else {
            maturityValue = totalInvested;
        }

        const totalInterest = maturityValue - totalInvested;

        if (maturityValueDisplay) maturityValueDisplay.textContent = toShort(maturityValue);
        if (investedAmountDisplay) investedAmountDisplay.textContent = toShort(totalInvested);
        if (interestEarnedDisplay) interestEarnedDisplay.textContent = toShort(totalInterest);

        updateDonut(totalInvested, totalInterest, maturityValue);
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

    calculateRD();
    if (monthlySlider) syncSliderTrack(monthlySlider);
});
=======
/* assets/js/calculators/rd-calculator.js */

document.addEventListener('DOMContentLoaded', () => {

    const monthlyInput = document.getElementById('monthly-deposit');
    const monthlySlider = document.getElementById('monthly-deposit-slider');
    const rateInput = document.getElementById('rd-rate');
    const tenureInput = document.getElementById('rd-tenure');
    const tenureType = document.getElementById('tenure-type');

    const maturityValueDisplay = document.getElementById('maturity-value');
    const investedAmountDisplay = document.getElementById('invested-amount');
    const interestEarnedDisplay = document.getElementById('interest-earned');

    const chartInvested = document.querySelector('.donut-invested');
    const chartInterest = document.querySelector('.donut-interest');
    const chartInvPct = document.getElementById('inv-pct');
    const chartIntPct = document.getElementById('int-pct');

    const currencyFormatter = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    });

    function toShort(n) {
        if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
        if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
        return currencyFormatter.format(n);
    }

    if (monthlySlider && monthlyInput) {
        monthlySlider.addEventListener('input', (e) => {
            monthlyInput.value = e.target.value;
            syncSliderTrack(e.target);
            calculateRD();
        });
        monthlyInput.addEventListener('input', (e) => {
            monthlySlider.value = e.target.value;
            syncSliderTrack(monthlySlider);
            calculateRD();
        });
    }

    function syncSliderTrack(slider) {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.setProperty('--pct', pct + '%');
    }

    [rateInput, tenureInput, tenureType].forEach(el => {
        if (el) el.addEventListener('input', calculateRD);
    });

    function calculateRD() {
        const monthly = parseFloat(monthlyInput.value) || 0;
        const annualRate = parseFloat(rateInput.value) || 0;
        let tenure = parseFloat(tenureInput.value) || 0;

        if (tenureType.value === 'years') tenure *= 12; // Convert to months

        // Standard Indian Bank RD formula (Quarterly Compounding)
        // M = P * ((1+r)^n - 1) / (1 - (1+r)^(-1/3))
        // where r = quarterly rate = i/400

        const i = annualRate / 100;
        const totalInvested = monthly * tenure;
        let maturityValue = 0;

        if (i > 0) {
            // Formula: M = R[(1+i)^n - 1] / (1-(1+i)^(-1/3))
            // n is total number of quarters, but usually it's calculated month by month compounding quarterly
            // Simplified approximation/Standard Bank formula:
            const r = i / 4; // quarterly rate
            const quarters = tenure / 3;

            // Traditional formula for monthly installments with quarterly compounding:
            // S = R * [ ( (1 + i)^n - 1 ) / ( 1 - (1+i)^(-1/3) ) ]  where i is quarterly rate
            maturityValue = monthly * ((Math.pow(1 + r, quarters) - 1) / (1 - Math.pow(1 + r, -1 / 3)));
        } else {
            maturityValue = totalInvested;
        }

        const totalInterest = maturityValue - totalInvested;

        if (maturityValueDisplay) maturityValueDisplay.textContent = toShort(maturityValue);
        if (investedAmountDisplay) investedAmountDisplay.textContent = toShort(totalInvested);
        if (interestEarnedDisplay) interestEarnedDisplay.textContent = toShort(totalInterest);

        updateDonut(totalInvested, totalInterest, maturityValue);
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

    calculateRD();
    if (monthlySlider) syncSliderTrack(monthlySlider);
});
>>>>>>> b25ee628cbcd77785f3db855edc0abdf86b12685
