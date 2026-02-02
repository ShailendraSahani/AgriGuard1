/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e",      // green-500
        "primary-light": "#16a34a", // green-600
        accent: "#eab308",       // yellow-500
        "accent-light": "#ca8a04", // yellow-600
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        full: "9999px",
      },
      boxShadow: {
        modern: "0 10px 25px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        "modern-lg": "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
};
