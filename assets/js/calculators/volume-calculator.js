/* volume-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            const shapeType = document.getElementById('shapeType');
            const inputFields = document.getElementById('inputFields');
            const calculateBtn = document.getElementById('calculateBtn');
            const resultContainer = document.getElementById('resultContainer');
            const resultElement = document.getElementById('result');
            const formulaElement = document.getElementById('formula');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            // 3D Shape Definitions
            const shapes = {
                cube: {
                    inputs: [{ name: 'side', label: 'Side Length (a)', placeholder: '5' }]
                },
                box: {
                    inputs: [
                        { name: 'length', label: 'Length (l)', placeholder: '10' },
                        { name: 'width', label: 'Width (w)', placeholder: '5' },
                        { name: 'height', label: 'Height (h)', placeholder: '4' }
                    ]
                },
                sphere: {
                    inputs: [{ name: 'radius', label: 'Radius (r)', placeholder: '5' }]
                },
                cylinder: {
                    inputs: [
                        { name: 'radius', label: 'Radius (r)', placeholder: '5' },
                        { name: 'height', label: 'Height (h)', placeholder: '10' }
                    ]
                },
                cone: {
                    inputs: [
                        { name: 'radius', label: 'Radius (r)', placeholder: '5' },
                        { name: 'height', label: 'Height (h)', placeholder: '10' }
                    ]
                }
            };

            // Render Inputs
            function updateInputs() {
                const shape = shapes[shapeType.value];
                inputFields.innerHTML = '';
                resultContainer.style.display = 'none';

                shape.inputs.forEach(input => {
                    const div = document.createElement('div');
                    div.className = 'input-wrapper';
                    div.innerHTML = `
                    <label class="input-label" for="${input.name}">${input.label}</label>
                    <input type="number" id="${input.name}" class="input-field" placeholder="e.g., ${input.placeholder}" step="any" min="0">
                `;
                    inputFields.appendChild(div);
                });
            }

            shapeType.addEventListener('change', updateInputs);
            updateInputs(); // Init

            // Add Enter Key Support
            inputFields.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') calculateBtn.click();
            });

            // Calculation Logic
            calculateBtn.addEventListener('click', () => {
                const shape = shapeType.value;
                let volume = 0, formula = "";
                let isValid = true;

                const getVal = (id) => {
                    const val = parseFloat(document.getElementById(id).value);
                    if (isNaN(val) || val < 0) isValid = false;
                    return val;
                };

                if (shape === 'cube') {
                    const s = getVal('side');
                    if (isValid) {
                        volume = Math.pow(s, 3);
                        formula = `V = side³ <br> V = ${s}³ = ${volume.toFixed(4)}`;
                    }
                }
                else if (shape === 'box') {
                    const l = getVal('length');
                    const w = getVal('width');
                    const h = getVal('height');
                    if (isValid) {
                        volume = l * w * h;
                        formula = `V = l × w × h <br> V = ${l} × ${w} × ${h} = ${volume.toFixed(4)}`;
                    }
                }
                else if (shape === 'sphere') {
                    const r = getVal('radius');
                    if (isValid) {
                        volume = (4 / 3) * Math.PI * Math.pow(r, 3);
                        formula = `V = (4/3) × π × r³ <br> V = 1.33 × 3.1415 × ${r}³ = ${volume.toFixed(4)}`;
                    }
                }
                else if (shape === 'cylinder') {
                    const r = getVal('radius');
                    const h = getVal('height');
                    if (isValid) {
                        volume = Math.PI * Math.pow(r, 2) * h;
                        formula = `V = π × r² × h <br> V = 3.1415 × ${r}² × ${h} = ${volume.toFixed(4)}`;
                    }
                }
                else if (shape === 'cone') {
                    const r = getVal('radius');
                    const h = getVal('height');
                    if (isValid) {
                        volume = (1 / 3) * Math.PI * Math.pow(r, 2) * h;
                        formula = `V = (1/3) × π × r² × h <br> V = 0.33 × 3.1415 × ${r}² × ${h} = ${volume.toFixed(4)}`;
                    }
                }

                if (!isValid) {
                    alert('Please enter valid positive numbers for all dimensions.');
                    return;
                }

                resultElement.textContent = `${parseFloat(volume.toFixed(4))} cubic units`;
                formulaElement.innerHTML = formula;
                resultContainer.style.display = 'block';

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        });