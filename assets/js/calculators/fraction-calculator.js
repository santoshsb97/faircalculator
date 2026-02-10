/* fraction-calculator - Lazy Loaded JavaScript */

let currentOp = 'add';

        // Search Hiding Logic
        const searchInput = document.getElementById('searchInput');
        const toolContainer = document.getElementById('tool-container');
        if (searchInput && toolContainer) {
            searchInput.addEventListener('input', (e) => {
                toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
            });
        }

        function fcSetOp(op, btn) {
            currentOp = op;
            document.querySelectorAll('.fc-tab').forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            const signs = { add: '+', sub: '\u2212', mul: '\u00D7', div: '\u00F7' };
            document.getElementById('fcOpSign').innerText = signs[op];
        }

        function fcGcd(a, b) {
            return b ? fcGcd(b, a % b) : a;
        }

        function fcCalculate() {
            const n1 = parseInt(document.getElementById('fcN1').value) || 0;
            const d1 = parseInt(document.getElementById('fcD1').value) || 1;
            const n2 = parseInt(document.getElementById('fcN2').value) || 0;
            const d2 = parseInt(document.getElementById('fcD2').value) || 1;

            const errorDiv = document.getElementById('fcError');
            const resultDiv = document.getElementById('fcResult');

            if (d1 === 0 || d2 === 0) {
                errorDiv.style.display = 'block';
                resultDiv.style.display = 'none';
                return;
            }

            if (currentOp === 'div' && n2 === 0) {
                errorDiv.innerText = "Cannot divide by zero (2nd fraction numerator is 0).";
                errorDiv.style.display = 'block';
                resultDiv.style.display = 'none';
                return;
            }

            errorDiv.style.display = 'none';

            let num, den, steps = "";

            if (currentOp === 'add') {
                num = (n1 * d2) + (n2 * d1);
                den = d1 * d2;
                steps = `Equation: ${n1}/${d1} + ${n2}/${d2}\n\n1. Cross Multiply: (${n1} \u00D7 ${d2}) + (${n2} \u00D7 ${d1})\n2. Common Denominator: (${d1} \u00D7 ${d2})\n3. Result: ${num}/${den}`;
            } else if (currentOp === 'sub') {
                num = (n1 * d2) - (n2 * d1);
                den = d1 * d2;
                steps = `Equation: ${n1}/${d1} - ${n2}/${d2}\n\n1. Cross Multiply: (${n1} \u00D7 ${d2}) - (${n2} \u00D7 ${d1})\n2. Common Denominator: (${d1} \u00D7 ${d2})\n3. Result: ${num}/${den}`;
            } else if (currentOp === 'mul') {
                num = n1 * n2;
                den = d1 * d2;
                steps = `Equation: ${n1}/${d1} \u00D7 ${n2}/${d2}\n\n1. Multiply Numerators: ${n1} \u00D7 ${n2} = ${num}\n2. Multiply Denominators: ${d1} \u00D7 ${d2} = ${den}\n3. Result: ${num}/${den}`;
            } else if (currentOp === 'div') {
                num = n1 * d2;
                den = d1 * n2;
                steps = `Equation: ${n1}/${d1} \u00F7 ${n2}/${d2}\n\n1. Flip 2nd Fraction: ${d2}/${n2}\n2. Multiply: (${n1} \u00D7 ${d2}) / (${d1} \u00D7 ${n2})\n3. Result: ${num}/${den}`;
            }

            // Handle negative denominator
            if (den < 0) { num = -num; den = -den; }

            const commonDivisor = fcGcd(Math.abs(num), Math.abs(den));
            const simpNum = num / commonDivisor;
            const simpDen = den / commonDivisor;

            document.getElementById('fcResNum').innerText = simpNum;
            document.getElementById('fcResDen').innerText = simpDen;

            // Mixed Number Logic
            const mixedBox = document.getElementById('fcMixedBox');
            if (Math.abs(simpNum) > simpDen && simpDen !== 1) {
                const whole = Math.trunc(simpNum / simpDen);
                const rem = Math.abs(simpNum % simpDen);
                document.getElementById('fcMixedWhole').innerText = whole;
                document.getElementById('fcMixedNum').innerText = rem;
                document.getElementById('fcMixedDen').innerText = simpDen;
                mixedBox.style.display = 'flex';
            } else {
                mixedBox.style.display = 'none';
            }

            // Handle Whole Numbers (e.g., 4/1)
            if (simpDen === 1) {
                document.getElementById('fcResDen').style.display = 'none';
                document.querySelector('.fc-res-box .fc-bar').style.display = 'none';
            } else {
                document.getElementById('fcResDen').style.display = 'block';
                document.querySelector('.fc-res-box .fc-bar').style.display = 'block';
            }

            // Decimals & Percents
            const decimalVal = simpNum / simpDen;
            document.getElementById('fcMetaDecimal').innerText = decimalVal.toFixed(4);
            document.getElementById('fcMetaPercent').innerText = (decimalVal * 100).toFixed(2) + '%';

            if (num !== simpNum || den !== simpDen) {
                steps += `\n\n4. Simplify: Divide by GCD (${commonDivisor})\n   Final: ${simpNum}/${simpDen}`;
            } else {
                steps += `\n\n4. Simplify: Fraction is already in simplest form.`;
            }

            document.getElementById('fcStepsText').innerText = steps;

            resultDiv.style.display = 'block';
        }

        function fcCopy() {
            const n = document.getElementById('fcResNum').innerText;
            const d = document.getElementById('fcResDen').innerText;
            navigator.clipboard.writeText(`${n}/${d}`);
            const btn = document.querySelector('.fc-copy');
            btn.innerText = "Copied!";
            setTimeout(() => btn.innerText = "Copy Result", 2000);
        }

        function fcReset() {
            document.getElementById('fcN1').value = '';
            document.getElementById('fcD1').value = '';
            document.getElementById('fcN2').value = '';
            document.getElementById('fcD2').value = '';
            document.getElementById('fcResult').style.display = 'none';
            document.getElementById('fcError').style.display = 'none';
        }