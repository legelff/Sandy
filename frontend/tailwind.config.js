const { colors, borderRadius, spacing } = require('./src/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors,
      borderRadius,
      spacing,
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
