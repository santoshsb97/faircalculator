/* BMI Calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const heightUnitSelect = document.getElementById('heightUnit');
    const weightUnitSelect = document.getElementById('weightUnit');
    const heightContainer = document.getElementById('heightInputContainer');
    const weightContainer = document.getElementById('weightInputContainer');
    const calculateBtn = document.getElementById('calculateBtn');

    // Result Elements
    const resultContainer = document.getElementById('resultContainer');
    const bmiValueEl = document.getElementById('bmiValue');
    const bmiCategoryEl = document.getElementById('bmiCategory');
    const bmiMarker = document.getElementById('bmiMarker');
    const healthyRangeEl = document.getElementById('healthyRange');

    // Search Hiding Logic
    const searchInput = document.getElementById('searchInput');
    const toolContainer = document.getElementById('tool-container');
    if (searchInput && toolContainer) {
        searchInput.addEventListener('input', (e) => {
            toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
        });
    }

    // Table Rows
    const rows = {
        under: document.getElementById('row-under'),
        normal: document.getElementById('row-normal'),
        over: document.getElementById('row-over'),
        obese1: document.getElementById('row-obese1'),
        obese2: document.getElementById('row-obese2'),
        obese3: document.getElementById('row-obese3')
    };

    // --- 1. RENDER INPUT FIELDS ---
    function renderHeightInputs() {
        const unit = heightUnitSelect.value;
        let html = '';

        if (unit === 'cm') {
            html = `<input type="number" id="h_val1" class="input-field" placeholder="e.g. 175" step="1">`;
        } else if (unit === 'ft_in') {
            html = `
            <div class="dual-input-container">
                <div class="dual-input-wrapper">
                    <input type="number" id="h_val1" placeholder="5" step="1">
                    <span class="input-suffix">ft</span>
                </div>
                <div class="dual-input-wrapper">
                    <input type="number" id="h_val2" placeholder="9" step="1">
                    <span class="input-suffix">in</span>
                </div>
            </div>`;
        } else if (unit === 'ft') {
            html = `<div class="dual-input-wrapper"><input type="number" id="h_val1" class="input-field" placeholder="e.g. 5.9" step="0.1"><span class="input-suffix">ft</span></div>`;
        } else if (unit === 'in') {
            html = `<div class="dual-input-wrapper"><input type="number" id="h_val1" class="input-field" placeholder="e.g. 70" step="0.1"><span class="input-suffix">in</span></div>`;
        }
        heightContainer.innerHTML = html;
        resultContainer.style.display = 'none';
    }

    function renderWeightInputs() {
        const unit = weightUnitSelect.value;
        let html = '';

        if (unit === 'kg') {
            html = `<input type="number" id="w_val1" class="input-field" placeholder="e.g. 70" step="0.1">`;
        } else if (unit === 'lb') {
            html = `<div class="dual-input-wrapper"><input type="number" id="w_val1" class="input-field" placeholder="e.g. 154" step="0.1"><span class="input-suffix">lb</span></div>`;
        } else if (unit === 'st_lb') {
            html = `
            <div class="dual-input-container">
                <div class="dual-input-wrapper">
                    <input type="number" id="w_val1" placeholder="11" step="1">
                    <span class="input-suffix">st</span>
                </div>
                <div class="dual-input-wrapper">
                    <input type="number" id="w_val2" placeholder="4" step="1">
                    <span class="input-suffix">lb</span>
                </div>
            </div>`;
        }
        weightContainer.innerHTML = html;
        resultContainer.style.display = 'none';
    }

    // --- 2. GET NORMALIZED VALUES ---
    function getHeightInMeters() {
        const unit = heightUnitSelect.value;
        const val1 = parseFloat(document.getElementById('h_val1')?.value || 0);
        const val2 = parseFloat(document.getElementById('h_val2')?.value || 0);

        if (unit === 'cm') return val1 / 100;
        if (unit === 'ft_in') return ((val1 * 12) + val2) * 0.0254;
        if (unit === 'ft') return val1 * 0.3048;
        if (unit === 'in') return val1 * 0.0254;
        return 0;
    }

    function getWeightInKg() {
        const unit = weightUnitSelect.value;
        const val1 = parseFloat(document.getElementById('w_val1')?.value || 0);
        const val2 = parseFloat(document.getElementById('w_val2')?.value || 0);

        if (unit === 'kg') return val1;
        if (unit === 'lb') return val1 * 0.453592;
        if (unit === 'st_lb') return ((val1 * 14) + val2) * 0.453592;
        return 0;
    }

    // --- 3. FORMAT WEIGHT (For Ranges) ---
    function formatWeightRange(minKg, maxKg) {
        const unit = weightUnitSelect.value;

        if (unit === 'kg') {
            return `${minKg.toFixed(1)} - ${maxKg.toFixed(1)} kg`;
        } else if (unit === 'lb') {
            const minLb = minKg * 2.20462;
            const maxLb = maxKg * 2.20462;
            return `${minLb.toFixed(0)} - ${maxLb.toFixed(0)} lbs`;
        } else if (unit === 'st_lb') {
            const minTotalLbs = minKg * 2.20462;
            const maxTotalLbs = maxKg * 2.20462;

            const minSt = Math.floor(minTotalLbs / 14);
            const minLbRem = Math.round(minTotalLbs % 14);

            const maxSt = Math.floor(maxTotalLbs / 14);
            const maxLbRem = Math.round(maxTotalLbs % 14);

            return `${minSt}st ${minLbRem}lb - ${maxSt}st ${maxLbRem}lb`;
        }
    }

    // --- 4. CALCULATION ---
    calculateBtn.addEventListener('click', () => {
        const heightM = getHeightInMeters();
        const weightKg = getWeightInKg();

        if (heightM <= 0 || weightKg <= 0) {
            alert("Please enter valid positive numbers.");
            return;
        }

        // BMI Formula
        const bmi = weightKg / (heightM * heightM);
        const roundedBmi = bmi.toFixed(1);

        // Highlight Table Row Logic
        // Reset all rows
        Object.values(rows).forEach(r => r.classList.remove('active-row'));

        let category = '', color = '';
        if (bmi < 18.5) {
            category = 'Underweight'; color = '#3498db';
            rows.under.classList.add('active-row');
        } else if (bmi < 25) {
            category = 'Normal Weight'; color = '#2ecc71';
            rows.normal.classList.add('active-row');
        } else if (bmi < 30) {
            category = 'Overweight'; color = '#f1c40f';
            rows.over.classList.add('active-row');
        } else if (bmi < 35) {
            category = 'Obesity Class I'; color = '#e67e22';
            rows.obese1.classList.add('active-row');
        } else if (bmi < 40) {
            category = 'Obesity Class II'; color = '#e74c3c';
            rows.obese2.classList.add('active-row');
        } else {
            category = 'Obesity Class III'; color = '#c0392b';
            rows.obese3.classList.add('active-row');
        }

        // Healthy Range (18.5 - 24.9)
        const minKg = 18.5 * heightM * heightM;
        const maxKg = 24.9 * heightM * heightM;
        const rangeText = formatWeightRange(minKg, maxKg);

        // Update UI
        bmiValueEl.textContent = roundedBmi;
        bmiCategoryEl.textContent = category;
        bmiCategoryEl.style.color = color;
        healthyRangeEl.textContent = rangeText;

        // Gauge Position (Range 15 to 40 = 25 units)
        let percent = ((bmi - 15) / 25) * 100;
        if (percent < 0) percent = 0;
        if (percent > 100) percent = 100;
        bmiMarker.style.left = `${percent}%`;

        resultContainer.style.display = 'block';
        if (window.innerWidth < 768) {
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    // Listeners
    heightUnitSelect.addEventListener('change', renderHeightInputs);
    weightUnitSelect.addEventListener('change', renderWeightInputs);

    // Init
    renderHeightInputs();
    renderWeightInputs();
});
