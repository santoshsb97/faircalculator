/* logarithm-calculator - Lazy Loaded JavaScript */

function setBase(val) {
            const inp = document.getElementById('inpBase');
            const btns = document.querySelectorAll('.q-btn');
            btns.forEach(b => b.classList.remove('active'));
            if (event) event.target.classList.add('active');

            if (val === 'e') {
                inp.value = 2.718281828;
                inp.setAttribute('data-mode', 'ln');
            } else if (val === '') {
                inp.value = '';
                inp.removeAttribute('data-mode');
                inp.focus();
            } else {
                inp.value = val;
                inp.removeAttribute('data-mode');
            }
        }

        function calcLog() {
            let b = parseFloat(document.getElementById('inpBase').value);
            let x = parseFloat(document.getElementById('inpNum').value);
            let isLn = Math.abs(b - Math.E) < 0.00001 || document.getElementById('inpBase').getAttribute('data-mode') === 'ln';

            if (isNaN(b) || isNaN(x)) { alert("Please enter valid numbers."); return; }
            if (b <= 0 || b === 1) { alert("Base must be > 0 and not equal to 1."); return; }
            if (x <= 0) { alert("Number (x) must be > 0."); return; }

            // Calc using Change of Base
            let res = Math.log(x) / Math.log(b);

            // Clean output
            let displayRes = Number.isInteger(res) ? res : parseFloat(res.toFixed(6));

            let eqHTML = "";
            let stepHTML = "";

            if (isLn) {
                eqHTML = `ln(${x}) = ${displayRes}`;
                stepHTML = `We solve for y: <em>e</em><sup>y</sup> = ${x}.<br>The natural logarithm is approx <strong>${displayRes}</strong>.`;
            } else {
                eqHTML = `log<sub>${b}</sub>(${x}) = ${displayRes}`;
                stepHTML = `We solve for y: ${b}<sup>y</sup> = ${x}.<br>The power is approx <strong>${displayRes}</strong>.`;
            }

            document.getElementById('finalRes').innerText = displayRes;
            document.getElementById('resEq').innerHTML = eqHTML;
            document.getElementById('stepExpl').innerHTML = stepHTML;
            document.getElementById('resultArea').style.display = 'block';

            if (window.innerWidth < 768) {
                document.getElementById('resultArea').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function toggleFAQ(el) {
            const ans = el.nextElementSibling;
            ans.classList.toggle('open');
            const icon = el.querySelector('span');
            if (icon) icon.innerText = ans.classList.contains('open') ? '▲' : '▼';
        }

        // Hide tool container on search
        const searchInput = document.getElementById('searchInput');
        const toolContainer = document.getElementById('tool-container');
        if (searchInput && toolContainer) {
            searchInput.addEventListener('input', (e) => {
                toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
            });
        }