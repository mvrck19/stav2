/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./*.js"
  ],
  theme: {
    extend: {
      colors: {
        // Palette from palette.txt
        'white': '#FFFFFF',
        'timberwolf': '#D7D8D7',
        'indigo': '#244B6B',
        'nyanza': '#CDDDC5',
        'olivine': '#ACC499',
        // Legacy compatibility
        'primary': '#244B6B',
        'primary-dark': '#1d3c56',
      },
      fontFamily: {
        'sans': ['Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease',
        'slide-up': 'slideUp 0.4s cubic-bezier(.2,.9,.4,1)',
        'pulse-custom': 'pulse 1s ease infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        }
      },
      zIndex: {
        '999': '999',
        '1000': '1000'
      }
    },
  },
  plugins: [],
}