/* area-calculator - Lazy Loaded JavaScript */

document.addEventListener('DOMContentLoaded', () => {
            // DOM Elements
            const shapeType = document.getElementById('shapeType');
            const unitType = document.getElementById('unitType');
            const inputFields = document.getElementById('inputFields');
            const calculateBtn = document.getElementById('calculateBtn');
            const resultContainer = document.getElementById('resultContainer');
            const resultElement = document.getElementById('result');
            const resultUnitElement = document.getElementById('resultUnit');
            const stepsContainer = document.getElementById('stepsContainer');

            // Sub-option blocks
            const triangleOptions = document.getElementById('triangleOptions');
            const rhombusOptions = document.getElementById('rhombusOptions');
            const parallelogramOptions = document.getElementById('parallelogramOptions');

            // Radio NodeLists
            const triRadios = document.getElementsByName('triMethod');
            const rhoRadios = document.getElementsByName('rhoMethod');
            const paraRadios = document.getElementsByName('paraMethod');

            // Canvas
            const canvas = document.getElementById('shapeCanvas');
            const ctx = canvas.getContext('2d');

            // Search Hiding Logic
            const searchInput = document.getElementById('searchInput');
            const toolContainer = document.getElementById('tool-container');
            if (searchInput && toolContainer) {
                searchInput.addEventListener('input', (e) => {
                    toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
                });
            }

            const unitMap = {
                'm': 'm²', 'cm': 'cm²', 'mm': 'mm²', 'km': 'km²',
                'ft': 'sq ft', 'in': 'sq in', 'yd': 'sq yd'
            };

            // --- INPUT DEFINITIONS ---
            const basicShapes = {
                circle: { inputs: [{ name: 'radius', label: 'Radius (r)', placeholder: '5' }] },
                square: { inputs: [{ name: 'side', label: 'Side Length (a)', placeholder: '10' }] },
                rectangle: { inputs: [{ name: 'length', label: 'Length (l)', placeholder: '10' }, { name: 'width', label: 'Width (w)', placeholder: '5' }] },
                trapezoid: { inputs: [{ name: 'base1', label: 'Base 1 (a)', placeholder: '8' }, { name: 'base2', label: 'Base 2 (b)', placeholder: '5' }, { name: 'height', label: 'Height (h)', placeholder: '4' }] },
                ellipse: { inputs: [{ name: 'axis_a', label: 'Semi-major Axis (a)', placeholder: '7' }, { name: 'axis_b', label: 'Semi-minor Axis (b)', placeholder: '3' }] },
                sector: { inputs: [{ name: 'radius', label: 'Radius (r)', placeholder: '10' }, { name: 'angle', label: 'Angle θ (degrees)', placeholder: '45' }] },
                polygon: { inputs: [{ name: 'sides_n', label: 'Number of Sides (n)', placeholder: '5' }, { name: 'length_s', label: 'Length of Side (s)', placeholder: '6' }] }
            };

            const triangleMethods = {
                bh: [{ name: 'tri_base', label: 'Base (b)', placeholder: '10' }, { name: 'tri_height', label: 'Height (h)', placeholder: '5' }],
                sss: [{ name: 'side_a', label: 'Side A', placeholder: '3' }, { name: 'side_b', label: 'Side B', placeholder: '4' }, { name: 'side_c', label: 'Side C', placeholder: '5' }],
                sas: [{ name: 'side_a', label: 'Side A', placeholder: '10' }, { name: 'side_b', label: 'Side B', placeholder: '15' }, { name: 'angle_c', label: 'Angle γ (°)', placeholder: '30' }],
                asa: [{ name: 'side_c', label: 'Side C', placeholder: '10' }, { name: 'angle_a', label: 'Angle α (°)', placeholder: '45' }, { name: 'angle_b', label: 'Angle β (°)', placeholder: '45' }]
            };

            const rhombusMethods = {
                sh: [{ name: 'rho_side', label: 'Side Length (a)', placeholder: '10' }, { name: 'rho_height', label: 'Height (h)', placeholder: '8' }],
                diags: [{ name: 'rho_d1', label: 'Diagonal 1 (d‚)', placeholder: '12' }, { name: 'rho_d2', label: 'Diagonal 2 (d‚‚)', placeholder: '16' }],
                sa: [{ name: 'rho_side', label: 'Side Length (a)', placeholder: '10' }, { name: 'rho_angle', label: 'Any Angle (θ¸)', placeholder: '60' }]
            };

            const parallelogramMethods = {
                bh: [{ name: 'para_base', label: 'Base (b)', placeholder: '10' }, { name: 'para_height', label: 'Height (h)', placeholder: '6' }],
                sa: [{ name: 'para_a', label: 'Side A', placeholder: '8' }, { name: 'para_b', label: 'Side B', placeholder: '12' }, { name: 'para_angle', label: 'Angle (θ¸)', placeholder: '60' }],
                da: [{ name: 'para_d1', label: 'Diagonal 1 (d‚)', placeholder: '14' }, { name: 'para_d2', label: 'Diagonal 2 (d‚‚)', placeholder: '18' }, { name: 'para_d_angle', label: 'Angle between Diagonals', placeholder: '70' }]
            };

            // --- 1. RENDER INPUTS ---
            function updateInputs() {
                const shape = shapeType.value;
                inputFields.innerHTML = '';
                resultContainer.style.display = 'none';

                // Hide all sub-options first
                triangleOptions.style.display = 'none';
                rhombusOptions.style.display = 'none';
                parallelogramOptions.style.display = 'none';

                if (shape === 'triangle') {
                    triangleOptions.style.display = 'block';
                    let method = getChecked(triRadios) || 'bh';
                    triangleMethods[method].forEach(renderInput);
                } else if (shape === 'rhombus') {
                    rhombusOptions.style.display = 'block';
                    let method = getChecked(rhoRadios) || 'sh';
                    rhombusMethods[method].forEach(renderInput);
                } else if (shape === 'parallelogram') {
                    parallelogramOptions.style.display = 'block';
                    let method = getChecked(paraRadios) || 'bh';
                    parallelogramMethods[method].forEach(renderInput);
                } else if (basicShapes[shape]) {
                    basicShapes[shape].inputs.forEach(renderInput);
                }
            }

            function getChecked(nodeList) {
                for (let r of nodeList) if (r.checked) return r.value;
                return null;
            }

            function renderInput(input) {
                const div = document.createElement('div');
                div.className = 'input-group';
                div.innerHTML = `<label for="${input.name}">${input.label}</label><input type="number" id="${input.name}" placeholder="e.g. ${input.placeholder}" step="any" min="0">`;
                inputFields.appendChild(div);
            }

            // --- HELPER FOR STEPS HTML ---
            function addStep(label, math) {
                return `<div class="step-item"><span class="step-label">${label}</span><br><span class="step-math">${math}</span></div>`;
            }

            // --- CALCULATION LOGIC ---
            function performCalculation() {
                const shape = shapeType.value;
                const unit = unitType.value;
                const uSym = unit;
                const sqSym = unitMap[unit];

                let area = 0, stepsHtml = '', isValid = true, errMessage = "Enter valid positive numbers.";
                let diagramValues = {};

                const getVal = (id) => {
                    const el = document.getElementById(id);
                    if (!el) return 0;
                    const val = parseFloat(el.value);
                    if (isNaN(val) || val < 0) isValid = false;
                    return val;
                };

                // --- Logic Blocks ---
                if (shape === 'circle') {
                    const r = getVal('radius');
                    if (isValid) {
                        area = Math.PI * r * r;
                        stepsHtml += addStep("Formula", "A = πr²") + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                        diagramValues = { r };
                    }
                }
                else if (shape === 'square') {
                    const s = getVal('side');
                    if (isValid) {
                        area = s * s;
                        stepsHtml += addStep("Formula", "A = s²") + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                        diagramValues = { s };
                    }
                }
                else if (shape === 'rectangle') {
                    const l = getVal('length'); const w = getVal('width');
                    if (isValid) {
                        area = l * w;
                        stepsHtml += addStep("Formula", "A = l × w") + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                        diagramValues = { l, w };
                    }
                }
                else if (shape === 'trapezoid') {
                    const a = getVal('base1'); const b = getVal('base2'); const h = getVal('height');
                    if (isValid) {
                        area = 0.5 * (a + b) * h;
                        stepsHtml += addStep("Formula", "A = ½(a+b)h") + addStep("Sum Bases", `a+b = ${a + b}`) + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                        diagramValues = { a, b, h };
                    }
                }

                // --- TRIANGLES ---
                else if (shape === 'triangle') {
                    let method = getChecked(triRadios);
                    if (method === 'bh') {
                        const b = getVal('tri_base'); const h = getVal('tri_height');
                        if (isValid) {
                            area = 0.5 * b * h;
                            stepsHtml += addStep("Formula", "A = ½bh") + addStep("Result", `A = ${area.toFixed(4)}`);
                            diagramValues = { b, h };
                        }
                    } else if (method === 'sss') {
                        const a = getVal('side_a'); const b = getVal('side_b'); const c = getVal('side_c');
                        if (isValid && (a + b > c)) {
                            const s = (a + b + c) / 2; area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
                            stepsHtml += addStep("Semi-perimeter", `s = ${s}`) + addStep("Heron's Formula", "√[s(s-a)(s-b)(s-c)]") + addStep("Result", `A = ${area.toFixed(4)}`);
                            diagramValues = { s };
                        } else isValid = false;
                    } else if (method === 'sas') {
                        const a = getVal('side_a'); const b = getVal('side_b'); const ang = getVal('angle_c');
                        if (isValid) {
                            const rad = ang * (Math.PI / 180); area = 0.5 * a * b * Math.sin(rad);
                            stepsHtml += addStep("Formula", "A = ½ab sin(C)") + addStep("Result", `A = ${area.toFixed(4)}`);
                            diagramValues = { a };
                        }
                    } else if (method === 'asa') {
                        const c = getVal('side_c'); const A = getVal('angle_a'); const B = getVal('angle_b');
                        if (isValid) {
                            const radA = A * (Math.PI / 180), radB = B * (Math.PI / 180), radC = (180 - A - B) * (Math.PI / 180);
                            area = (c * c * Math.sin(radA) * Math.sin(radB)) / (2 * Math.sin(radC));
                            stepsHtml += addStep("Formula", "A = [c²sin(A)sin(B)] / 2sin(C)") + addStep("Result", `A = ${area.toFixed(4)}`);
                            diagramValues = { c };
                        }
                    }
                }

                // --- RHOMBUS ---
                else if (shape === 'rhombus') {
                    let method = getChecked(rhoRadios);
                    if (method === 'sh') {
                        const s = getVal('rho_side'); const h = getVal('rho_height');
                        if (isValid) {
                            area = s * h;
                            stepsHtml += addStep("Formula", "A = side  height") + addStep("Substitute", `A = ${s}  ${h}`) + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                            diagramValues = { type: 'sh', s, h };
                        }
                    } else if (method === 'diags') {
                        const d1 = getVal('rho_d1'); const d2 = getVal('rho_d2');
                        if (isValid) {
                            area = 0.5 * d1 * d2;
                            stepsHtml += addStep("Formula", "A = ½  d‚  d‚‚") + addStep("Substitute", `A = 0.5  ${d1}  ${d2}`) + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                            diagramValues = { type: 'diags', d1, d2 };
                        }
                    } else if (method === 'sa') {
                        const s = getVal('rho_side'); const ang = getVal('rho_angle');
                        if (isValid) {
                            const rad = ang * (Math.PI / 180);
                            area = s * s * Math.sin(rad);
                            stepsHtml += addStep("Formula", "A = s²  sin(θ¸)") + addStep("Substitute", `A = ${s}²  sin(${ang}°)`) + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                            diagramValues = { type: 'sa', s };
                        }
                    }
                }

                // --- PARALLELOGRAM ---
                else if (shape === 'parallelogram') {
                    let method = getChecked(paraRadios);
                    if (method === 'bh') {
                        const b = getVal('para_base'); const h = getVal('para_height');
                        if (isValid) {
                            area = b * h;
                            stepsHtml += addStep("Formula", "A = base  height") + addStep("Substitute", `A = ${b}  ${h}`) + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                            diagramValues = { type: 'bh', b, h };
                        }
                    } else if (method === 'sa') {
                        const a = getVal('para_a'); const b = getVal('para_b'); const ang = getVal('para_angle');
                        if (isValid) {
                            const rad = ang * (Math.PI / 180);
                            area = a * b * Math.sin(rad);
                            stepsHtml += addStep("Formula", "A = a  b  sin(θ¸)") + addStep("Substitute", `A = ${a}  ${b}  sin(${ang}°)`) + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                            diagramValues = { type: 'sa', a, b };
                        }
                    } else if (method === 'da') {
                        const d1 = getVal('para_d1'); const d2 = getVal('para_d2'); const ang = getVal('para_d_angle');
                        if (isValid) {
                            const rad = ang * (Math.PI / 180);
                            area = 0.5 * d1 * d2 * Math.sin(rad);
                            stepsHtml += addStep("Formula", "A = ½  d‚  d‚‚  sin(θ¸)") + addStep("Substitute", `A = 0.5  ${d1}  ${d2}  sin(${ang}°)`) + addStep("Result", `A = ${area.toFixed(4)} ${sqSym}`);
                            diagramValues = { type: 'da', d1, d2 };
                        }
                    }
                }

                if (!isValid) { alert(errMessage); return; }

                resultElement.textContent = parseFloat(area.toFixed(4));
                resultUnitElement.textContent = sqSym;
                stepsContainer.innerHTML = stepsHtml;
                resultContainer.style.display = 'block';

                drawDiagram(shape, diagramValues);

                if (window.innerWidth < 768) {
                    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            // --- DRAWING LOGIC (Simplified) ---
            function drawDiagram(shape, val) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.beginPath();
                ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2; ctx.fillStyle = 'rgba(79, 70, 229, 0.1)'; ctx.textAlign = "center";

                const cx = canvas.width / 2, cy = canvas.height / 2;

                if (shape === 'rhombus') {
                    const w = 100, h = 140;
                    ctx.moveTo(cx, cy - h / 2); ctx.lineTo(cx + w / 2, cy); ctx.lineTo(cx, cy + h / 2); ctx.lineTo(cx - w / 2, cy); ctx.closePath();
                    ctx.stroke(); ctx.fill();
                } else if (shape === 'parallelogram') {
                    const b = 100, h = 80, off = 30;
                    ctx.moveTo(cx - b / 2 + off, cy - h / 2); ctx.lineTo(cx - b / 2 - off, cy + h / 2);
                    ctx.lineTo(cx + b / 2 - off, cy + h / 2); ctx.lineTo(cx + b / 2 + off, cy - h / 2); ctx.closePath();
                    ctx.stroke(); ctx.fill();
                } else if (shape === 'triangle') {
                    ctx.moveTo(cx - 60, cy + 50); ctx.lineTo(cx + 60, cy + 50); ctx.lineTo(cx, cy - 50); ctx.closePath(); ctx.stroke(); ctx.fill();
                } else if (shape === 'circle') {
                    ctx.arc(cx, cy, 60, 0, 2 * Math.PI); ctx.stroke(); ctx.fill();
                } else if (shape === 'square') {
                    ctx.rect(cx - 50, cy - 50, 100, 100); ctx.stroke(); ctx.fill();
                } else if (shape === 'rectangle') {
                    ctx.rect(cx - 60, cy - 40, 120, 80); ctx.stroke(); ctx.fill();
                } else if (shape === 'trapezoid') {
                    ctx.moveTo(cx - 40, cy - 40); ctx.lineTo(cx + 40, cy - 40); ctx.lineTo(cx + 60, cy + 40); ctx.lineTo(cx - 60, cy + 40); ctx.closePath(); ctx.stroke(); ctx.fill();
                }
            }

            shapeType.addEventListener('change', updateInputs);
            triRadios.forEach(r => r.addEventListener('change', updateInputs));
            rhoRadios.forEach(r => r.addEventListener('change', updateInputs));
            paraRadios.forEach(r => r.addEventListener('change', updateInputs));
            calculateBtn.addEventListener('click', performCalculation);
            inputFields.addEventListener('keyup', (e) => { if (e.key === 'Enter') performCalculation(); });
            updateInputs();
        });