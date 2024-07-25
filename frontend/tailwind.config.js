/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      aspectRatio: {
        '3/2': '3 / 2',
      },
    },
  },
  plugins: [],
}

