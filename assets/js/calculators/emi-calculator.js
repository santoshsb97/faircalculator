/* =============================================================
   emi-calculator.js  —  FairCalculator.com
   Features:
   ✅ Correct EMI formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
   ✅ Full input validation with error banner
   ✅ Indian Lakh/Crore short-form display
   ✅ Animated SVG donut chart
   ✅ Month-by-month + yearly amortisation schedule
   ✅ Loan type presets (Home, Car, Personal, Education)
   ✅ CSV download
   ✅ aria-live result updates for accessibility
   ✅ Prepayment / extra payment simulation
   ============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── DOM REFS ─────────────────────────────────────────────── */
  const loanAmountInput    = document.getElementById('loan-amount');
  const interestRateInput  = document.getElementById('interest-rate');
  const tenureSlider       = document.getElementById('tenure-slider');
  const tenureInput        = document.getElementById('tenure-input');
  const tenureTypeSelect   = document.getElementById('tenure-type');
  const prepaymentInput    = document.getElementById('prepayment-amount');
  const errorBanner        = document.getElementById('calc-error');

  const emiValueDisplay        = document.getElementById('emi-value');
  const totalInterestDisplay   = document.getElementById('total-interest');
  const totalPaymentDisplay    = document.getElementById('total-payment');
  const displayTenure          = document.getElementById('display-tenure');
  const displayTenureUnit      = document.getElementById('display-tenure-unit');

  const chartPrincipalPercent  = document.getElementById('chart-principal-percent');
  const chartInterestPercent   = document.getElementById('chart-interest-percent');
  const chartPrincipalAmount   = document.getElementById('chart-principal-amount');
  const chartInterestAmount    = document.getElementById('chart-interest-amount');

  const scheduleTbody   = document.getElementById('schedule-table-body');
  const scheduleThead   = document.getElementById('schedule-header-row');

  /* ── FORMATTERS ───────────────────────────────────────────── */
  const indianFull = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  });

  function toShort(n) {
    if (n >= 1e7)  return '₹' + (n / 1e7).toFixed(2) + ' Cr';
    if (n >= 1e5)  return '₹' + (n / 1e5).toFixed(2) + ' L';
    return indianFull.format(n);
  }

  function formatResult(n) {
    const full  = indianFull.format(n);
    const short = (n >= 1e5) ? toShort(n) : null;
    return { full, short };
  }

  function updateResultCard(el, value) {
    if (!el) return;
    const { full, short } = formatResult(value);
    el.innerHTML = full + (short ? `<span class="result-short">${short}</span>` : '');
  }

  /* ── SYNC SLIDER ──────────────────────────────────────────── */
  if (tenureSlider) {
    tenureSlider.addEventListener('input', e => {
      tenureInput.value = e.target.value;
      tenureSlider.setAttribute('aria-valuenow', e.target.value);
      updateSliderTrack(tenureSlider);
      calculateEMI();
    });
  }

  if (tenureInput) {
    tenureInput.addEventListener('input', e => {
      const max = tenureTypeSelect && tenureTypeSelect.value === 'months' ? 360 : 30;
      let val = parseInt(e.target.value);
      if (isNaN(val) || val < 1) val = 1;
      if (val > max) val = max;
      e.target.value = val;
      if (tenureSlider) {
        tenureSlider.value = val;
        tenureSlider.setAttribute('aria-valuenow', val);
        updateSliderTrack(tenureSlider);
      }
      calculateEMI();
    });
  }

  if (tenureTypeSelect) {
    tenureTypeSelect.addEventListener('change', () => {
      const isMonths = tenureTypeSelect.value === 'months';
      if (tenureSlider) {
        tenureSlider.max = isMonths ? 360 : 30;
        tenureSlider.value = isMonths ? Math.min(parseInt(tenureSlider.value) * 12, 360) : Math.max(1, Math.round(parseInt(tenureSlider.value) / 12));
        tenureInput.value = tenureSlider.value;
        updateSliderTrack(tenureSlider);
      }
      calculateEMI();
    });
  }

  [loanAmountInput, interestRateInput, prepaymentInput].forEach(el => {
    if (el) el.addEventListener('input', calculateEMI);
  });

  /* ── LOAN TYPE PRESETS ────────────────────────────────────── */
  window.setLoanPreset = function(type) {
    const presets = {
      home:     { amount: 5000000, rate: 8.5,  tenure: 20, unit: 'years' },
      car:      { amount: 800000,  rate: 9.5,  tenure: 5,  unit: 'years' },
      personal: { amount: 300000,  rate: 14.0, tenure: 3,  unit: 'years' },
      education:{ amount: 1500000, rate: 10.5, tenure: 7,  unit: 'years' },
    };
    const p = presets[type];
    if (!p) return;

    if (loanAmountInput)   loanAmountInput.value   = p.amount;
    if (interestRateInput) interestRateInput.value  = p.rate;
    if (tenureTypeSelect)  tenureTypeSelect.value   = p.unit;
    if (tenureSlider) {
      tenureSlider.max   = p.unit === 'months' ? 360 : 30;
      tenureSlider.value = p.tenure;
      updateSliderTrack(tenureSlider);
    }
    if (tenureInput) tenureInput.value = p.tenure;

    // Highlight active preset button
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.preset-btn[data-type="${type}"]`);
    if (btn) btn.classList.add('active');

    calculateEMI();
  };

  /* ── EXPOSE GLOBALLY ──────────────────────────────────────── */
  window.calculateEMI = calculateEMI;

  /* ── MAIN CALCULATION ─────────────────────────────────────── */
  function calculateEMI() {
    const P            = parseFloat(loanAmountInput?.value)   || 0;
    const annualRate   = parseFloat(interestRateInput?.value) || 0;
    const tenureVal    = parseInt(tenureInput?.value)         || 0;
    const isMonths     = tenureTypeSelect?.value === 'months';
    const prepayment   = parseFloat(prepaymentInput?.value)   || 0;

    /* ── VALIDATION ── */
    if (P <= 0) {
      showError('Please enter a valid loan amount greater than ₹0.');
      resetDisplay(); return;
    }
    if (annualRate <= 0 || annualRate > 50) {
      showError('Interest rate must be between 0.1% and 50% per annum.');
      resetDisplay(); return;
    }
    if (tenureVal <= 0) {
      showError('Please enter a valid loan tenure.');
      resetDisplay(); return;
    }
    clearError();

    const n = isMonths ? tenureVal : tenureVal * 12;   // total months
    const r = annualRate / 100 / 12;                   // monthly rate

    /* ── EMI FORMULA ──────────────────────────────────────────
       EMI = P × r × (1+r)^n / ((1+r)^n − 1)
       Standard reducing-balance method used by all Indian banks
    ─────────────────────────────────────────────────────────── */
    const factor = Math.pow(1 + r, n);
    const emi    = P * r * factor / (factor - 1);

    if (!isFinite(emi) || emi <= 0) {
      showError('Could not calculate EMI. Please check your inputs.');
      resetDisplay(); return;
    }

    /* ── AMORTISATION SCHEDULE ── */
    let schedule   = [];
    let balance    = P;
    let totalPaid  = 0;
    let totalInt   = 0;
    let month      = 0;
    let actualEMI  = emi;

    while (balance > 0.5 && month < 600) {
      month++;
      const interestThisMonth   = balance * r;
      let   principalThisMonth  = actualEMI - interestThisMonth;

      // Apply prepayment at start of each year (month 12, 24, 36...)
      let extraPayment = 0;
      if (prepayment > 0 && month > 1 && (month - 1) % 12 === 0) {
        extraPayment = Math.min(prepayment, balance - principalThisMonth);
        if (extraPayment < 0) extraPayment = 0;
      }

      // Last payment adjustment
      if (principalThisMonth + extraPayment >= balance) {
        principalThisMonth = balance;
        extraPayment       = 0;
        actualEMI          = principalThisMonth + interestThisMonth;
      }

      balance    -= (principalThisMonth + extraPayment);
      totalPaid  += actualEMI + extraPayment;
      totalInt   += interestThisMonth;

      schedule.push({
        month,
        year               : Math.ceil(month / 12),
        monthOfYear        : month % 12 || 12,
        emi                : actualEMI,
        principal          : principalThisMonth,
        interest           : interestThisMonth,
        prepayment         : extraPayment,
        balance            : Math.max(0, balance),
        cumulativeInterest : totalInt,
        cumulativePrincipal: P - Math.max(0, balance),
      });

      if (balance <= 0.5) break;
    }

    const totalInterest = totalPaid - P;
    const actualMonths  = schedule.length;

    /* ── UPDATE RESULT CARDS ── */
    updateResultCard(emiValueDisplay,      emi);
    updateResultCard(totalInterestDisplay, totalInterest);
    updateResultCard(totalPaymentDisplay,  totalPaid);

    if (displayTenure) {
      const savedMonths = n - actualMonths;
      if (prepayment > 0 && savedMonths > 0) {
        const savedYrs = Math.floor(savedMonths / 12);
        const savedMo  = savedMonths % 12;
        displayTenure.textContent = actualMonths + ' months';
        const savingEl = document.getElementById('tenure-saving');
        if (savingEl) {
          savingEl.textContent = `⚡ Saves ${savedYrs > 0 ? savedYrs + 'y ' : ''}${savedMo > 0 ? savedMo + 'm' : ''} vs no prepayment`;
          savingEl.style.display = 'block';
        }
      } else {
        displayTenure.textContent = isMonths ? tenureVal + ' months' : tenureVal + ' years';
        const savingEl = document.getElementById('tenure-saving');
        if (savingEl) savingEl.style.display = 'none';
      }
    }

    /* ── CHART ── */
    updateDonut(P, totalInterest, totalPaid);
    if (chartPrincipalPercent) chartPrincipalPercent.textContent = ((P / totalPaid) * 100).toFixed(1) + '%';
    if (chartInterestPercent)  chartInterestPercent.textContent  = ((totalInterest / totalPaid) * 100).toFixed(1) + '%';
    if (chartPrincipalAmount)  chartPrincipalAmount.textContent  = toShort(P);
    if (chartInterestAmount)   chartInterestAmount.textContent   = toShort(totalInterest);

    /* ── STORE & DISPLAY SCHEDULE ── */
    window._emiSchedule = schedule;
    const activeBtn = document.querySelector('.schedule-controls button.active');
    const viewType  = activeBtn?.id === 'view-yearly' ? 'yearly' : 'monthly';
    displaySchedule(viewType, activeBtn);
  }

  /* ── SVG DONUT ────────────────────────────────────────────── */
  function updateDonut(principal, interest, total) {
    const donut = document.getElementById('donut-chart');
    if (!donut || total <= 0) return;

    const R    = 54;
    const CIRC = 2 * Math.PI * R;
    const prinPct = principal / total;
    const intPct  = interest  / total;

    const prinArc = prinPct * CIRC;
    const intArc  = intPct  * CIRC;

    const prinSlice = donut.querySelector('.donut-principal');
    const intSlice  = donut.querySelector('.donut-interest');
    const labelMain = donut.querySelector('.donut-label-main');
    const labelSub  = donut.querySelector('.donut-label-sub');

    if (prinSlice) {
      prinSlice.setAttribute('stroke-dasharray', `${prinArc} ${CIRC - prinArc}`);
      prinSlice.setAttribute('stroke-dashoffset', '0');
    }
    if (intSlice) {
      intSlice.setAttribute('stroke-dasharray', `${intArc} ${CIRC - intArc}`);
      intSlice.setAttribute('stroke-dashoffset', `${-prinArc}`);
    }
    if (labelMain) labelMain.textContent = toShort(total);
    if (labelSub)  labelSub.textContent  = 'Total Payable';
  }

  /* ── RESET ────────────────────────────────────────────────── */
  function resetDisplay() {
    [emiValueDisplay, totalInterestDisplay, totalPaymentDisplay].forEach(el => {
      if (el) el.textContent = '—';
    });
    if (chartPrincipalAmount) chartPrincipalAmount.textContent = '—';
    if (chartInterestAmount)  chartInterestAmount.textContent  = '—';
    if (scheduleTbody) scheduleTbody.innerHTML = '';
    if (scheduleThead) scheduleThead.innerHTML = '';
    window._emiSchedule = [];
  }

  /* ── ERROR ────────────────────────────────────────────────── */
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
  window.displaySchedule = function(viewType, button) {
    if (!scheduleTbody || !scheduleThead) return;
    scheduleTbody.innerHTML = '';
    document.querySelectorAll('.schedule-controls button').forEach(b => b.classList.remove('active'));
    if (button) button.classList.add('active');

    const schedule = window._emiSchedule || [];
    if (!schedule.length) return;

    if (viewType === 'monthly') {
      scheduleThead.innerHTML =
        '<th>Month</th><th>EMI</th><th>Principal</th><th>Interest</th><th>Balance</th>';
      schedule.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.month}</td>
          <td>${indianFull.format(row.emi)}</td>
          <td>${indianFull.format(row.principal)}</td>
          <td>${indianFull.format(row.interest)}</td>
          <td><strong>${indianFull.format(row.balance)}</strong></td>`;
        scheduleTbody.appendChild(tr);
      });
    } else {
      scheduleThead.innerHTML =
        '<th>Year</th><th>Principal Paid</th><th>Interest Paid</th><th>Total Paid</th><th>Balance</th>';
      const yrMap = {};
      schedule.forEach(row => {
        if (!yrMap[row.year]) yrMap[row.year] = { prin: 0, int: 0, total: 0, bal: 0 };
        yrMap[row.year].prin  += row.principal;
        yrMap[row.year].int   += row.interest;
        yrMap[row.year].total += row.emi + row.prepayment;
        yrMap[row.year].bal    = row.balance;
      });
      Object.entries(yrMap).forEach(([yr, d]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${yr}</td>
          <td>${indianFull.format(d.prin)}</td>
          <td>${indianFull.format(d.int)}</td>
          <td>${indianFull.format(d.total)}</td>
          <td><strong>${indianFull.format(d.bal)}</strong></td>`;
        scheduleTbody.appendChild(tr);
      });
    }
  };

  /* ── CSV DOWNLOAD ─────────────────────────────────────────── */
  window.downloadCSV = function() {
    const schedule = window._emiSchedule || [];
    if (!schedule.length) { alert('Please calculate EMI first!'); return; }
    let csv = 'Month,EMI,Principal,Interest,Prepayment,Balance\n';
    schedule.forEach(r => {
      csv += `${r.month},${r.emi.toFixed(2)},${r.principal.toFixed(2)},${r.interest.toFixed(2)},${r.prepayment.toFixed(2)},${r.balance.toFixed(2)}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'emi_schedule.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── FAQ TOGGLE ───────────────────────────────────────────── */
  window.toggleFAQ = function(btn) {
    const item   = btn.closest('.faq-item');
    const answer = btn.nextElementSibling;
    const icon   = btn.querySelector('.faq-icon');
    const isOpen = item.classList.contains('active');
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
      if (icon)   icon.textContent = '−';
    }
  };

  /* ── SLIDER TRACK FILL ────────────────────────────────────── */
  function updateSliderTrack(slider) {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--pct', pct + '%');
  }

  /* ── INITIAL CALC ─────────────────────────────────────────── */
  if (tenureSlider) updateSliderTrack(tenureSlider);
  calculateEMI();
});
