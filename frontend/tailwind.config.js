/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F1F6F2',
        surface: '#FAFCFA',
        'surface-sec': '#E8F0EA',
        'surface-hov': '#E4EEE7',
        'sage-soft': '#DCEBE1',
        seafoam: '#CDE5DA',
        'teal-accent': '#5E9885',
        'teal-primary': '#397B69',
        'teal-hover': '#2F6859',
        'teal-dark': '#285448',
        'text-primary': '#293B33',
        'text-secondary': '#65766D',
        'text-muted': '#849189',
        'border-subtle': '#DCE5DD',
        'border-strong': '#C8D7CC',
        success: '#4F8062',
        warning: '#A77737',
        error: '#B85D58',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
