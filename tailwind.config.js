/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,js,jsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        'main': '#F66040',
        'second': '#47019d',
        'three': '#e00256',
        'black': '#212121',
        'white': '#ffffff',
        'gray': '#808080e2'
      }
    },
    color: {
      primary: '#F66040'
    }
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: ["cupcake"],
  }
}
