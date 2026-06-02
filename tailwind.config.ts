import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Ana renkler
        bg: {
          primary: '#0a0a0f',    // en koyu arkaplan
          secondary: '#111118',  // kart arkaplanı
          tertiary: '#1a1a24',   // hover arkaplanı
          card: '#13131c',       // kart
        },
        accent: {
          DEFAULT: '#3b82f6',    // mavi ana
          hover: '#2563eb',
          light: '#60a5fa',
          dim: '#1d4ed8',
          glow: 'rgba(59,130,246,0.3)',
        },
        border: {
          DEFAULT: '#1e1e2e',
          hover: '#2a2a3e',
          accent: '#3b82f6',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#9898b0',
          muted: '#555570',
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'accent-glow': 'radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
