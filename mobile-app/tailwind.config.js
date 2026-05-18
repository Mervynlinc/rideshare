/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./hooks/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          page: 'var(--bg-page)',
          phone: 'var(--bg-phone)',
          card: 'var(--bg-card)',
          DEFAULT: 'var(--bg-card)',
          'card-alt': 'var(--bg-card-alt)',
          input: 'var(--bg-input)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-light)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          dim: 'var(--accent-dim)',
          glow: 'var(--accent-glow)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
        },
        red: {
          DEFAULT: 'var(--red)',
          dim: 'var(--red-dim)',
        },
        icon: {
          DEFAULT: 'var(--icon)',
          muted: 'var(--icon-muted)',
        },
        text: {
          DEFAULT: 'var(--text)',
          sec: 'var(--text-sec)',
          muted: 'var(--text-muted)',
          dim: 'var(--text-dim)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
