document.addEventListener('DOMContentLoaded', function () {
    const relatedContainer = document.getElementById('related-calculators');
    if (!relatedContainer) return;

    if (typeof calculatorsData === 'undefined') {
        console.error('calculatorsData not loaded');
        return;
    }

    // Identify current page
    const currentPath = window.location.pathname;

    // Robust matching strategy:
    // Extract folder name from path (e.g. /calculators/savings-calculator/index.html -> savings-calculator)
    const pathSegments = currentPath.split('/').filter(s => s.length > 0);

    let currentFolder = '';
    if (pathSegments.length > 0) {
        if (pathSegments[pathSegments.length - 1].toLowerCase() === 'index.html') {
            currentFolder = pathSegments[pathSegments.length - 2];
        } else {
            currentFolder = pathSegments[pathSegments.length - 1];
        }
    }

    const currentCalc = calculatorsData.find(c => c.url.includes(currentFolder));

    // Fallback: If not found, maybe just show random ones? But let's stick to category if possible.
    if (!currentCalc) return;

    const category = currentCalc.category;

    // Filter related
    const related = calculatorsData.filter(c =>
        c.category === category &&
        c.name !== currentCalc.name // Exclude self
    );

    // Shuffle and pick 4
    const shuffled = related.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    if (selected.length === 0) return;

    // Render content
    let html = `
        <div class="container" style="margin-top: 60px; padding-top: 40px; border-top: 1px solid #e2e8f0;">
            <div class="section-header">
                <h3><i class="fas fa-random" style="margin-right:10px; color:#64748b;"></i> Related Calculators</h3>
            </div>
            <div class="grid">
    `;

    selected.forEach(calc => {
        // Construct relative path from current page (inside calculators/X/) back to root then to target
        // current page is at root/calculators/X/index.html
        // target is at root/calculators/Y/index.html
        // absolute relative path: ../../calculators/Y/index.html

        // Ensure calc.url doesn't start with /
        const infoUrl = calc.url.startsWith('/') ? calc.url.substring(1) : calc.url;

        html += `
            <a href="../../${infoUrl}index.html" class="card">
                <h3><i class="fas ${calc.icon}" style="color: #2563eb; margin-right: 8px;"></i> ${calc.name}</h3>
                <p>${calc.desc}</p>
            </a>
        `;
    });

    html += `
            </div>
        </div>
    `;

    relatedContainer.innerHTML = html;
});
