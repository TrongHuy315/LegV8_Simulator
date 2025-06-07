// // --- **** START: Theme Toggle Functionality **** ---
export function applyTheme(theme, themeToggleButton) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        if(themeToggleButton) themeToggleButton.textContent = '☀️'; // Sun icon for dark theme
    } else {
        document.body.classList.remove('dark-theme');
        if(themeToggleButton) themeToggleButton.textContent = '🌓'; // Moon icon for light theme
    }
}

export function toggleTheme(localStorage, themeToggleButton) {
    let currentTheme = localStorage.getItem('theme') || 'light';
    let newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme, themeToggleButton);
}
