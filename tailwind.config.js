/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        clinic: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22'
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-ring': 'pulseRing 2s infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out'
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.6)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(16, 185, 129, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        }
      }
    },
  },
  plugins: [],
}
