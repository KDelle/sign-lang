/* === GESTURIX THEME MANAGER === */

/* < Constants > */
const THEME_KEY = 'gesturix-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

/* < Color Schemes > */
const COLORS = {
    dark: {
        mainBg: '#000035',
        containerBg: '#1a1a7e',
        secondaryBg: '#2a2a8e',
        accentYellow: '#ffff02',
        accentYellowHover: '#e6e602',
        textPrimary: '#ffffff',
        textSecondary: '#e0e0e0',
        border: '#3a3a9e',
        borderHover: '#ffff02',
    },
    light: {
        mainBg: '#f0f8fa',
        containerBg: '#ffffff',
        secondaryBg: '#e8f4f8',
        accentYellow: '#4798C2',
        accentYellowHover: '#3a7ba8',
        textPrimary: '#2c5f6f',
        textSecondary: '#5a8a9a',
        border: '#7BBDC9',
        borderHover: '#4798C2',
    }
};

/* < Get Stored Theme > */
function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === THEME_LIGHT || stored === THEME_DARK) return stored;
    return THEME_DARK;
}

/* < Apply Theme Colors > */
function applyThemeColors(theme) {
    const colors = COLORS[theme];
    const root = document.documentElement;
    
    root.style.setProperty('--color-main-bg', colors.mainBg);
    root.style.setProperty('--color-container-bg', colors.containerBg);
    root.style.setProperty('--color-secondary-bg', colors.secondaryBg);
    root.style.setProperty('--color-accent', colors.accentYellow);
    root.style.setProperty('--color-accent-hover', colors.accentYellowHover);
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-border-hover', colors.borderHover);
}

/* < Set Theme > */
function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    applyThemeColors(theme);
    updateToggleButton(theme);
    updateLogo(theme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

/* < Toggle Theme > */
function toggleTheme() {
    const current = getStoredTheme();
    const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(next);
}

/* < Update Toggle Button > */
function updateToggleButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    
    const icon = btn.querySelector('[data-lucide]');
    const label = btn.querySelector('.theme-label');
    
    if (icon) {
        icon.setAttribute('data-lucide', theme === THEME_DARK ? 'sun' : 'moon');
        if (window.lucide) lucide.createIcons();
    }
    
    if (label) {
        label.textContent = theme === THEME_DARK ? 'Light mode' : 'Dark mode';
    }
    
    btn.setAttribute('aria-label', theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode');
}

/* < Update Logo > */
function updateLogo(theme) {
    const logos = document.querySelectorAll('.theme-logo');
    logos.forEach(logo => {
        if (theme === THEME_DARK) {
            logo.src = 'darkmodelogo.png';
            logo.alt = 'Gesturix Logo - Dark Mode';
        } else {
            logo.src = 'lightmode.png';
            logo.alt = 'Gesturix Logo - Light Mode';
            logo.onerror = function() {
                this.src = 'darkmodelogo.png';
                this.onerror = null;
            };
        }
    });
}

/* < Initialize Theme > */
function initTheme() {
    const theme = getStoredTheme();
    document.documentElement.setAttribute('data-theme', theme);
    applyThemeColors(theme);
    updateToggleButton(theme);
    updateLogo(theme);
}

/* < Create Toggle Button HTML > */
function createThemeToggleButton() {
    const theme = getStoredTheme();
    const icon = theme === THEME_DARK ? 'sun' : 'moon';
    const label = theme === THEME_DARK ? 'Light mode' : 'Dark mode';
    
    return `
        <button 
            id="themeToggle" 
            onclick="toggleTheme()" 
            class="theme-toggle-btn"
            aria-label="${theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode'}"
            title="${theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode'}"
        >
            <i data-lucide="${icon}" class="w-4 h-4"></i>
            <span class="theme-label">${label}</span>
        </button>
    `;
}

/* < Auto-Initialize > */
if (document.readyState === 'loading') {
    applyThemeColors(getStoredTheme());
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

/* < Global Functions > */
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.getStoredTheme = getStoredTheme;
window.createThemeToggleButton = createThemeToggleButton;
