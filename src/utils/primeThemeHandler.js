// src/utils/primeThemeHandler.js

/**
 * Handles PrimeVue theme switching based on the current application theme
 * @param {string} theme - The current theme ('light', 'dark', or 'auto')
 */
export function setupPrimeVueTheme(theme) {
  // Determine if we should use dark mode
  const isDark = theme === 'dark' || 
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  
  // Update PrimeVue CSS variables
  updatePrimeVueVariables(isDark)
}

/**
 * Updates PrimeVue CSS variables to better integrate with our theme
 * @param {boolean} isDark - Whether dark mode is active
 */
function updatePrimeVueVariables(isDark) {
  // Create a style element for our custom overrides
  let customStyle = document.getElementById('prime-custom-vars')
  
  if (!customStyle) {
    customStyle = document.createElement('style')
    customStyle.id = 'prime-custom-vars'
    document.head.appendChild(customStyle)
  }
  
  // Define theme-specific overrides - using CSS variables from our theme
  const lightOverrides = `
    :root {
      --primary-color: #3B82F6;
      --primary-color-text: #ffffff;
      --surface-ground: var(--color-bg, 249, 250, 251);
      --surface-section: var(--color-surface, 255, 255, 255);
      --surface-card: var(--color-surface, 255, 255, 255);
      --surface-overlay: var(--color-surface, 255, 255, 255);
      --surface-border: var(--color-border, 229, 231, 235);
      --surface-hover: #f1f5f9;
      --focus-ring: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
    }
  `
  
  const darkOverrides = `
    :root {
      --primary-color: #60A5FA;
      --primary-color-text: #1e293b;
      --surface-ground: var(--color-bg, 17, 24, 39);
      --surface-section: var(--color-surface, 31, 41, 55);
      --surface-card: var(--color-surface, 31, 41, 55);
      --surface-overlay: var(--color-surface, 31, 41, 55);
      --surface-border: var(--color-border, 75, 85, 99);
      --surface-hover: #334155;
      --focus-ring: 0 0 0 0.2rem rgba(96, 165, 250, 0.25);
    }
  `
  
  // Apply the appropriate overrides
  customStyle.textContent = isDark ? darkOverrides : lightOverrides
}
