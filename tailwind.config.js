/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      colors: {
        // Sher Brand
        'sher-bg': 'var(--bg)',
        'sher-bg-secondary': 'var(--bg-secondary)',
        'sher-surface': 'var(--surface)',
        'sher-surface-elevated': 'var(--surface-elevated)',
        'sher-border': 'var(--border)',
        'sher-border-hover': 'var(--border-hover)',
        'sher-brand': 'var(--brand)',
        'sher-brand-hover': 'var(--brand-hover)',
        'sher-accent': 'var(--accent)',
        'sher-cta': 'var(--cta)',
        
        // Holiday
        'holiday-red': 'var(--holiday-red)',
        'holiday-red-deep': 'var(--holiday-red-deep)',
        'frost': 'var(--frost)',
        'evergreen': 'var(--evergreen)',
        'holiday-green': 'var(--holiday-green)',
        'holiday-primary': 'var(--holiday-primary)',
        'holiday-secondary': 'var(--holiday-secondary)',
        'holiday-accent': 'var(--holiday-accent)',
        
        // Text
        'text-primary': 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        
        // States
        'success': 'var(--success)',
        'warning': 'var(--warning)',
        'error': 'var(--error)',
        
        // Legacy colors (for backward compatibility)
        'deep-navy': '#0B1120',
        'glass-surface': '#1E293B',
        'cranberry': '#BE123C',
        'gold': '#FCD34D',
        'soft-white': '#F8FAFC',
        'muted-gray': '#94A3B8',
        'emerald': '#10B981',
        'dark-evergreen': '#064E3B',
        'cyan-accent': '#06B6D4',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glow-holiday': 'var(--shadow-holiday)',
        'frost': '0 0 20px rgba(255, 255, 255, 0.1)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'full': 'var(--radius-full)',
      },
      transitionDuration: {
        'fast': 'var(--transition-fast)',
        'base': 'var(--transition-base)',
        'slow': 'var(--transition-slow)',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      animation: {
        'gradient-bg': 'gradient-bg 15s ease infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse-slow 8s infinite ease-in-out',
        'gradient': 'gradient 4s linear infinite',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'gradient-bg': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
