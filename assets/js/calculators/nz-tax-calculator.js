/* ============================================================
   NZ INCOME TAX CALCULATOR  –  2025-26 IRD Brackets
   assets/js/calculators/nz-tax-calculator.js
============================================================ */
(function () {
    'use strict';

    /* ---------- TAX YEAR DATA (Brackets + ACC + IETC per year) ---------- */
    const TAX_YEARS = {
        2026: { // 2025-26 Current – new brackets + expanded IETC from 2024 Budget
            brackets: [
                { min: 0, max: 15600, rate: 0.105 },
                { min: 15600, max: 53500, rate: 0.175 },
                { min: 53500, max: 78100, rate: 0.30 },
                { min: 78100, max: 180000, rate: 0.33 },
                { min: 180000, max: Infinity, rate: 0.39 }
            ],
            accRate: 0.0167, accMax: 152790,        // IR340 2025-26
            ietcMaxFull: 66000, ietcPhaseEnd: 70000  // 2024 Budget expanded IETC
        },
        2025: { // 2024-25 – new brackets; pre-expanded IETC
            brackets: [
                { min: 0, max: 15600, rate: 0.105 },
                { min: 15600, max: 53500, rate: 0.175 },
                { min: 53500, max: 78100, rate: 0.30 },
                { min: 78100, max: 180000, rate: 0.33 },
                { min: 180000, max: Infinity, rate: 0.39 }
            ],
            accRate: 0.0160, accMax: 142283,
            ietcMaxFull: 44000, ietcPhaseEnd: 48000
        },
        2024: { // 2023-24 pre-Budget old brackets
            brackets: [
                { min: 0, max: 14000, rate: 0.105 },
                { min: 14000, max: 48000, rate: 0.175 },
                { min: 48000, max: 70000, rate: 0.30 },
                { min: 70000, max: 180000, rate: 0.33 },
                { min: 180000, max: Infinity, rate: 0.39 }
            ],
            accRate: 0.0153, accMax: 139384,
            ietcMaxFull: 44000, ietcPhaseEnd: 48000
        },
        2023: { // 2022-23
            brackets: [
                { min: 0, max: 14000, rate: 0.105 },
                { min: 14000, max: 48000, rate: 0.175 },
                { min: 48000, max: 70000, rate: 0.30 },
                { min: 70000, max: 180000, rate: 0.33 },
                { min: 180000, max: Infinity, rate: 0.39 }
            ],
            accRate: 0.0146, accMax: 136544,
            ietcMaxFull: 44000, ietcPhaseEnd: 48000
        }
    };

    /* IETC global constants (same across all years) */
    const IETC_MIN = 24000;
    const IETC_FULL = 520;

    /* --------- Helper: format NZD --------- */
    const fmt = (n) => new Intl.NumberFormat('en-NZ', {
        style: 'currency', currency: 'NZD',
        minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n);

    const pct = (n, d) => d === 0 ? '0.00%' : (n / d * 100).toFixed(2) + '%';

    /* --------- Calculate PAYE tax --------- */
    function calcPAYE(income, brackets) {
        let tax = 0;
        let marginalRate = brackets[0].rate;
        for (const b of brackets) {
            if (income <= b.min) break;
            const taxable = Math.min(income, b.max) - b.min;
            tax += taxable * b.rate;
            if (income > b.min) marginalRate = b.rate;
        }
        return { tax, marginalRate };
    }

    /* --------- Calculate IETC (receives full yearData object) --------- */
    function calcIETC(income, isResident, yearData) {
        if (!isResident || income < IETC_MIN || income >= yearData.ietcPhaseEnd) return 0;
        if (income <= yearData.ietcMaxFull) return IETC_FULL;
        // Phase-out: 13 cents per dollar over the full-credit ceiling (IRD formula)
        return Math.max(0, IETC_FULL - (income - yearData.ietcMaxFull) * 0.13);
    }

    /* --------- Main calculation function --------- */
    function calculate() {
        const income = parseFloat(document.getElementById('income').value) || 0;
        const year = parseInt(document.getElementById('taxYear').value);
        const ksRate = parseFloat(document.getElementById('kiwisaver').value) / 100;
        const freqEl = document.getElementById('frequency');
        const freq = parseInt(freqEl.value);
        const freqLabel = freqEl.options[freqEl.selectedIndex].text;
        const isResident = document.querySelector('input[name="residency"]:checked').value === 'resident';
        const includeACC = document.querySelector('input[name="accToggle"]:checked').value === 'yes';

        if (income <= 0) return;

        // Grab ALL tax data for the selected year
        const yearData = TAX_YEARS[year] || TAX_YEARS[2026];

        /* 1. PAYE tax */
        const { tax: payeTax, marginalRate } = calcPAYE(income, yearData.brackets);

        /* 2. ACC earner levy (year-specific rate and cap) */
        const accIncome = Math.min(income, yearData.accMax);
        const accLevy = includeACC ? accIncome * yearData.accRate : 0;

        /* 3. KiwiSaver (employee) */
        const ksSaving = income * ksRate;

        /* 4. IETC credit (yearData carries ietcMaxFull + ietcPhaseEnd) */
        const ietc = isResident ? calcIETC(income, isResident, yearData) : 0;

        /* 5. Net pay */
        const totalDeductions = payeTax + accLevy + ksSaving - ietc;
        const netPay = income - totalDeductions;
        const effectiveRate = income > 0 ? payeTax / income : 0;

        /* ---- Divide by frequency ---- */
        const d = freq;
        const grossD = income / d;
        const taxD = payeTax / d;
        const accD = accLevy / d;
        const ksD = ksSaving / d;
        const ietcD = ietc / d;
        const netD = netPay / d;

        /* ---- Update DOM ---- */
        document.getElementById('val-net-income').textContent = fmt(netD);
        document.getElementById('val-net-period').textContent = `Per ${freqLabel} · After tax, ACC & KiwiSaver`;
        document.getElementById('val-gross').textContent = fmt(grossD);
        document.getElementById('val-income-tax').textContent = '-' + fmt(taxD);
        document.getElementById('val-acc').textContent = '-' + fmt(accD);
        document.getElementById('val-ks').textContent = '-' + fmt(ksD);
        document.getElementById('val-net-breakdown').textContent = fmt(netD);
        document.getElementById('val-effective-rate').textContent = (effectiveRate * 100).toFixed(1) + '%';
        document.getElementById('val-eff-inline').textContent = (effectiveRate * 100).toFixed(2) + '%';
        document.getElementById('val-marginal').textContent = (marginalRate * 100).toFixed(1) + '%';
        document.getElementById('ks-pct-label').textContent = (ksRate * 100).toFixed(0);
        document.getElementById('period-label').textContent = '(' + freqLabel + ')';

        /* IETC row visibility */
        const ietcRow = document.getElementById('row-ietc');
        if (ietc > 0) {
            ietcRow.style.display = 'flex';
            document.getElementById('val-ietc').textContent = '+' + fmt(ietcD);
        } else {
            ietcRow.style.display = 'none';
        }

        /* ACC row visibility */
        document.getElementById('val-acc').textContent =
            includeACC ? '-' + fmt(accD) : fmt(0);

        /* ---- Update donut chart ---- */
        const taxPct = Math.min((payeTax / income) * 100, 100);
        const accPct = Math.min(taxPct + (accLevy / income) * 100, 100);
        const ksPct = Math.min(accPct + (ksSaving / income) * 100, 100);
        const chart = document.getElementById('tax-chart');
        chart.style.setProperty('--tax', taxPct.toFixed(2) + '%');
        chart.style.setProperty('--acc', accPct.toFixed(2) + '%');
        chart.style.setProperty('--ks', ksPct.toFixed(2) + '%');

        /* Show results */
        document.getElementById('result-container').style.display = 'block';
    }

    /* ---- Event listeners ---- */
    document.getElementById('calculateBtn').addEventListener('click', calculate);

    // Real-time on input change
    ['income', 'taxYear', 'kiwisaver', 'frequency'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculate);
        document.getElementById(id).addEventListener('change', calculate);
    });

    document.querySelectorAll('input[name="residency"]').forEach(r => r.addEventListener('change', calculate));
    document.querySelectorAll('input[name="accToggle"]').forEach(r => r.addEventListener('change', calculate));

    // Run on load with default values
    calculate();
})();
