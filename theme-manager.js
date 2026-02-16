/**
 * GESTURIX THEME MANAGER
 * Handles light/dark mode switching with proper color schemes
 */

const THEME_KEY = 'gesturix-theme';
const THEME_DARK = 'dark';
const THEME_LIGHT = 'light';

// Color schemes based on your logo designs
const COLORS = {
    dark: {
        // Dark mode - based on darkmodelogo.png (yellow & blue)
        mainBg: '#000035',           // Deep navy blue background
        containerBg: '#1a1a7e',      // Slightly lighter blue for containers
        secondaryBg: '#2a2a8e',      // Secondary blue elements
        accentYellow: '#ffff02',     // Bright yellow accent (from logo)
        accentYellowHover: '#e6e602',// Yellow hover state
        textPrimary: '#ffffff',      // White text
        textSecondary: '#e0e0e0',    // Light gray text
        border: '#3a3a9e',           // Border color
        borderHover: '#ffff02',      // Yellow border on hover
    },
    light: {
        // Light mode - based on lightmodelogo.png (turquoise/teal palette)
        mainBg: '#f0f8fa',           // Very light blue-white background
        containerBg: '#ffffff',      // Pure white containers
        secondaryBg: '#e8f4f8',      // Light blue-gray secondary
        accentYellow: '#4798C2',     // Ocean blue accent (from palette)
        accentYellowHover: '#3a7ba8',// Darker blue hover
        textPrimary: '#2c5f6f',      // Dark teal text
        textSecondary: '#5a8a9a',    // Medium teal text
        border: '#7BBDC9',           // Turquoise border (from palette)
        borderHover: '#4798C2',      // Ocean blue border on hover (from palette)
    }
};

/**
 * Get stored theme from localStorage
 */
function getStoredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === THEME_LIGHT || stored === THEME_DARK) return stored;
    // Default to dark mode
    return THEME_DARK;
}

/**
 * Apply theme colors to CSS variables
 */
function applyThemeColors(theme) {
    const colors = COLORS[theme];
    const root = document.documentElement;
    
    // Apply CSS custom properties
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

/**
 * Set theme and update UI
 */
function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    applyThemeColors(theme);
    updateToggleButton(theme);
    updateLogo(theme);
    
    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

/**
 * Toggle between light and dark mode
 */
function toggleTheme() {
    const current = getStoredTheme();
    const next = current === THEME_DARK ? THEME_LIGHT : THEME_DARK;
    setTheme(next);
}

/**
 * Update the theme toggle button UI
 */
function updateToggleButton(theme) {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    
    const icon = btn.querySelector('[data-lucide]');
    const label = btn.querySelector('.theme-label');
    
    if (icon) {
        // Update icon
        if (theme === THEME_DARK) {
            icon.setAttribute('data-lucide', 'sun');
        } else {
            icon.setAttribute('data-lucide', 'moon');
        }
        // Reinitialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    if (label) {
        label.textContent = theme === THEME_DARK ? 'Light mode' : 'Dark mode';
    }
    
    btn.setAttribute('aria-label', theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode');
    btn.setAttribute('title', theme === THEME_DARK ? 'Switch to light mode' : 'Switch to dark mode');
}

/**
 * Update logo based on theme
 */
function updateLogo(theme) {
    const logos = document.querySelectorAll('.theme-logo');
    logos.forEach(logo => {
        if (theme === THEME_DARK) {
            logo.src = 'darkmodelogo.png';
            logo.alt = 'Gesturix Logo - Dark Mode';
        } else {
            // Use lightmode.png when available, fallback to darkmodelogo.png
            logo.src = 'lightmode.png';
            logo.alt = 'Gesturix Logo - Light Mode';
            
            // Fallback if lightmode.png doesn't exist
            logo.onerror = function() {
                this.src = 'darkmodelogo.png';
                this.onerror = null;
            };
        }
    });
}

/**
 * Initialize theme on page load
 */
function initTheme() {
    const theme = getStoredTheme();
    document.documentElement.setAttribute('data-theme', theme);
    applyThemeColors(theme);
    updateToggleButton(theme);
    updateLogo(theme);
}

/**
 * Create theme toggle button HTML
 */
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

// Initialize theme as early as possible
if (document.readyState === 'loading') {
    // Apply theme colors immediately to prevent flash
    applyThemeColors(getStoredTheme());
    document.addEventListener('DOMContentLoaded', initTheme);
} else {
    initTheme();
}

// Make functions available globally
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.getStoredTheme = getStoredTheme;
window.createThemeToggleButton = createThemeToggleButton;
