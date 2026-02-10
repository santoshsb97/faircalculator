/* assets/js/search.js */

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const resultsContent = document.getElementById('searchResultsContent');
    
    // Elements to hide when searching (specific to category pages)
    const staticGrid = document.querySelector('.grid:not(#searchResultsContent)'); 
    const sectionHeaders = document.querySelectorAll('.section-header:not(#searchResults .section-header)');
    
    if (searchInput && resultsContainer && resultsContent) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            // 1. Determine Path Prefix (Handle Home vs Sub-pages)
            // If ROOT_PATH is defined in HTML, use it; otherwise default to empty
            const pathPrefix = (typeof ROOT_PATH !== 'undefined') ? ROOT_PATH : '';

            // 2. Clear Search
            if (query.length === 0) {
                resultsContainer.style.display = 'none';
                if (staticGrid) staticGrid.style.display = 'grid';
                sectionHeaders.forEach(el => el.style.display = 'block');
                return;
            }

            // 3. Active Search
            if (staticGrid) staticGrid.style.display = 'none';
            sectionHeaders.forEach(el => el.style.display = 'none');
            resultsContainer.style.display = 'block';

            // 4. Filter Data
            const filteredData = calculatorsData.filter(item => {
                return item.name.toLowerCase().includes(query) || 
                       item.category.toLowerCase().includes(query) ||
                       (item.desc && item.desc.toLowerCase().includes(query));
            });

            // 5. Render Results
            resultsContent.innerHTML = ''; 
            if (filteredData.length === 0) {
                resultsContent.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                        <p>No tools found matching "<strong>${searchInput.value}</strong>"</p>
                    </div>`;
            } else {
                filteredData.forEach(tool => {
                    const card = document.createElement('a');
                    
                    // Handle Link Pathing
                    let linkUrl = tool.url;
                    if (!linkUrl.startsWith('http') && !linkUrl.startsWith('../')) {
                        linkUrl = pathPrefix + linkUrl;
                    }

                    card.href = linkUrl;
                    card.className = 'card'; 
                    card.innerHTML = `
                        <h3><i class="fas ${tool.icon || 'fa-calculator'}" style="margin-right:8px; color:var(--primary);"></i>${tool.name}</h3>
                        <p>${tool.desc}</p>
                        <div style="margin-top:auto; font-size:0.85rem; font-weight:600; color:var(--primary);">Open Tool &rarr;</div>
                    `;
                    resultsContent.appendChild(card);
                });
            }
        });
    }
});