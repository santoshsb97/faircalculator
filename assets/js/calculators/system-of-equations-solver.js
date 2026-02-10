/* system-of-equations-solver - Lazy Loaded JavaScript */

function parseLinearStr(str) {
            str = str.replace(/\s/g, '').toLowerCase();
            const parts = str.split('=');
            if (parts.length !== 2) return null;
            const lhs = parts[0];
            const rhs = parts[1];
            let c = parseFloat(rhs);
            if (isNaN(c)) return null;

            const getCoeff = (text, varChar) => {
                const idx = text.indexOf(varChar);
                if (idx === -1) return 0;
                let coeffStr = "";
                let i = idx - 1;
                while (i >= 0 && (/[0-9.]/.test(text[i]) || text[i] === '-' || text[i] === '+')) {
                    coeffStr = text[i] + coeffStr;
                    i--;
                }
                if (coeffStr === "" || coeffStr === "+") return 1;
                if (coeffStr === "-") return -1;
                return parseFloat(coeffStr);
            };

            let a = getCoeff(lhs, 'x');
            let b = getCoeff(lhs, 'y');
            return { a, b, c };
        }

        function fmtEq(a, b, c) {
            let xPart = (a === 1 ? "x" : (a === -1 ? "-x" : a + "x"));
            if (a === 0) xPart = "";
            let yPart = "";
            if (b !== 0) {
                let sign = b < 0 ? " - " : " + ";
                if (xPart === "" && b < 0) sign = "-";
                if (xPart === "" && b > 0) sign = "";
                yPart = sign + (Math.abs(b) === 1 ? "y" : Math.abs(b) + "y");
            }
            return `${xPart}${yPart} = ${c}`;
        }

        function processEquations() {
            const eq1Str = document.getElementById('eq1').value;
            const eq2Str = document.getElementById('eq2').value;
            const p1 = parseLinearStr(eq1Str);
            const p2 = parseLinearStr(eq2Str);
            if (!p1 || !p2) { alert("Could not parse equations. Please use format 'ax + by = c'."); return; }
            solveDetailed(p1.a, p1.b, p1.c, p2.a, p2.b, p2.c);
        }

        function solveDetailed(a1, b1, c1, a2, b2, c2) {
            const D = (a1 * b2) - (a2 * b1);
            const Dx = (c1 * b2) - (c2 * b1);
            const Dy = (a1 * c2) - (a2 * c1);
            let x, y, resultText, html = "";

            if (Math.abs(D) < 1e-9) {
                if (Math.abs(Dx) < 1e-9 && Math.abs(Dy) < 1e-9) {
                    resultText = "Infinite Solutions";
                    html += `<div class="step-block"><span class="step-title">Result</span><div>The equations describe the same line. Infinite solutions.</div></div>`;
                } else {
                    resultText = "No Solution";
                    html += `<div class="step-block"><span class="step-title">Result</span><div>The lines are parallel. No solution.</div></div>`;
                }
            } else {
                x = parseFloat((Dx / D).toFixed(4));
                y = parseFloat((Dy / D).toFixed(4));
                resultText = `x = ${x}, y = ${y}`;
                html += `<div class="step-block"><span class="step-title">Step 1: Identify Equations</span>
                <div class="step-math">(1) ${fmtEq(a1, b1, c1)}</div>
                <div class="step-math">(2) ${fmtEq(a2, b2, c2)}</div></div>`;

                if (a1 === 0 || a2 === 0) {
                    html += `<div class="step-block"><span class="step-title">Step 2: Solve Directly</span><div>One equation has a zero coefficient. Solving simple linear equation.</div></div>`;
                } else {
                    html += `<div class="step-block"><span class="step-title">Step 2: Eliminate X</span>
                    <div>Multiply (1) by ${a2} and (2) by ${a1}:</div>
                    <div class="step-math">${fmtEq(a1 * a2, b1 * a2, c1 * a2)}</div>
                    <div class="step-math">${fmtEq(a2 * a1, b2 * a1, c2 * a1)}</div></div>`;
                    let nB = (b1 * a2) - (b2 * a1);
                    let nC = (c1 * a2) - (c2 * a1);
                    html += `<div class="step-block"><span class="step-title">Step 3: Subtract</span>
                    <div class="step-math">${parseFloat(nB.toFixed(4))}y = ${parseFloat(nC.toFixed(4))}</div>
                    <div class="step-math"><strong>y = ${y}</strong></div></div>`;
                }
                html += `<div class="step-block"><span class="step-title">Step 4: Find X</span>
                <div>Substitute y = ${y} back:</div>
                <div class="step-math"><strong>x = ${x}</strong></div></div>`;
            }

            document.getElementById('finalRes').innerText = resultText;
            document.getElementById('stepsOutput').innerHTML = html;
            document.getElementById('resultArea').style.display = 'block';
            drawModernGraph(a1, b1, c1, a2, b2, c2, x, y, Math.abs(D) < 1e-9);

            if (window.innerWidth < 768) { document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth' }); }
        }

        function drawModernGraph(a1, b1, c1, a2, b2, c2, solX, solY, isParallel) {
            const canvas = document.getElementById('linearGraph');
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            const w = rect.width;
            const h = rect.height;
            ctx.clearRect(0, 0, w, h);
            let range = 10;
            if (!isParallel && !isNaN(solX)) range = Math.max(10, Math.abs(solX) * 1.5, Math.abs(solY) * 1.5);
            const pad = 40;
            const mapX = (v) => pad + ((v + range) / (2 * range)) * (w - 2 * pad);
            const mapY = (v) => h - (pad + ((v + range) / (2 * range)) * (h - 2 * pad));

            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            for (let i = -Math.floor(range); i <= range; i += 2) {
                ctx.beginPath(); ctx.moveTo(mapX(i), 0); ctx.lineTo(mapX(i), h); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, mapY(i)); ctx.lineTo(w, mapY(i)); ctx.stroke();
            }
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(mapX(0), 0); ctx.lineTo(mapX(0), h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, mapY(0)); ctx.lineTo(w, mapY(0)); ctx.stroke();

            function drawLine(a, b, c, col) {
                ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
                if (Math.abs(b) < 1e-9) { let x = c / a; ctx.moveTo(mapX(x), 0); ctx.lineTo(mapX(x), h); }
                else { ctx.moveTo(mapX(-range), mapY((c + a * range) / b)); ctx.lineTo(mapX(range), mapY((c - a * range) / b)); }
                ctx.stroke();
            }
            drawLine(a1, b1, c1, '#2563eb');
            drawLine(a2, b2, c2, '#ef4444');

            if (!isParallel && !isNaN(solX)) {
                ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.arc(mapX(solX), mapY(solY), 6, 0, 2 * Math.PI); ctx.fill();
            }
        }

        function toggleFAQ(el) {
            let ans = el.nextElementSibling;
            let span = el.querySelector('span');
            ans.classList.toggle('show');
            span.innerText = ans.classList.contains('show') ? '-' : '+';
        }

        const searchInput = document.getElementById('searchInput');
        const toolContainer = document.getElementById('tool-container');
        if (searchInput && toolContainer) {
            searchInput.addEventListener('input', (e) => {
                toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
            });
        }