/* ═══════════════════════════════════════════════
   Margin Calculator – Logic
   FairCalculator.com
═══════════════════════════════════════════════ */

'use strict';

/* ── Constants ───────────────────────────────── */
const MIN_MARGIN = 0;
const MAX_MARGIN = 100;
const MAX_SAFE_VALUE = 1e12; // 1 trillion
const PRICE_VARIATIONS = [0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3];

/* ── State ───────────────────────────────────── */
let currentMode = 'margin';
let _debounceTimer;

/* ── DOM cache (populated on DOMContentLoaded) ── */
const $ = id => document.getElementById(id);

/* ── Mode Switcher ────────────────────────────── */
function setMode(mode) {
    currentMode = mode;

    ['margin', 'markup', 'revenue'].forEach(m => {
        $('panel' + cap(m)).style.display = m === mode ? '' : 'none';
        $('tab' + cap(m)).classList.toggle('active', m === mode);
    });

    const presets = document.querySelector('.mc-presets');
    if (presets) presets.style.display = mode === 'margin' ? '' : 'none';

    resetEquation();
    hideBreakdown();
    $('mcComparison').style.display = 'none';
    $('mcError').textContent = '';
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Debounced auto-calculate ─────────────────── */
function debouncedCalculate() {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(calculate, 300);
}

/* ── Preset buttons ──────────────────────────── */
function applyMarginPreset(pct) {
    const cost = parseFloat($('cost').value);
    if (!isNaN(cost) && cost > 0) {
        $('revenue').value = (cost / (1 - pct / 100)).toFixed(2);
        debouncedCalculate();
    }
}

/* ── Input sanitisation ──────────────────────── */
function safeNum(id) {
    const v = parseFloat($(id).value);
    if (!isFinite(v) || v > MAX_SAFE_VALUE) return NaN;
    return v;
}

/* ── Main Calculate ──────────────────────────── */
/**
 * Calculates gross margin, net margin, markup and updates the UI.
 * Reads inputs from the active mode panel.
 */
function calculate() {
    const errEl = $('mcError');
    errEl.textContent = '';
    hideBreakdown();

    let cost, revenue, grossProfit, grossMargin, markup;
    let netProfit = null, netMargin = null;

    /* ── Margin Mode ── */
    if (currentMode === 'margin') {
        cost = safeNum('cost');
        revenue = safeNum('revenue');
        const taxRate = Math.max(0, Math.min(100, safeNum('taxRate') || 0));

        if (isNaN(cost) || isNaN(revenue))
            return errEl.textContent = 'Please enter a valid cost and revenue.';
        if (cost < 0 || revenue < 0)
            return errEl.textContent = 'Values must be positive.';
        if (revenue === 0)
            return errEl.textContent = 'Revenue cannot be zero — division by zero.';

        grossProfit = revenue - cost;
        grossMargin = (grossProfit / revenue) * 100;
        markup = cost > 0 ? (grossProfit / cost) * 100 : 0;

        if (taxRate > 0) {
            const taxAmount = grossProfit > 0 ? grossProfit * (taxRate / 100) : 0;
            netProfit = grossProfit - taxAmount;
            netMargin = (netProfit / revenue) * 100;
        }

        if (cost > revenue)
            errEl.textContent = '⚠ Cost exceeds revenue — negative margin.';
    }

    /* ── Markup Mode ── */
    else if (currentMode === 'markup') {
        cost = safeNum('mkCost');
        const mkup = safeNum('mkMarkup');

        if (isNaN(cost) || isNaN(mkup))
            return errEl.textContent = 'Please enter a valid cost and markup %.';
        if (cost < 0 || mkup < 0)
            return errEl.textContent = 'Values must be positive.';

        revenue = cost * (1 + mkup / 100);
        grossProfit = revenue - cost;
        grossMargin = (grossProfit / revenue) * 100;
        markup = mkup;
    }

    /* ── Revenue Mode ── */
    else {
        const targetMargin = safeNum('rvMargin');
        revenue = safeNum('rvRevenue');

        if (isNaN(targetMargin) || isNaN(revenue))
            return errEl.textContent = 'Please enter a valid margin % and revenue.';
        if (targetMargin <= MIN_MARGIN || targetMargin >= MAX_MARGIN)
            return errEl.textContent = 'Margin must be between 0 and 100%.';
        if (revenue <= 0)
            return errEl.textContent = 'Revenue must be a positive number.';

        cost = revenue * (1 - targetMargin / 100);
        grossProfit = revenue - cost;
        grossMargin = targetMargin;
        markup = (grossProfit / cost) * 100;
    }

    /* ── Update equation row ── */
    setText('eqCost', fmtCur(cost));
    setText('eqProfit', fmtCur(grossProfit));
    setText('eqRevenue', fmtCur(revenue));
    setText('eqMargin', fmt(grossMargin, '%'));

    /* ── Announcement for screen readers ── */
    const live = $('mcLiveRegion');
    if (live) live.textContent =
        `Gross margin ${fmt(grossMargin, '%')}, Gross profit ${fmtCur(grossProfit)}, Markup ${fmt(markup, '%')}`;

    /* ── Breakdown cards ── */
    const cards = [];
    if (currentMode !== 'markup') {
        cards.push({ label: 'Markup %', value: fmt(markup, '%'), cls: 'mc-purple' });
    }
    if (netProfit !== null) {
        cards.push({ label: 'Net Profit', value: fmtCur(netProfit), cls: 'mc-green' });
        cards.push({ label: 'Net Margin', value: fmt(netMargin, '%'), cls: 'mc-highlight' });
    }

    showBreakdown(cards);
    buildComparisonTable(cost, revenue);
}

/* ── Equation Row ────────────────────────────── */
function resetEquation() {
    setText('eqCost', '$0.00');
    setText('eqProfit', '$0.00');
    setText('eqRevenue', '$0.00');
    setText('eqMargin', '0.00%');
}

/* ── Breakdown Cards ─────────────────────────── */
function showBreakdown(cards) {
    const section = $('breakdownSection');
    const grid = $('breakdownGrid');
    grid.innerHTML = '';

    cards.forEach(c => {
        const div = document.createElement('div');
        div.className = 'mc-breakdown-card ' + (c.cls || '');
        // Values are generated by our own fmt/fmtCur functions — safe, no XSS risk
        div.innerHTML = `<div class="mc-breakdown-label">${c.label}</div>
                     <div class="mc-breakdown-value">${c.value}</div>`;
        grid.appendChild(div);
    });

    if (cards.length === 1) {
        grid.style.gridTemplateColumns = '1fr';
        grid.style.maxWidth = '33%';
        grid.style.margin = '0 auto';
    } else {
        grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        grid.style.maxWidth = '';
        grid.style.margin = '';
    }
    section.style.display = '';
}

function hideBreakdown() {
    $('breakdownSection').style.display = 'none';
    $('breakdownGrid').innerHTML = '';
}

/* ── Comparison Table ────────────────────────── */
function buildComparisonTable(cost, baseRevenue) {
    $('mcComparison').style.display = '';
    const tbody = $('mcCompBody');
    tbody.innerHTML = '';

    PRICE_VARIATIONS.forEach(m => {
        const price = baseRevenue * m;
        const profit = price - cost;
        const margin = price > 0 ? (profit / price) * 100 : 0;
        const mkup = cost > 0 ? (profit / cost) * 100 : 0;
        const isBase = Math.abs(price - baseRevenue) < 0.01;

        const tr = document.createElement('tr');
        if (isBase) tr.className = 'mc-highlight-row';
        // fmtCur / fmt are own utility functions — no user-controlled strings injected
        tr.innerHTML = `
      <td>${fmtCur(price)}${isBase ? ' ★' : ''}</td>
      <td>${fmtCur(profit)}</td>
      <td class="${margin >= 0 ? 'mc-pos' : 'mc-neg'}">${fmt(margin, '%')}</td>
      <td class="${mkup >= 0 ? 'mc-pos' : 'mc-neg'}">${fmt(mkup, '%')}</td>`;
        tbody.appendChild(tr);
    });
}

/* ── Helpers ─────────────────────────────────── */
function fmtCur(n) {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n);
}

function fmt(n, suffix = '') {
    if (!isFinite(n)) return '—';
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(n) + suffix;
}

function setText(id, val) {
    const el = $(id);
    if (el) el.textContent = val;
}

/* ── FAQ toggle ──────────────────────────────── */
function toggleFAQ(el) {
    const answer = el.nextElementSibling;
    const toggle = el.querySelector('.faq-toggle');
    const isOpen = answer.style.display === 'block';
    answer.style.display = isOpen ? 'none' : 'block';
    if (toggle) toggle.textContent = isOpen ? '+' : '−';
}

/* ── DOMContentLoaded setup ──────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Auto-calculate on input change (debounced)
    document.querySelectorAll('.input-field').forEach(input => {
        input.addEventListener('input', debouncedCalculate);
    });

    // Enter key triggers calculation
    document.addEventListener('keydown', e => {
        if (e.key === 'Enter') calculate();
    });
});
