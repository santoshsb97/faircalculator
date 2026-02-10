/* uk-stamp-duty-calculator - Lazy Loaded JavaScript */

const searchInput = document.getElementById('searchInput');
    const toolContainer = document.getElementById('tool-container');
    if (searchInput && toolContainer) {
      searchInput.addEventListener('input', (e) => {
        toolContainer.style.display = e.target.value.trim().length > 0 ? 'none' : 'block';
      });
    }