/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',      // iPhone SE, small phones
        'sm': '640px',      // Small tablets
        'md': '768px',      // iPad Mini
        'lg': '1024px',     // iPad Pro
        'xl': '1280px',     // Desktop
        '2xl': '1536px',    // Large desktop
        // Device-specific breakpoints
        'iphone-se': '375px',
        'iphone-pro': '393px',
        'iphone-max': '430px',
        'galaxy-s': '360px',
        'galaxy-ultra': '412px',
        'pixel': '412px',
      },
    },
  },
  plugins: [],
}

