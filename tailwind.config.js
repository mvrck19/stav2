/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/*.html",
    "./app/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#235789',
        'primary-dark': '#1a4266',
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