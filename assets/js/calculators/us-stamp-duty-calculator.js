/**
 * US Real Estate Transfer Tax (Stamp Duty) Calculator
 * 2026 State Rates — FairCalculator.com
 *
 * Sources: MultipleState Revenue Departments & IRS / HUD references
 * Rates current as of January 2026 (check with local recorder's office for city/county additions)
 */

'use strict';

// ─── 2026 State Transfer Tax Data ──────────────────────────────────────────
// rate   = state-level documentary/transfer tax rate (%)
// county = if true, county-level tax typically applies  (additive)
// notes  = short description
// noTax  = true if the state has NO statewide transfer tax

const US_STATE_RATES = {
  'AL': { name: 'Alabama', rate: 0.10, notes: '$0.50 per $500 of value' },
  'AK': { name: 'Alaska', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'AZ': { name: 'Arizona', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'AR': { name: 'Arkansas', rate: 0.33, notes: '3.3¢ per $100 of value' },
  'CA': { name: 'California', rate: 0.11, county: true, notes: '$1.10 per $1,000; cities may add extra' },
  'CO': { name: 'Colorado', rate: 0.01, notes: '$0.01 per $100; $0.01 flat (minimal)' },
  'CT': { name: 'Connecticut', rate: 0.75, notes: '0.75% standard; 1.25% above $800k; 2.25% above $2.5M' },
  'DE': { name: 'Delaware', rate: 2.00, notes: '2% state + 1.5% county typically' },
  'FL': { name: 'Florida', rate: 0.70, notes: '$0.70 per $100; $0.35 for single-family homestead' },
  'GA': { name: 'Georgia', rate: 0.10, notes: '$1 first $1k; $0.10 per $100 thereafter' },
  'HI': { name: 'Hawaii', rate: 0.10, notes: 'Graduated 0.10%–1.25% based on value' },
  'ID': { name: 'Idaho', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'IL': { name: 'Illinois', rate: 0.10, notes: '$0.50 per $500; Chicago adds $3.75 per $500' },
  'IN': { name: 'Indiana', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'IA': { name: 'Iowa', rate: 0.16, notes: '$1.60 per $1,000; exemptions for first-time buyers' },
  'KS': { name: 'Kansas', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'KY': { name: 'Kentucky', rate: 0.10, notes: '$0.50 per $500 of value' },
  'LA': { name: 'Louisiana', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'ME': { name: 'Maine', rate: 0.22, notes: '$2.20 per $1,000; split buyer/seller' },
  'MD': { name: 'Maryland', rate: 0.50, county: true, notes: '0.5% state + county 0.5–1.5%; first-time buyer exemptions apply' },
  'MA': { name: 'Massachusetts', rate: 0.456, notes: '$4.56 per $1,000' },
  'MI': { name: 'Michigan', rate: 0.75, notes: '$7.50 per $1,000 state; $1.10 per $1,000 county' },
  'MN': { name: 'Minnesota', rate: 0.33, notes: '$3.30 per $1,000; 0.001% minimum' },
  'MS': { name: 'Mississippi', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'MO': { name: 'Missouri', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'MT': { name: 'Montana', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'NE': { name: 'Nebraska', rate: 0.225, notes: '$2.25 per $1,000 of value' },
  'NV': { name: 'Nevada', rate: 0.13, notes: '$1.30 per $1,000; counties add $0.10–0.65 per $500' },
  'NH': { name: 'New Hampshire', rate: 0.75, notes: '$0.75 per $100; paid by both buyer & seller' },
  'NJ': { name: 'New Jersey', rate: 1.00, notes: '1% standard; 1.5% above $350k; 2% over $1M (buyers >$1M)' },
  'NM': { name: 'New Mexico', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'NY': { name: 'New York', rate: 0.40, notes: '$2 per $500 basic; +1% Mansion Tax on $1M+ residential' },
  'NC': { name: 'North Carolina', rate: 0.20, notes: '$2 per $1,000 of value' },
  'ND': { name: 'North Dakota', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'OH': { name: 'Ohio', rate: 0.10, notes: '$1 per $1,000 state; county adds $0.30–$3 per $1,000' },
  'OK': { name: 'Oklahoma', rate: 0.075, notes: '$0.75 per $1,000 of the sale price' },
  'OR': { name: 'Oregon', rate: 0.10, notes: '$1 per $1,000 state; cities may add extra (e.g. Portland 1.1%)' },
  'PA': { name: 'Pennsylvania', rate: 1.00, county: true, notes: '1% state + 1% local (most areas); Philadelphia 3.278% transfer agent' },
  'RI': { name: 'Rhode Island', rate: 0.46, notes: '$4.60 per $1,000 of value' },
  'SC': { name: 'South Carolina', rate: 0.37, notes: '$3.70 per $1,000 (deed recording fee)' },
  'SD': { name: 'South Dakota', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'TN': { name: 'Tennessee', rate: 0.037, notes: '$0.37 per $100; Nashville area has local additions' },
  'TX': { name: 'Texas', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'UT': { name: 'Utah', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'VT': { name: 'Vermont', rate: 1.25, notes: '1.25% under $100k; 1.45% above $100k; Land Gains Tax may apply' },
  'VA': { name: 'Virginia', rate: 0.25, notes: '$2.50 per $1,000; +0.15% state recordation' },
  'WA': { name: 'Washington', rate: 1.10, notes: 'Graduated 1.1%–3.0%; 1.1% up to $525k; 1.28% to $1.525M; 2.75% to $3.025M; 3% above' },
  'WV': { name: 'West Virginia', rate: 0.22, notes: '$2.20 per $1,000; split buyer/seller' },
  'WI': { name: 'Wisconsin', rate: 0.30, notes: '$3.00 per $1,000 of value' },
  'WY': { name: 'Wyoming', rate: 0, noTax: true, notes: 'No state transfer tax' },
  'DC': { name: 'Washington, D.C.', rate: 1.10, notes: '1.1% under $400k; 1.45% $400k–$2M; 2.2% above $2M' },
};

// ─── Washington State Graduated Rates ──────────────────────────────────────
function calcWashingtonTax(price) {
  const bands = [
    { max: 525000, rate: 0.011 },
    { max: 1525000, rate: 0.0128 },
    { max: 3025000, rate: 0.0275 },
    { max: Infinity, rate: 0.03 },
  ];
  let tax = 0;
  let prev = 0;
  for (const band of bands) {
    if (price <= prev) break;
    const taxable = Math.min(price, band.max) - prev;
    tax += taxable * band.rate;
    prev = band.max;
  }
  return tax;
}

// ─── DC Graduated Rates ────────────────────────────────────────────────────
function calcDCTax(price) {
  const bands = [
    { max: 400000, rate: 0.011 },
    { max: 2000000, rate: 0.0145 },
    { max: Infinity, rate: 0.022 },
  ];
  let tax = 0;
  let prev = 0;
  for (const band of bands) {
    if (price <= prev) break;
    const taxable = Math.min(price, band.max) - prev;
    tax += taxable * band.rate;
    prev = band.max;
  }
  return tax;
}

// ─── Connecticut Graduated Rates ───────────────────────────────────────────
function calcConnecticutTax(price) {
  // 0.75% up to $800k, 1.25% $800k–$2.5M, 2.25% above $2.5M
  if (price <= 800000) return price * 0.0075;
  if (price <= 2500000) return 800000 * 0.0075 + (price - 800000) * 0.0125;
  return 800000 * 0.0075 + 1700000 * 0.0125 + (price - 2500000) * 0.0225;
}

// ─── New Jersey Graduated ──────────────────────────────────────────────────
function calcNJTax(price, buyerType) {
  // Standard (seller pays 1%/1.5% depending on amount)
  // Buyer's mansion surtax applies for properties > $1M
  let tax;
  if (price <= 350000) tax = price * 0.01;
  else if (price <= 1000000) tax = 350000 * 0.01 + (price - 350000) * 0.015;
  else tax = 350000 * 0.01 + 650000 * 0.015 + (price - 1000000) * 0.01;
  return tax;
}

// ─── Hawaii Graduated ─────────────────────────────────────────────────────
function calcHawaiiTax(price) {
  const bands = [
    { max: 600000, rate: 0.001 },
    { max: 1000000, rate: 0.0015 },
    { max: 2000000, rate: 0.0025 },
    { max: 4000000, rate: 0.01 },
    { max: 6000000, rate: 0.01 },
    { max: 10000000, rate: 0.0125 },
    { max: Infinity, rate: 0.016 },
  ];
  let tax = 0; let prev = 0;
  for (const band of bands) {
    if (price <= prev) break;
    const taxable = Math.min(price, band.max) - prev;
    tax += taxable * band.rate;
    prev = band.max;
  }
  return tax;
}

// ─── NY Mansion Tax ────────────────────────────────────────────────────────
function calcNYMansionTax(price) {
  if (price < 1000000) return 0;
  const thresholds = [
    { min: 1000000, max: 1999999, rate: 0.01 },
    { min: 2000000, max: 2999999, rate: 0.0125 },
    { min: 3000000, max: 4999999, rate: 0.015 },
    { min: 5000000, max: 9999999, rate: 0.0225 },
    { min: 10000000, max: 14999999, rate: 0.0325 },
    { min: 15000000, max: 19999999, rate: 0.035 },
    { min: 20000000, max: 24999999, rate: 0.039 },
    { min: 25000000, max: Infinity, rate: 0.039 },
  ];
  for (const t of thresholds) {
    if (price >= t.min && price <= t.max) return price * t.rate;
  }
  return price * 0.039;
}

// ─── Main Tax Calculation ─────────────────────────────────────────────────
function calculateTransferTax(price, stateCode, buyerType) {
  const stateData = US_STATE_RATES[stateCode];
  if (!stateData) return null;

  let stateTax = 0;
  let mansionTax = 0;
  let countyEstimate = 0;
  const rows = [];

  // Handle no-tax states
  if (stateData.noTax) {
    return {
      stateTax: 0,
      mansionTax: 0,
      countyEstimate: 0,
      totalTax: 0,
      effectiveRate: 0,
      rows: [],
      noTax: true,
      notes: stateData.notes,
    };
  }

  // Graduated / special states
  if (stateCode === 'WA') {
    stateTax = calcWashingtonTax(price);
    rows.push({ band: 'Graduated Bands', rate: '1.1%–3.0%', taxable: fmtCurrency(price), tax: fmtCurrency(stateTax) });
  } else if (stateCode === 'DC') {
    stateTax = calcDCTax(price);
    rows.push({ band: 'Graduated Bands', rate: '1.1%–2.2%', taxable: fmtCurrency(price), tax: fmtCurrency(stateTax) });
  } else if (stateCode === 'CT') {
    stateTax = calcConnecticutTax(price);
    rows.push({ band: 'Graduated Bands', rate: '0.75%–2.25%', taxable: fmtCurrency(price), tax: fmtCurrency(stateTax) });
  } else if (stateCode === 'NJ') {
    stateTax = calcNJTax(price, buyerType);
    rows.push({ band: 'State Transfer Tax', rate: '1.0%–1.5%', taxable: fmtCurrency(price), tax: fmtCurrency(stateTax) });
  } else if (stateCode === 'HI') {
    stateTax = calcHawaiiTax(price);
    rows.push({ band: 'Graduated Bands', rate: '0.1%–1.6%', taxable: fmtCurrency(price), tax: fmtCurrency(stateTax) });
  } else {
    stateTax = price * (stateData.rate / 100);
    rows.push({
      band: 'State Transfer Tax',
      rate: stateData.rate.toFixed(3).replace(/\.?0+$/, '') + '%',
      taxable: fmtCurrency(price),
      tax: fmtCurrency(stateTax),
    });
  }

  // NY Mansion Tax
  if (stateCode === 'NY' && price >= 1000000) {
    mansionTax = calcNYMansionTax(price);
    rows.push({
      band: 'Mansion Tax (NYC/NY)',
      rate: '1.0%–3.9%',
      taxable: fmtCurrency(price),
      tax: fmtCurrency(mansionTax),
    });
  }

  // County/local estimate for states with notable county taxes
  const countyRates = { CA: 0.11, MD: 0.75, MI: 0.11, OH: 0.15, PA: 1.00 };
  if (countyRates[stateCode]) {
    countyEstimate = price * (countyRates[stateCode] / 100);
    rows.push({
      band: 'Typical County/Local Tax (est.)',
      rate: countyRates[stateCode].toFixed(2) + '%',
      taxable: fmtCurrency(price),
      tax: '~' + fmtCurrency(countyEstimate),
    });
  }

  const totalTax = stateTax + mansionTax + countyEstimate;
  const effectiveRate = price > 0 ? (totalTax / price) * 100 : 0;

  return {
    stateTax,
    mansionTax,
    countyEstimate,
    totalTax,
    effectiveRate,
    rows,
    noTax: false,
    notes: stateData.notes,
  };
}

// ─── Formatting Helpers ────────────────────────────────────────────────────
function fmtCurrency(n) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNumber(n) {
  return n.toLocaleString('en-US');
}
function parsePrice(str) {
  return parseFloat(str.replace(/[,$\s]/g, ''));
}

// ─── DOM References ───────────────────────────────────────────────────────
const priceInput = document.getElementById('propertyPrice');
const stateSelect = document.getElementById('stateSelect');
const calcBtn = document.getElementById('usCalcBtn');
const errorEl = document.getElementById('usError');
const resultsEl = document.getElementById('usResults');
const noTaxBanner = document.getElementById('noTaxBanner');

// Result display
const totalTaxEl = document.getElementById('totalTaxDisplay');
const effRateEl = document.getElementById('effRateDisplay');
const statePriceEl = document.getElementById('statePriceDisplay');
const stateTaxEl = document.getElementById('stateTaxDisplay');
const mansionEl = document.getElementById('mansionDisplay');
const countyEl = document.getElementById('countyDisplay');
const totalRowEl = document.getElementById('totalRowDisplay');
const breakdownBody = document.getElementById('breakdownBody');
const stateNotesEl = document.getElementById('stateNotes');

// ─── Populate State Dropdown ───────────────────────────────────────────────
function populateStateDropdown() {
  const sorted = Object.entries(US_STATE_RATES).sort((a, b) =>
    a[1].name.localeCompare(b[1].name)
  );
  for (const [code, data] of sorted) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = data.name + (data.noTax ? ' (No Transfer Tax)' : '');
    stateSelect.appendChild(opt);
  }
}

// ─── Populate Rate Reference Table ─────────────────────────────────────────
function populateRatesGrid() {
  const tbody = document.getElementById('ratesGrid');
  if (!tbody) return;
  const sorted = Object.entries(US_STATE_RATES).sort((a, b) =>
    a[1].name.localeCompare(b[1].name)
  );
  sorted.forEach(([code, data], i) => {
    const tr = document.createElement('tr');
    tr.style.background = i % 2 === 0 ? '#f8fafc' : '#fff';

    // Rate badge styling
    let badgeStyle, rateText;
    if (data.noTax) {
      badgeStyle = 'background:#f1f5f9;color:#64748b;';
      rateText = 'None';
    } else if (data.rate >= 1.0) {
      badgeStyle = 'background:#fee2e2;color:#991b1b;';
      rateText = data.rate.toFixed(2).replace(/\.?0+$/, '') + '%';
    } else if (data.rate >= 0.5) {
      badgeStyle = 'background:#fef9c3;color:#854d0e;';
      rateText = data.rate.toFixed(3).replace(/\.?0+$/, '') + '%';
    } else {
      badgeStyle = 'background:#dbeafe;color:#1d4ed8;';
      rateText = data.rate === 0 ? 'None' : data.rate.toFixed(3).replace(/\.?0+$/, '') + '%';
    }

    tr.innerHTML = `
      <td style="padding:10px 14px; font-weight:600; white-space:nowrap; border-bottom:1px solid #f1f5f9;">${data.name}</td>
      <td style="padding:10px 14px; border-bottom:1px solid #f1f5f9;">
        <span style="${badgeStyle} padding:2px 8px; border-radius:6px; font-weight:700; font-size:0.8rem;">${rateText}</span>
      </td>
      <td style="padding:10px 14px; color:#475569; border-bottom:1px solid #f1f5f9; font-size:0.85rem;">${data.notes}</td>`;
    tbody.appendChild(tr);
  });
}

// ─── Format price input with commas ───────────────────────────────────────
priceInput && priceInput.addEventListener('input', function () {
  const raw = this.value.replace(/[^0-9]/g, '');
  if (raw) this.value = parseInt(raw, 10).toLocaleString('en-US');
  else this.value = '';
});

// ─── Calculate ────────────────────────────────────────────────────────────
function calculate() {
  const priceStr = priceInput ? priceInput.value : '';
  const price = parsePrice(priceStr);
  const stateCode = stateSelect ? stateSelect.value : '';

  // Validation
  if (!stateCode) {
    showError('Please select a state.');
    return;
  }
  if (isNaN(price) || price <= 0) {
    showError('Please enter a valid property price greater than $0.');
    return;
  }
  if (price > 1000000000) {
    showError('Please enter a realistic property price (under $1 billion).');
    return;
  }
  hideError();

  const buyerType = document.querySelector('input[name="buyerType"]:checked')?.value || 'standard';
  const result = calculateTransferTax(price, stateCode, buyerType);

  if (!result) {
    showError('Could not calculate transfer tax for the selected state.');
    return;
  }

  displayResults(price, stateCode, result);
}

// ─── Display Results ───────────────────────────────────────────────────────
function displayResults(price, stateCode, result) {
  // No-tax states
  if (result.noTax) {
    noTaxBanner.className = 'no-tax-banner show';
    noTaxBanner.innerHTML = `<i class="fas fa-check-circle" style="color:#16a34a;font-size:1.2rem;"></i>
      <div><strong>${US_STATE_RATES[stateCode].name} has no statewide real estate transfer tax in 2026.</strong><br>
      ${result.notes}. Local city/county fees may still apply — check with your county recorder's office.</div>`;
    resultsEl.className = 'us-results';
    return;
  }

  noTaxBanner.className = 'no-tax-banner';

  // Fill header
  if (totalTaxEl) totalTaxEl.textContent = fmtCurrency(result.totalTax);
  if (effRateEl) effRateEl.textContent = `Effective rate: ${result.effectiveRate.toFixed(3)}%`;

  // Stats
  if (statePriceEl) statePriceEl.textContent = fmtCurrency(price);
  if (stateTaxEl) stateTaxEl.textContent = fmtCurrency(result.stateTax);
  if (mansionEl) {
    const mansionCard = mansionEl.closest('.stat-card');
    if (result.mansionTax > 0) {
      mansionEl.textContent = fmtCurrency(result.mansionTax);
      if (mansionCard) mansionCard.style.display = '';
    } else {
      if (mansionCard) mansionCard.style.display = 'none';
    }
  }
  if (countyEl) {
    const countyCard = countyEl.closest('.stat-card');
    if (result.countyEstimate > 0) {
      countyEl.textContent = '~' + fmtCurrency(result.countyEstimate);
      if (countyCard) countyCard.style.display = '';
    } else {
      if (countyCard) countyCard.style.display = 'none';
    }
  }
  if (totalRowEl) totalRowEl.textContent = fmtCurrency(result.totalTax);

  // Breakdown rows
  if (breakdownBody) {
    breakdownBody.innerHTML = '';
    for (const row of result.rows) {
      const tr = document.createElement('tr');
      if (row.tax === '$0.00' || row.tax === '~$0.00') tr.className = 'zero-row';
      tr.innerHTML = `<td>${row.band}</td>
        <td><span class="tax-badge">${row.rate}</span></td>
        <td>${row.taxable}</td>
        <td>${row.tax}</td>`;
      breakdownBody.appendChild(tr);
    }
    // Totals row
    const trTotal = document.createElement('tr');
    trTotal.innerHTML = `<td colspan="3"><strong>Total Estimated Transfer Tax</strong></td>
      <td><strong>${fmtCurrency(result.totalTax)}</strong></td>`;
    breakdownBody.appendChild(trTotal);
  }

  // State notes
  if (stateNotesEl) {
    stateNotesEl.textContent = result.notes || '';
  }

  // Show
  resultsEl.className = 'us-results show';
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Error Helpers ────────────────────────────────────────────────────────
function showError(msg) {
  if (errorEl) { errorEl.textContent = msg; errorEl.className = 'us-error show'; }
  if (resultsEl) resultsEl.className = 'us-results';
}
function hideError() {
  if (errorEl) errorEl.className = 'us-error';
}

// ─── FAQ Accordion ────────────────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-question').forEach(b => {
        b.classList.remove('open');
        b.nextElementSibling.classList.remove('open');
      });
      if (!isOpen) {
        btn.classList.add('open');
        answer.classList.add('open');
      }
    });
  });
}

// ─── Event Listener ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateStateDropdown();
  populateRatesGrid();
  initFAQ();
  if (calcBtn) calcBtn.addEventListener('click', calculate);
  if (priceInput) priceInput.addEventListener('keydown', e => { if (e.key === 'Enter') calculate(); });
});
