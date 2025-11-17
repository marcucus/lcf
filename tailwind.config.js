/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // LCF Brand accent color
        accent: '#1CCEFF',
        // Accessible variant for light backgrounds (WCAG AA compliant)
        'accent-dark': '#0E677F',
        // Light theme colors
        light: {
          bg: '#FFFFFF',
          'bg-secondary': '#F8F9FA',
          text: '#212529',
          border: '#DEE2E6',
        },
        // Dark theme colors
        dark: {
          bg: '#121212',
          'bg-secondary': '#1E1E1E',
          text: '#EAEAEA',
          border: '#424242',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
