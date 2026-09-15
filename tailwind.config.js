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
        // Dark theme
        "bg-main": "#0F1115",
        "bg-card": "#1A1D24",
        "bg-card-hover": "#22262F",
        "text-primary": "#F3F4F6",
        "text-secondary": "#9CA3AF",
        "border-color": "rgba(255, 255, 255, 0.08)",
        
        // Accents
        "accent-indigo": "#6366F1",
        "accent-emerald": "#10B981",
        "accent-amber": "#F59E0B",
        "accent-rose": "#EF4444",
      },
      fontFamily: {
        tajawal: ["Tajawal", "sans-serif"],
      },
    },
  },
  plugins: [],
}
