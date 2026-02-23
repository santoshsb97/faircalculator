// --- LCM Logic ---
function parseNumbers(input) {
    if (!input.trim()) return [];
    const parts = input.trim().split(/[\s,;]+/);
    const numbers = [];
    for (let p of parts) {
        const n = Number(p);
        if (isNaN(n) || !Number.isInteger(n) || n <= 0) return null; // Signal invalid token
        numbers.push(n);
    }
    return numbers;
}

function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { let t = b; b = a % b; a = t; }
    return a || 1;
}

function getPrimeFactors(n) {
    const factors = [];
    let d = 2;
    let temp = n;
    while (temp % d === 0) { factors.push(d); temp /= d; }
    d = 3;
    while (d * d <= temp) {
        while (temp % d === 0) { factors.push(d); temp /= d; }
        d += 2;
    }
    if (temp > 1) factors.push(temp);
    return factors;
}

function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
}

function getNextPrime(p) {
    let next = p + 1;
    while (!isPrime(next)) next++;
    return next;
}

function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

function createTable(headers, rows) {
    let html = '<table class="lcm-table"><thead><tr>';
    headers.forEach(h => html += `<th>${escapeHTML(h)}</th>`);
    html += '</tr></thead><tbody>';
    rows.forEach(r => {
        html += '<tr>';
        r.forEach(c => {
            // Allow span for highlight class in specific cases, otherwise escape
            if (typeof c === 'string' && c.includes('<span')) {
                html += `<td>${c}</td>`;
            } else {
                html += `<td>${escapeHTML(c)}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    return html;
}

// --- Methods ---
function cakeMethod(numbers) {
    let working = [...numbers];
    const primes = [];
    const steps = [];
    let p = 2;
    const MAX_ITERATIONS = 2000;
    let iterations = 0;

    while (working.some(n => n > 1) && iterations < MAX_ITERATIONS) {
        iterations++;
        const divisible = working.filter(n => n > 1 && n % p === 0).length;
        if (divisible >= 2) {
            const before = [...working];
            working = working.map(n => (n % p === 0) ? n / p : n);
            if (steps.length < 50) { // UI Performance cap for steps
                steps.push({ p, before, after: [...working] });
            }
            primes.push(p);
        } else {
            p = getNextPrime(p);
        }
    }

    if (iterations >= MAX_ITERATIONS) {
        throw new Error('Calculation too complex for visual Cake Method. Please use Prime Factorization.');
    }

    let lcm = primes.reduce((a, b) => a * b, 1) * working.reduce((a, b) => a * b, 1);
    return { lcm, steps, final: working, primes, isStepCapped: (steps.length >= 50 && working.some(n => n > 1)) };
}

function primeFactorization(numbers) {
    const map = {};
    const factorsList = numbers.map(n => {
        const f = getPrimeFactors(n);
        const counts = {};
        f.forEach(p => counts[p] = (counts[p] || 0) + 1);
        for (let p in counts) map[p] = Math.max(map[p] || 0, counts[p]);
        return { n, f };
    });
    let lcm = 1;
    for (let p in map) lcm *= Math.pow(parseInt(p), map[p]);
    return { lcm, factorsList, map };
}

function gcfMethod(numbers) {
    if (numbers.length === 2) {
        const [a, b] = numbers;
        const g = gcd(a, b);
        return { lcm: (a * b) / g, a, b, g };
    }
    let res = numbers[0];
    const steps = [];
    for (let i = 1; i < numbers.length; i++) {
        const a = res;
        const b = numbers[i];
        const g = gcd(a, b);
        res = (a * b) / g;
        steps.push({ a, b, g, lcm: res });
    }
    return { lcm: res, steps };
}

function multiplesMethod(numbers) {
    const actualLcm = numbers.reduce((a, b) => (a * b) / gcd(a, b));
    const MAX_STEPS = 50; // Max multiples to list for demonstration

    const grid = numbers.map(n => {
        const list = [];
        const limit = Math.min(Math.ceil(actualLcm / n), MAX_STEPS);
        for (let i = 1; i <= limit; i++) list.push(n * i);
        return { n, list, isComplete: (n * limit >= actualLcm) };
    });

    const isFound = grid.every(g => g.isComplete);
    return { lcm: actualLcm, grid, isFound, limit: MAX_STEPS };
}

// --- Controller ---
function calculateLCM() {
    const error = document.getElementById('lcmError');
    const resultDiv = document.getElementById('lcmResult');
    const stepsDiv = document.getElementById('lcmSteps');
    const stepsContent = document.getElementById('stepsContent');

    error.style.display = 'none';
    const inputVal = document.getElementById('lcmNumbers').value;
    const numbers = parseNumbers(inputVal);
    const method = document.getElementById('lcmMethod').value;

    if (numbers === null) {
        error.textContent = 'Only positive integers are allowed. Please check your input.';
        error.style.display = 'block';
        return;
    }

    if (numbers.length < 2) {
        error.textContent = 'Please enter at least two positive integers.';
        error.style.display = 'block';
        return;
    }

    if (numbers.length > 50) {
        error.textContent = 'Too many numbers. Please limit to 50 numbers at a time.';
        error.style.display = 'block';
        return;
    }

    if (numbers.some(n => n > 10000000)) {
        error.textContent = 'Numbers are too large. Please use values under 10,000,000.';
        error.style.display = 'block';
        return;
    }

    let res;
    let html = '';

    try {
        switch (method) {
            case 'cake':
                res = cakeMethod(numbers);
                html = `<div class="lcm-step"><h3><i class="fas fa-layer-group"></i> Cake Method</h3>
                        <p>Divide by primes that share common factors.</p>`;
                if (res.steps.length) {
                    html += createTable(['Step', 'Prime', 'Before', 'After'],
                        res.steps.map((s, i) => [i + 1, `<span class="highlight">${s.p}</span>`, s.before.join(', '), s.after.join(', ')]));
                    if (res.isStepCapped) {
                        html += `<p style="font-style: italic; color: #64748b; font-size: 0.85rem;">... showing first 50 steps for performance ...</p>`;
                    }
                    html += `<p><strong>LCM = ${res.primes.join(' Ã— ')} Ã— ${res.final.join(' Ã— ')} = ${res.lcm}</strong></p>`;
                } else {
                    html += `<p>No common primes found. Multiply all: ${numbers.join(' Ã— ')} = ${res.lcm}</p>`;
                }
                html += `</div>`;
                break;
            case 'prime':
                res = primeFactorization(numbers);
                html = `<div class="lcm-step"><h3><i class="fas fa-atom"></i> Prime Factorization</h3>`;
                html += createTable(['Number', 'Factors'], res.factorsList.map(item => [item.n, item.f.join(' Ã— ')]));
                html += `<p><strong>Highest powers:</strong> `;
                const parts = [];
                for (let p in res.map) parts.push(res.map[p] > 1 ? `${p}<sup>${res.map[p]}</sup>` : p);
                html += `${parts.join(' Ã— ')} = ${res.lcm}</p></div>`;
                break;
            case 'gcf':
            case 'formula':
                res = gcfMethod(numbers);
                html = `<div class="lcm-step"><h3><i class="fas fa-divide"></i> GCD Formula</h3>`;
                if (res.steps) {
                    html += createTable(['Pair', 'GCD', 'LCM Result'], res.steps.map(s => [`LCM(${s.a}, ${s.b})`, s.g, s.lcm]));
                } else {
                    html += `<p>LCM(${res.a}, ${res.b}) = (${res.a} Ã— ${res.b}) / ${res.g} = ${res.lcm}</p>`;
                }
                html += `</div>`;
                break;
            case 'multiples':
            case 'grid':
                res = multiplesMethod(numbers);
                html = `<div class="lcm-step"><h3><i class="fas fa-list-ol"></i> Multiples Method</h3>`;
                if (!res.isFound) {
                    html += `<p style="color: #b91c1c; background: #fef2f2; padding: 10px; border-radius: 6px; border: 1px solid #fee2e2; margin-bottom: 15px;">
                        <i class="fas fa-exclamation-triangle"></i> <strong>Note:</strong> The LCM (${res.lcm}) is too large to show using the simple multiples listing method (capped at ${res.limit} multiples).
                    </p>`;
                }
                res.grid.forEach(g => html += `<p>Multiples of ${g.n}: ${g.list.slice(0, 8).join(', ')}${g.isComplete ? '' : '...'}</p>`);
                html += `<p>First common multiple = <span class="highlight">${res.lcm}</span></p></div>`;
                break;
            default:
                // Fallback simple LCM
                const simpleLcm = numbers.reduce((a, b) => (a * b) / gcd(a, b));
                res = { lcm: simpleLcm };
                html = `<p>Calculation complete using standard formula.</p>`;
        }

        document.getElementById('lcmValue').textContent = res.lcm;
        stepsContent.innerHTML = html;
        resultDiv.style.display = 'block';
        stepsDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {
        error.textContent = 'Computation error: ' + e.message;
        error.style.display = 'block';
    }
}

function clearCalculator() {
    document.getElementById('lcmNumbers').value = '';
    document.getElementById('lcmError').style.display = 'none';
    document.getElementById('lcmResult').style.display = 'none';
    document.getElementById('lcmSteps').style.display = 'none';
}
