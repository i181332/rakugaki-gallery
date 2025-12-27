/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['M PLUS Rounded 1c', 'sans-serif'],
        serif: ['Noto Serif JP', 'serif'],
      },
      animation: {
        'spin-slow': 'spin 1.5s linear infinite',
      },
      // UI.htmlのカラーはTailwindのデフォルトを使用
      // slate, indigo, emerald, rose, yellow, red, blue, green などすべてデフォルト
    },
  },
  plugins: [],
};
