/* calorie-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // Elements
            const heightUnitSelect = document.getElementById('heightUnit');
            const weightUnitSelect = document.getElementById('weightUnit');
            const heightContainer = document.getElementById('heightInputContainer');
            const weightContainer = document.getElementById('weightInputContainer');
            const calculateBtn = document.getElementById('calculateBtn');

            // Result Elements
            const resultContainer = document.getElementById('resultContainer');
            const resMaintain = document.getElementById('resMaintain');
            const resLossMild = document.getElementById('resLossMild');
            const resLoss = document.getElementById('resLoss');
            const resGain = document.getElementById('resGain');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // --- 1. Render Inputs ---
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
                }
                weightContainer.innerHTML = html;
                resultContainer.style.display = 'none';
            }

            // --- 2. Normalize Data ---
            function getHeightCm() {
                const unit = heightUnitSelect.value;
                const v1 = parseFloat(document.getElementById('h_val1')?.value || 0);
                const v2 = parseFloat(document.getElementById('h_val2')?.value || 0);

                if (unit === 'cm') return v1;
                if (unit === 'ft_in') return ((v1 * 12) + v2) * 2.54;
                return 0;
            }

            function getWeightKg() {
                const unit = weightUnitSelect.value;
                const v1 = parseFloat(document.getElementById('w_val1')?.value || 0);

                if (unit === 'kg') return v1;
                if (unit === 'lb') return v1 * 0.453592;
                return 0;
            }

            // --- 3. Calculation ---
            calculateBtn.addEventListener('click', () => {
                const age = parseFloat(document.getElementById('age').value);
                const gender = document.getElementById('gender').value;
                const activity = parseFloat(document.getElementById('activity').value);

                const heightCm = getHeightCm();
                const weightKg = getWeightKg();

                // Validation
                if (isNaN(age) || age <= 0 || heightCm <= 0 || weightKg <= 0) {
                    alert('Please enter valid positive numbers for all fields.');
                    return;
                }

                // Mifflin-St Jeor Equation
                let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);

                if (gender === 'male') {
                    bmr += 5;
                } else {
                    bmr -= 161;
                }

                const tdee = bmr * activity;

                // Update UI
                resMaintain.textContent = Math.round(tdee);
                resLossMild.textContent = Math.round(tdee - 250);
                resLoss.textContent = Math.round(tdee - 500);
                resGain.textContent = Math.round(tdee + 250);

                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });

            // Initialize
            heightUnitSelect.addEventListener('change', renderHeightInputs);
            weightUnitSelect.addEventListener('change', renderWeightInputs);
            renderHeightInputs();
            renderWeightInputs();
        });