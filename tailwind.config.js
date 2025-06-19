// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class', // 다크모드 클래스 방식 활성화
  theme: {
    extend: {
      fontFamily: {
        noto: ['"Noto Serif KR"', 'serif'],
      },
    },
  },
  plugins: [],
};