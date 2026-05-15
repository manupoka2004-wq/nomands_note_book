/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'touch-target',
    'safe-area-top',
    'safe-area-bottom',
    'safe-area-left',
    'safe-area-right',
    'no-overflow-x',
    'container-mobile',
    'container-fluid',
    'grid-responsive',
    'grid-responsive-2',
    'grid-responsive-3',
    'card-responsive',
    'text-responsive-xs',
    'text-responsive-sm',
    'text-responsive-base',
    'text-responsive-lg',
    'text-responsive-xl',
    'text-responsive-2xl',
    'text-responsive-3xl',
    'space-responsive-2',
    'space-responsive-4',
    'space-responsive-6',
    'mobile-nav',
    'mobile-nav-item',
    'modal-responsive',
    'modal-content-responsive',
    'table-responsive',
    'table-mobile-card',
    'form-responsive',
    'form-group-responsive',
    'button-responsive',
    'button-group-responsive',
    'will-change-transform',
    'gpu-accelerated',
    'glass-panel',
    'glass-sidebar',
    'glass-header',
    'animate-float',
    'animate-pulse-slow',
    'gradient-text',
    'perspective-container',
    'preserve-3d'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        indigo: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          600: '#4f46e5',
          700: '#4338ca',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}
