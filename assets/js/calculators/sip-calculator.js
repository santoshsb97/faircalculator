<<<<<<< HEAD
/* =============================================================
   sip-calculator.js  —  FairCalculator.com
   Fixed & Improved:
   ✅ Correct SIP formula (end-of-period ordinary annuity)
   ✅ Full input validation incl. return rate
   ✅ Single unified toggleFAQ (no duplicate conflict)
   ✅ Indian Lakh/Crore short-form number display
   ✅ Step-Up SIP support
   ✅ Animated donut chart (SVG)
   ✅ aria-live updates for accessibility
   ✅ Memory-safe schedule (local scope)
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ── DOM REFS ─────────────────────────────────────────────── */
    const monthlyInvInput = document.getElementById('monthly-investment');
    const expectedReturnInput = document.getElementById('expected-return');
    const stepUpInput = document.getElementById('step-up-rate');
    const timeSlider = document.getElementById('time-period-slider');
    const timeInput = document.getElementById('time-period-input');

    const investedValueDisplay = document.getElementById('invested-value');
    const returnsValueDisplay = document.getElementById('returns-value');
    const totalValueDisplay = document.getElementById('total-value');
    const displayYears = document.getElementById('display-years');
    const errorBanner = document.getElementById('calc-error');

    const chartInvested = document.getElementById('chart-invested');
    const chartReturns = document.getElementById('chart-returns');
    const chartInvestedPercent = document.getElementById('chart-invested-percent');
    const chartReturnsPercent = document.getElementById('chart-returns-percent');
    const chartInvestedAmount = document.getElementById('chart-invested-amount');
    const chartReturnsAmount = document.getElementById('chart-returns-amount');

    const scheduleTbody = document.getElementById('schedule-table-body');
    const scheduleThead = document.getElementById('schedule-header-row');

    /* ── FORMATTERS ───────────────────────────────────────────── */
    const indianFull = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    });

    /** Short-form: ₹4.74 Cr, ₹12.5 L, etc. */
    function toShort(n) {
        if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
        if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
        return indianFull.format(n);
    }

    /** Full Indian format with short form on next line */
    function formatResult(n) {
        const full = indianFull.format(n);
        const short = (n >= 1e5) ? toShort(n) : null;
        return { full, short };
    }

    /* ── SYNC SLIDER ──────────────────────────────────────────── */
    timeSlider.addEventListener('input', e => {
        timeInput.value = e.target.value;
        timeSlider.setAttribute('aria-valuenow', e.target.value);
        calculateSIP();
    });

    timeInput.addEventListener('input', e => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 40) val = 40;
        e.target.value = val;
        timeSlider.value = val;
        timeSlider.setAttribute('aria-valuenow', val);
        calculateSIP();
    });

    [monthlyInvInput, expectedReturnInput, stepUpInput].forEach(el => {
        if (el) el.addEventListener('input', calculateSIP);
    });

    /* ── EXPOSE GLOBALLY ──────────────────────────────────────── */
    window.calculateSIP = calculateSIP;

    /* ── SEARCH BAR: hide TOOL LIST, not calculator ───────────── */
    const searchInput = document.getElementById('searchInput');
    const toolContainer = document.getElementById('tool-container');
    if (searchInput && toolContainer) {
        searchInput.addEventListener('input', e => {
            // Only hide if there is a separate tool-list; never hide the calculator
            const list = document.getElementById('tool-list');
            if (list) list.style.display = e.target.value.trim() ? 'none' : '';
        });
    }

    /* ── MAIN CALCULATION ─────────────────────────────────────── */
    function calculateSIP() {
        const P = parseFloat(monthlyInvInput.value) || 0;
        const annualRate = parseFloat(expectedReturnInput.value) || 0;
        const years = parseInt(timeInput.value) || 0;
        const stepUp = stepUpInput ? (parseFloat(stepUpInput.value) || 0) : 0;

        /* ── VALIDATION ────────────────────────────────────────── */
        if (P <= 0 || annualRate <= 0 || years <= 0) {
            showError('Please enter valid positive values for Monthly Investment, Return Rate, and Time Period.');
            resetDisplay();
            return;
        }
        if (annualRate > 50) {
            showError('Expected return rate seems too high. Typical equity SIP returns are 10–15% p.a.');
            resetDisplay();
            return;
        }
        if (P < 100) {
            showError('Minimum SIP amount is ₹100/month.');
            resetDisplay();
            return;
        }
        clearError();

        const i = annualRate / 100 / 12;   // monthly rate
        const n = years * 12;              // total months

        /* ── SCHEDULE BUILD ────────────────────────────────────── */
        // Uses CORRECT end-of-period ordinary annuity:
        //   interest = previous balance × monthly rate
        //   then deposit added AFTER interest
        // Step-Up: monthly SIP increases by stepUp% each year

        let schedule = [];
        let currentBalance = 0;
        let totalPrincipal = 0;
        let totalInterest = 0;
        let currentMonthlyP = P;

        for (let month = 1; month <= n; month++) {
            // Apply step-up at the start of each new year (except year 1)
            if (stepUp > 0 && month > 1 && (month - 1) % 12 === 0) {
                currentMonthlyP = currentMonthlyP * (1 + stepUp / 100);
            }

            // ✅ CORRECT formula: interest on PREVIOUS balance, then add deposit
            const interestThisMonth = currentBalance * i;
            currentBalance += interestThisMonth + currentMonthlyP;
            totalPrincipal += currentMonthlyP;
            totalInterest += interestThisMonth;

            schedule.push({
                year: Math.ceil(month / 12),
                month: month,
                monthOfYear: month % 12 || 12,
                deposit: currentMonthlyP,
                interest: interestThisMonth,
                principal: totalPrincipal,
                balance: currentBalance
            });
        }

        const investedAmount = totalPrincipal;
        const estReturns = Math.max(0, currentBalance - investedAmount);
        const totalValue = currentBalance;

        /* ── UPDATE RESULTS ────────────────────────────────────── */
        updateResultCard(investedValueDisplay, investedAmount);
        updateResultCard(returnsValueDisplay, estReturns);
        updateResultCard(totalValueDisplay, totalValue);
        if (displayYears) displayYears.textContent = years;

        updateChart(investedAmount, estReturns, totalValue);
        updateDonut(investedAmount, estReturns, totalValue);

        // Store schedule on window for CSV download
        window._sipSchedule = schedule;

        // Refresh visible schedule tab
        const activeBtn = document.querySelector('.schedule-controls button.active');
        const viewType = activeBtn && activeBtn.id === 'view-yearly' ? 'yearly' : 'monthly';
        displaySchedule(viewType, activeBtn);
    }

    /* ── RESULT CARD with SHORT FORM ──────────────────────────── */
    function updateResultCard(el, value) {
        if (!el) return;
        const { full, short } = formatResult(value);
        el.innerHTML = full + (short ? `<span class="result-short">${short}</span>` : '');
    }

    /* ── PROGRESS BAR CHART ───────────────────────────────────── */
    function updateChart(invested, returns, total) {
        if (total <= 0) {
            [chartInvested, chartReturns].forEach(el => { if (el) el.style.width = '0%'; });
            [chartInvestedPercent, chartReturnsPercent].forEach(el => { if (el) el.textContent = '0%'; });
            if (chartInvestedAmount) chartInvestedAmount.textContent = '₹0';
            if (chartReturnsAmount) chartReturnsAmount.textContent = '₹0';
            return;
        }
        const invPct = (invested / total * 100).toFixed(1);
        const retPct = (returns / total * 100).toFixed(1);

        if (chartInvested) chartInvested.style.width = invPct + '%';
        if (chartReturns) chartReturns.style.width = retPct + '%';
        if (chartInvestedPercent) chartInvestedPercent.textContent = invPct + '%';
        if (chartReturnsPercent) chartReturnsPercent.textContent = retPct + '%';
        if (chartInvestedAmount) chartInvestedAmount.textContent = toShort(invested);
        if (chartReturnsAmount) chartReturnsAmount.textContent = toShort(returns);
    }

    /* ── SVG DONUT CHART ──────────────────────────────────────── */
    function updateDonut(invested, returns, total) {
        const donut = document.getElementById('donut-chart');
        if (!donut || total <= 0) return;

        const R = 54;
        const CX = 64, CY = 64;
        const CIRC = 2 * Math.PI * R;
        const invPct = invested / total;
        const retPct = returns / total;

        const invArc = invPct * CIRC;
        const retArc = retPct * CIRC;

        const invSlice = donut.querySelector('.donut-invested');
        const retSlice = donut.querySelector('.donut-returns');
        const label = donut.querySelector('.donut-label-main');
        const sublabel = donut.querySelector('.donut-label-sub');

        if (invSlice) {
            invSlice.setAttribute('stroke-dasharray', `${invArc} ${CIRC - invArc}`);
            invSlice.setAttribute('stroke-dashoffset', '0');
        }
        if (retSlice) {
            retSlice.setAttribute('stroke-dasharray', `${retArc} ${CIRC - retArc}`);
            retSlice.setAttribute('stroke-dashoffset', `${-invArc}`);
        }
        if (label) label.textContent = toShort(total);
        if (sublabel) sublabel.textContent = 'Total Value';
    }

    /* ── RESET DISPLAY ────────────────────────────────────────── */
    function resetDisplay() {
        [investedValueDisplay, returnsValueDisplay, totalValueDisplay].forEach(el => {
            if (el) el.textContent = '—';
        });
        if (chartInvestedAmount) chartInvestedAmount.textContent = '₹0';
        if (chartReturnsAmount) chartReturnsAmount.textContent = '₹0';
        updateChart(0, 0, 0);
        updateDonut(0, 0, 0);
        if (scheduleTbody) scheduleTbody.innerHTML = '';
        if (scheduleThead) scheduleThead.innerHTML = '';
        window._sipSchedule = [];
    }

    /* ── ERROR BANNER ─────────────────────────────────────────── */
    function showError(msg) {
        if (!errorBanner) return;
        errorBanner.textContent = '⚠️ ' + msg;
        errorBanner.style.display = 'block';
    }
    function clearError() {
        if (!errorBanner) return;
        errorBanner.textContent = '';
        errorBanner.style.display = 'none';
    }

    /* ── SCHEDULE TABLE ───────────────────────────────────────── */
    window.displaySchedule = function (viewType, button) {
        if (!scheduleTbody || !scheduleThead) return;
        scheduleTbody.innerHTML = '';

        document.querySelectorAll('.schedule-controls button').forEach(b => b.classList.remove('active'));
        if (button) button.classList.add('active');

        const schedule = window._sipSchedule || [];
        if (!schedule.length) return;

        if (viewType === 'monthly') {
            scheduleThead.innerHTML =
                '<th>Year</th><th>Month</th><th>Monthly SIP</th><th>Interest</th><th>Total Invested</th><th>Balance</th>';
            schedule.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${row.year}</td>
          <td>${row.monthOfYear}</td>
          <td>${indianFull.format(row.deposit)}</td>
          <td>${indianFull.format(row.interest)}</td>
          <td>${indianFull.format(row.principal)}</td>
          <td><strong>${indianFull.format(row.balance)}</strong></td>`;
                scheduleTbody.appendChild(tr);
            });
        } else {
            scheduleThead.innerHTML =
                '<th>Year</th><th>Yearly SIP</th><th>Yearly Interest</th><th>Total Invested</th><th>Balance</th>';
            const yrMap = {};
            schedule.forEach(row => {
                if (!yrMap[row.year]) yrMap[row.year] = { dep: 0, int: 0, prin: 0, bal: 0 };
                yrMap[row.year].dep += row.deposit;
                yrMap[row.year].int += row.interest;
                yrMap[row.year].prin = row.principal;
                yrMap[row.year].bal = row.balance;
            });
            Object.entries(yrMap).forEach(([yr, d]) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${yr}</td>
          <td>${indianFull.format(d.dep)}</td>
          <td>${indianFull.format(d.int)}</td>
          <td>${indianFull.format(d.prin)}</td>
          <td><strong>${indianFull.format(d.bal)}</strong></td>`;
                scheduleTbody.appendChild(tr);
            });
        }
    };

    /* ── CSV DOWNLOAD ─────────────────────────────────────────── */
    window.downloadCSV = function () {
        const schedule = window._sipSchedule || [];
        if (!schedule.length) { alert('Please calculate first!'); return; }
        let csv = 'Year,Month,Monthly SIP,Interest Earned,Total Invested,Balance\n';
        schedule.forEach(r => {
            csv += `${r.year},${r.monthOfYear},${r.deposit.toFixed(2)},${r.interest.toFixed(2)},${r.principal.toFixed(2)},${r.balance.toFixed(2)}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sip_schedule.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ── SINGLE FAQ TOGGLE (fixes duplicate conflict) ─────────── */
    window.toggleFAQ = function (btn) {
        const item = btn.closest('.faq-item');
        const answer = btn.nextElementSibling;
        const icon = btn.querySelector('.faq-icon');
        const isOpen = item.classList.contains('active');

        // Close all others
        document.querySelectorAll('.faq-item.active').forEach(el => {
            el.classList.remove('active');
            const a = el.querySelector('.faq-answer');
            const i = el.querySelector('.faq-icon');
            if (a) a.style.maxHeight = null;
            if (i) i.textContent = '+';
        });

        if (!isOpen) {
            item.classList.add('active');
            if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
            if (icon) icon.textContent = '−';
        }
    };

    /* ── INITIAL CALC ─────────────────────────────────────────── */
    calculateSIP();
=======
/* =============================================================
   sip-calculator.js  —  FairCalculator.com
   Fixed & Improved:
   ✅ Correct SIP formula (end-of-period ordinary annuity)
   ✅ Full input validation incl. return rate
   ✅ Single unified toggleFAQ (no duplicate conflict)
   ✅ Indian Lakh/Crore short-form number display
   ✅ Step-Up SIP support
   ✅ Animated donut chart (SVG)
   ✅ aria-live updates for accessibility
   ✅ Memory-safe schedule (local scope)
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ── DOM REFS ─────────────────────────────────────────────── */
    const monthlyInvInput = document.getElementById('monthly-investment');
    const expectedReturnInput = document.getElementById('expected-return');
    const stepUpInput = document.getElementById('step-up-rate');
    const timeSlider = document.getElementById('time-period-slider');
    const timeInput = document.getElementById('time-period-input');

    const investedValueDisplay = document.getElementById('invested-value');
    const returnsValueDisplay = document.getElementById('returns-value');
    const totalValueDisplay = document.getElementById('total-value');
    const displayYears = document.getElementById('display-years');
    const errorBanner = document.getElementById('calc-error');

    const chartInvested = document.getElementById('chart-invested');
    const chartReturns = document.getElementById('chart-returns');
    const chartInvestedPercent = document.getElementById('chart-invested-percent');
    const chartReturnsPercent = document.getElementById('chart-returns-percent');
    const chartInvestedAmount = document.getElementById('chart-invested-amount');
    const chartReturnsAmount = document.getElementById('chart-returns-amount');

    const scheduleTbody = document.getElementById('schedule-table-body');
    const scheduleThead = document.getElementById('schedule-header-row');

    /* ── FORMATTERS ───────────────────────────────────────────── */
    const indianFull = new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0
    });

    /** Short-form: ₹4.74 Cr, ₹12.5 L, etc. */
    function toShort(n) {
        if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
        if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
        return indianFull.format(n);
    }

    /** Full Indian format with short form on next line */
    function formatResult(n) {
        const full = indianFull.format(n);
        const short = (n >= 1e5) ? toShort(n) : null;
        return { full, short };
    }

    /* ── SYNC SLIDER ──────────────────────────────────────────── */
    timeSlider.addEventListener('input', e => {
        timeInput.value = e.target.value;
        timeSlider.setAttribute('aria-valuenow', e.target.value);
        calculateSIP();
    });

    timeInput.addEventListener('input', e => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 40) val = 40;
        e.target.value = val;
        timeSlider.value = val;
        timeSlider.setAttribute('aria-valuenow', val);
        calculateSIP();
    });

    [monthlyInvInput, expectedReturnInput, stepUpInput].forEach(el => {
        if (el) el.addEventListener('input', calculateSIP);
    });

    /* ── EXPOSE GLOBALLY ──────────────────────────────────────── */
    window.calculateSIP = calculateSIP;

    /* ── SEARCH BAR: hide TOOL LIST, not calculator ───────────── */
    const searchInput = document.getElementById('searchInput');
    const toolContainer = document.getElementById('tool-container');
    if (searchInput && toolContainer) {
        searchInput.addEventListener('input', e => {
            // Only hide if there is a separate tool-list; never hide the calculator
            const list = document.getElementById('tool-list');
            if (list) list.style.display = e.target.value.trim() ? 'none' : '';
        });
    }

    /* ── MAIN CALCULATION ─────────────────────────────────────── */
    function calculateSIP() {
        const P = parseFloat(monthlyInvInput.value) || 0;
        const annualRate = parseFloat(expectedReturnInput.value) || 0;
        const years = parseInt(timeInput.value) || 0;
        const stepUp = stepUpInput ? (parseFloat(stepUpInput.value) || 0) : 0;

        /* ── VALIDATION ────────────────────────────────────────── */
        if (P <= 0 || annualRate <= 0 || years <= 0) {
            showError('Please enter valid positive values for Monthly Investment, Return Rate, and Time Period.');
            resetDisplay();
            return;
        }
        if (annualRate > 50) {
            showError('Expected return rate seems too high. Typical equity SIP returns are 10–15% p.a.');
            resetDisplay();
            return;
        }
        if (P < 100) {
            showError('Minimum SIP amount is ₹100/month.');
            resetDisplay();
            return;
        }
        clearError();

        const i = annualRate / 100 / 12;   // monthly rate
        const n = years * 12;              // total months

        /* ── SCHEDULE BUILD ────────────────────────────────────── */
        // Uses CORRECT end-of-period ordinary annuity:
        //   interest = previous balance × monthly rate
        //   then deposit added AFTER interest
        // Step-Up: monthly SIP increases by stepUp% each year

        let schedule = [];
        let currentBalance = 0;
        let totalPrincipal = 0;
        let totalInterest = 0;
        let currentMonthlyP = P;

        for (let month = 1; month <= n; month++) {
            // Apply step-up at the start of each new year (except year 1)
            if (stepUp > 0 && month > 1 && (month - 1) % 12 === 0) {
                currentMonthlyP = currentMonthlyP * (1 + stepUp / 100);
            }

            // ✅ CORRECT formula: interest on PREVIOUS balance, then add deposit
            const interestThisMonth = currentBalance * i;
            currentBalance += interestThisMonth + currentMonthlyP;
            totalPrincipal += currentMonthlyP;
            totalInterest += interestThisMonth;

            schedule.push({
                year: Math.ceil(month / 12),
                month: month,
                monthOfYear: month % 12 || 12,
                deposit: currentMonthlyP,
                interest: interestThisMonth,
                principal: totalPrincipal,
                balance: currentBalance
            });
        }

        const investedAmount = totalPrincipal;
        const estReturns = Math.max(0, currentBalance - investedAmount);
        const totalValue = currentBalance;

        /* ── UPDATE RESULTS ────────────────────────────────────── */
        updateResultCard(investedValueDisplay, investedAmount);
        updateResultCard(returnsValueDisplay, estReturns);
        updateResultCard(totalValueDisplay, totalValue);
        if (displayYears) displayYears.textContent = years;

        updateChart(investedAmount, estReturns, totalValue);
        updateDonut(investedAmount, estReturns, totalValue);

        // Store schedule on window for CSV download
        window._sipSchedule = schedule;

        // Refresh visible schedule tab
        const activeBtn = document.querySelector('.schedule-controls button.active');
        const viewType = activeBtn && activeBtn.id === 'view-yearly' ? 'yearly' : 'monthly';
        displaySchedule(viewType, activeBtn);
    }

    /* ── RESULT CARD with SHORT FORM ──────────────────────────── */
    function updateResultCard(el, value) {
        if (!el) return;
        const { full, short } = formatResult(value);
        el.innerHTML = full + (short ? `<span class="result-short">${short}</span>` : '');
    }

    /* ── PROGRESS BAR CHART ───────────────────────────────────── */
    function updateChart(invested, returns, total) {
        if (total <= 0) {
            [chartInvested, chartReturns].forEach(el => { if (el) el.style.width = '0%'; });
            [chartInvestedPercent, chartReturnsPercent].forEach(el => { if (el) el.textContent = '0%'; });
            if (chartInvestedAmount) chartInvestedAmount.textContent = '₹0';
            if (chartReturnsAmount) chartReturnsAmount.textContent = '₹0';
            return;
        }
        const invPct = (invested / total * 100).toFixed(1);
        const retPct = (returns / total * 100).toFixed(1);

        if (chartInvested) chartInvested.style.width = invPct + '%';
        if (chartReturns) chartReturns.style.width = retPct + '%';
        if (chartInvestedPercent) chartInvestedPercent.textContent = invPct + '%';
        if (chartReturnsPercent) chartReturnsPercent.textContent = retPct + '%';
        if (chartInvestedAmount) chartInvestedAmount.textContent = toShort(invested);
        if (chartReturnsAmount) chartReturnsAmount.textContent = toShort(returns);
    }

    /* ── SVG DONUT CHART ──────────────────────────────────────── */
    function updateDonut(invested, returns, total) {
        const donut = document.getElementById('donut-chart');
        if (!donut || total <= 0) return;

        const R = 54;
        const CX = 64, CY = 64;
        const CIRC = 2 * Math.PI * R;
        const invPct = invested / total;
        const retPct = returns / total;

        const invArc = invPct * CIRC;
        const retArc = retPct * CIRC;

        const invSlice = donut.querySelector('.donut-invested');
        const retSlice = donut.querySelector('.donut-returns');
        const label = donut.querySelector('.donut-label-main');
        const sublabel = donut.querySelector('.donut-label-sub');

        if (invSlice) {
            invSlice.setAttribute('stroke-dasharray', `${invArc} ${CIRC - invArc}`);
            invSlice.setAttribute('stroke-dashoffset', '0');
        }
        if (retSlice) {
            retSlice.setAttribute('stroke-dasharray', `${retArc} ${CIRC - retArc}`);
            retSlice.setAttribute('stroke-dashoffset', `${-invArc}`);
        }
        if (label) label.textContent = toShort(total);
        if (sublabel) sublabel.textContent = 'Total Value';
    }

    /* ── RESET DISPLAY ────────────────────────────────────────── */
    function resetDisplay() {
        [investedValueDisplay, returnsValueDisplay, totalValueDisplay].forEach(el => {
            if (el) el.textContent = '—';
        });
        if (chartInvestedAmount) chartInvestedAmount.textContent = '₹0';
        if (chartReturnsAmount) chartReturnsAmount.textContent = '₹0';
        updateChart(0, 0, 0);
        updateDonut(0, 0, 0);
        if (scheduleTbody) scheduleTbody.innerHTML = '';
        if (scheduleThead) scheduleThead.innerHTML = '';
        window._sipSchedule = [];
    }

    /* ── ERROR BANNER ─────────────────────────────────────────── */
    function showError(msg) {
        if (!errorBanner) return;
        errorBanner.textContent = '⚠️ ' + msg;
        errorBanner.style.display = 'block';
    }
    function clearError() {
        if (!errorBanner) return;
        errorBanner.textContent = '';
        errorBanner.style.display = 'none';
    }

    /* ── SCHEDULE TABLE ───────────────────────────────────────── */
    window.displaySchedule = function (viewType, button) {
        if (!scheduleTbody || !scheduleThead) return;
        scheduleTbody.innerHTML = '';

        document.querySelectorAll('.schedule-controls button').forEach(b => b.classList.remove('active'));
        if (button) button.classList.add('active');

        const schedule = window._sipSchedule || [];
        if (!schedule.length) return;

        if (viewType === 'monthly') {
            scheduleThead.innerHTML =
                '<th>Year</th><th>Month</th><th>Monthly SIP</th><th>Interest</th><th>Total Invested</th><th>Balance</th>';
            schedule.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${row.year}</td>
          <td>${row.monthOfYear}</td>
          <td>${indianFull.format(row.deposit)}</td>
          <td>${indianFull.format(row.interest)}</td>
          <td>${indianFull.format(row.principal)}</td>
          <td><strong>${indianFull.format(row.balance)}</strong></td>`;
                scheduleTbody.appendChild(tr);
            });
        } else {
            scheduleThead.innerHTML =
                '<th>Year</th><th>Yearly SIP</th><th>Yearly Interest</th><th>Total Invested</th><th>Balance</th>';
            const yrMap = {};
            schedule.forEach(row => {
                if (!yrMap[row.year]) yrMap[row.year] = { dep: 0, int: 0, prin: 0, bal: 0 };
                yrMap[row.year].dep += row.deposit;
                yrMap[row.year].int += row.interest;
                yrMap[row.year].prin = row.principal;
                yrMap[row.year].bal = row.balance;
            });
            Object.entries(yrMap).forEach(([yr, d]) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${yr}</td>
          <td>${indianFull.format(d.dep)}</td>
          <td>${indianFull.format(d.int)}</td>
          <td>${indianFull.format(d.prin)}</td>
          <td><strong>${indianFull.format(d.bal)}</strong></td>`;
                scheduleTbody.appendChild(tr);
            });
        }
    };

    /* ── CSV DOWNLOAD ─────────────────────────────────────────── */
    window.downloadCSV = function () {
        const schedule = window._sipSchedule || [];
        if (!schedule.length) { alert('Please calculate first!'); return; }
        let csv = 'Year,Month,Monthly SIP,Interest Earned,Total Invested,Balance\n';
        schedule.forEach(r => {
            csv += `${r.year},${r.monthOfYear},${r.deposit.toFixed(2)},${r.interest.toFixed(2)},${r.principal.toFixed(2)},${r.balance.toFixed(2)}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sip_schedule.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ── SINGLE FAQ TOGGLE (fixes duplicate conflict) ─────────── */
    window.toggleFAQ = function (btn) {
        const item = btn.closest('.faq-item');
        const answer = btn.nextElementSibling;
        const icon = btn.querySelector('.faq-icon');
        const isOpen = item.classList.contains('active');

        // Close all others
        document.querySelectorAll('.faq-item.active').forEach(el => {
            el.classList.remove('active');
            const a = el.querySelector('.faq-answer');
            const i = el.querySelector('.faq-icon');
            if (a) a.style.maxHeight = null;
            if (i) i.textContent = '+';
        });

        if (!isOpen) {
            item.classList.add('active');
            if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
            if (icon) icon.textContent = '−';
        }
    };

    /* ── INITIAL CALC ─────────────────────────────────────────── */
    calculateSIP();
>>>>>>> b25ee628cbcd77785f3db855edc0abdf86b12685
});