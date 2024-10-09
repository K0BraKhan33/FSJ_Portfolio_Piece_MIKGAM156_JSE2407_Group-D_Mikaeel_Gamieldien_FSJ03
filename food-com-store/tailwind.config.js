/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: '#1F3B4D',      // Navy Blue
        teal: '#3AAFA9',      // Teal
        coral: '#FF6F61',     // Coral
        softGray: '#E5E5E5',  // Soft Gray
        mustard: '#FFD166',   // Mustard Yellow
      },
    },
  },
  plugins: [],
};
