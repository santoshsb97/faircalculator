/* absolute-value-equation-solver - Lazy Loaded JavaScript */

function parseAndSolve() {
            let input = document.getElementById('eqInput').value.replace(/\s+/g, '');

            let parts = input.split('=');
            if (parts.length !== 2) { alert("Please enter a valid equation with an equals sign."); return; }

            let left = parts[0];
            let right = parseFloat(parts[1]);
            if (isNaN(right)) { alert("Right side must be a number."); return; }

            let barStart = left.indexOf('|');
            let barEnd = left.lastIndexOf('|');

            if (barStart === -1 || barEnd === -1) { alert("Please use | bars | around the variable part."); return; }

            let termD = 0;
            let afterBars = left.substring(barEnd + 1);
            if (afterBars.length > 0) termD = parseFloat(afterBars) || 0;

            let beforeBars = left.substring(0, barStart);
            let termA = 1;
            if (beforeBars === "-") termA = -1;
            else if (beforeBars.length > 0) termA = parseFloat(beforeBars);
            if (isNaN(termA)) termA = 1;

            let inside = left.substring(barStart + 1, barEnd);
            let xIndex = inside.indexOf('x');
            if (xIndex === -1) { alert("Equation must contain variable 'x'."); return; }

            let termB = 1;
            let bStr = inside.substring(0, xIndex);
            if (bStr === "-") termB = -1;
            else if (bStr.length > 0) termB = parseFloat(bStr);
            if (isNaN(termB)) termB = 1;

            let termC = 0;
            let cStr = inside.substring(xIndex + 1);
            if (cStr.length > 0) termC = parseFloat(cStr) || 0;

            solveLogic(termA, termB, termC, termD, right);
        }

        function solveLogic(A, B, C, D, E) {
            let stepsHtml = "";
            let resultText = "";

            let opD = D >= 0 ? "+" : "";
            let opC = C >= 0 ? "+" : "";
            stepsHtml += `<div class="step-block"><span class="step-head">1. Original Equation</span>
                <div class="step-math">${A}|${B}x ${opC}${C}| ${opD}${D} = ${E}</div></div>`;

            let newRight = E - D;
            stepsHtml += `<div class="step-block"><span class="step-head">2. Isolate Absolute Value Term</span>
                <div class="step-math">Subtract ${D} from both sides:</div>
                <div class="step-math">${A}|${B}x ${opC}${C}| = ${E} - ${D}</div>
                <div class="step-math">${A}|${B}x ${opC}${C}| = ${newRight}</div></div>`;

            let isolatedVal = newRight / A;
            if (A !== 1) {
                stepsHtml += `<div class="step-block"><span class="step-head">3. Divide by Multiplier (${A})</span>
                <div class="step-math">|${B}x ${opC}${C}| = ${newRight} / ${A}</div>
                <div class="step-math">|${B}x ${opC}${C}| = ${isolatedVal}</div></div>`;
            }

            if (isolatedVal < 0) {
                resultText = "No Solution";
                stepsHtml += `<div class="step-block" style="border-left-color:#ef4444;"><span class="step-head" style="color:#ef4444;">Result</span>
                <div class="step-math">Absolute value cannot be negative (${isolatedVal} < 0).</div></div>`;
            } else if (isolatedVal === 0) {
                let x = -C / B;
                x = parseFloat(x.toFixed(4));
                resultText = `x = ${x}`;
                stepsHtml += `<div class="step-block"><span class="step-head">4. Solve Single Case</span>
                <div class="step-math">${B}x ${opC}${C} = 0 &rarr; x = ${x}</div></div>`;
            } else {
                let rhs1 = isolatedVal;
                let x1 = (rhs1 - C) / B;
                let rhs2 = -isolatedVal;
                let x2 = (rhs2 - C) / B;

                x1 = parseFloat(x1.toFixed(4));
                x2 = parseFloat(x2.toFixed(4));
                resultText = `x = ${x1}, x = ${x2}`;

                stepsHtml += `<div class="step-block"><span class="step-head">4. Split into Two Cases</span>
                <div class="step-math"><strong>Case 1:</strong> ${B}x ${opC}${C} = ${isolatedVal}</div>
                <div class="step-math"><strong>Case 2:</strong> ${B}x ${opC}${C} = ${-isolatedVal}</div></div>`;

                stepsHtml += `<div class="step-block"><span class="step-head">5. Solve Case 1</span>
                <div class="step-math">${B}x = ${isolatedVal} - ${C}</div>
                <div class="step-math">x = ${isolatedVal - C} / ${B}</div>
                <div class="step-math"><strong>x = ${x1}</strong></div></div>`;

                stepsHtml += `<div class="step-block"><span class="step-head">6. Solve Case 2</span>
                <div class="step-math">${B}x = ${-isolatedVal} - ${C}</div>
                <div class="step-math">x = ${-isolatedVal - C} / ${B}</div>
                <div class="step-math"><strong>x = ${x2}</strong></div></div>`;
            }

            document.getElementById('finalRes').innerText = resultText;
            document.getElementById('stepsArea').innerHTML = stepsHtml;
            document.getElementById('resultArea').style.display = 'block';

            if (window.innerWidth < 768) {
                document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function toggleFAQ(el) {
            const ans = el.nextElementSibling;
            ans.classList.toggle('open');
            const span = el.querySelector('span');
            if (span) span.innerText = ans.classList.contains('open') ? 'â–²' : 'â–¼';
        }

        // Hide tool container on search
        const searchInput = document.getElementById('searchInput');
        const toolContainer = document.getElementById('tool-container');
        if (searchInput && toolContainer) {
            searchInput.addEventListener('input', (e) => {
                toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
            });
        }