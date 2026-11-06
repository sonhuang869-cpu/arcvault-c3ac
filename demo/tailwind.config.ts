import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: {
          base: '#0A0F1A',
          surface: '#111827',
          elevated: '#1A2235',
          border: '#1E293B',
        },
        cyan: {
          primary: '#06B6D4',
          dim: '#0E7490',
          glow: 'rgba(6,182,212,0.15)',
        },
        status: {
          paid: '#10B981',
          'paid-bg': 'rgba(16,185,129,0.12)',
          overdue: '#EF4444',
          'overdue-bg': 'rgba(239,68,68,0.12)',
          warn: '#F59E0B',
          'warn-bg': 'rgba(245,158,11,0.12)',
          info: '#3B82F6',
          'info-bg': 'rgba(59,130,246,0.12)',
          neutral: '#64748B',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#475569',
          inverse: '#0A0F1A',
        },
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-8px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
