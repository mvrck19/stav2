/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/*.html",
    "./app/*.js",
    "./app/svg/**/*.svg"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#235789',
        'primary-dark': '#1a4266',
        'text-gray': '#666',
        'category-bg': '#f1f6fb',
        'border-light': '#d9e4ec',
      },
      borderRadius: {
        'card': '15px',
        'category': '18px',
      },
      fontFamily: {
        'sans': ['Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 600ms ease',
        'slide-up': 'slideUp 400ms cubic-bezier(.2,.9,.4,1)',
        'score-pop': 'scorePop 520ms cubic-bezier(.3,1.4,.4,1)',
        'pulse-custom': 'pulse 1s ease infinite alternate',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        scorePop: {
          '0%': { transform: 'scale(.75)', opacity: '.4' },
          '55%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}

