/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Dark theme base colors
        background: '#0a0a0f',
        foreground: '#f0f0f5',

        // Primary - Purple
        primary: {
          DEFAULT: '#7c3aed',
          foreground: '#ffffff',
        },

        // Secondary - Dark
        secondary: {
          DEFAULT: '#1a1a2e',
          foreground: '#f0f0f5',
        },

        // Accent - Indigo/Blue
        accent: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
        },

        // Muted - Subtle backgrounds
        muted: {
          DEFAULT: '#1a1a2e',
          foreground: '#a0a0b0',
        },

        // Card backgrounds
        card: {
          DEFAULT: '#12121a',
          foreground: '#f0f0f5',
        },

        // Borders
        border: '#2a2a3e',

        // Input backgrounds
        input: '#1a1a2e',

        // Ring for focus states
        ring: '#6366f1',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(to right, #1a1a2e 1px, transparent 1px), linear-gradient(to bottom, #1a1a2e 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
