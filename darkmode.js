/* === LEGACY DARK MODE (Old System) === */

const THEME_KEY = 'gesturix-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/* < Get Theme > */
function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === THEME_LIGHT || stored === THEME_DARK) return stored;
    return THEME_DARK;
}

/* < Set Theme > */
function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleButton(theme);
}

/* < Toggle Dark Mode > */
function toggleDarkMode() {
    const current = getStoredTheme();
    const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(next);
}
window.toggleDarkMode = toggleDarkMode;

/* < Update Button > */
function updateToggleButton(theme) {
    const btn = document.getElementById('darkModeToggle');
    if (!btn) return;
    const icon = btn.querySelector('i.bi');
    const label = btn.querySelector('.dark-mode-label');
    if (icon) {
        icon.classList.remove('bi-moon-stars', 'bi-sun');
        icon.classList.add(theme === THEME_DARK ? 'bi-sun' : 'bi-moon-stars');
    }
    if (label) {
        label.textContent = theme === THEME_DARK ? 'Light mode' : 'Dark mode';
    }
    btn.setAttribute('aria-label', theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode');
}

/* < Initialize > */
function initDarkMode() {
    const theme = getStoredTheme();
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleButton(theme);
}

/* < Auto-Initialize > */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
} else {
    initDarkMode();
}

document.addEventListener('DOMContentLoaded', function() {
    document.documentElement.setAttribute('data-theme', getStoredTheme());
    updateToggleButton(getStoredTheme());
});
