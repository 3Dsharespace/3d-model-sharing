/** @type {import('tailwindcss').Config} */
import forms from '@tailwindcss/forms'
import typography from '@tailwindcss/typography'
import animate from 'tailwindcss-animate'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
        '4xl': '2560px',
        // Mobile-first breakpoints
        'mobile': {'max': '767px'},
        'tablet': {'min': '768px', 'max': '1023px'},
        'desktop': {'min': '1024px'},
        // Touch device detection
        'touch': {'raw': '(hover: none) and (pointer: coarse)'},
        'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
      },
      colors: {
        // Luxury Light Theme Colors
        luxury: {
          bg: {
            primary: '#faf9f7',    // Warm off-white background
            secondary: '#f5f3f0',  // Slightly darker warm background
            card: '#ffffff',       // Pure white for cards
            hover: '#f8f6f3',      // Hover state background
          },
          text: {
            primary: '#2d3748',    // Dark warm gray for primary text
            secondary: '#4a5568',  // Medium warm gray for secondary text
            muted: '#718096',      // Light warm gray for muted text
          },
          border: {
            default: '#e2dcd4',    // Warm border color
            light: '#f0ebe5',      // Light warm border
          },
          accent: {
            default: '#8b5a3c',    // Warm brown accent
            light: '#a67c52',      // Light warm brown
            dark: '#6d4429',       // Dark warm brown
          }
        },
        // Primary blue colors
        primary: {
          50: '#f8faff',    // Lightest blue tint on white
          100: '#f0f4ff',   // Very light blue
          200: '#e0e8ff',   // Light blue accent
          300: '#c7d7fe',   // Soft blue
          400: '#a5b9fc',   // Medium blue
          500: '#6b7ff7',   // Primary brand blue
          600: '#4f5ae8',   // Darker blue
          700: '#3b47d9',   // Deep blue
          800: '#2d3ab8',   // Dark blue
          900: '#1e2a8a',   // Darkest blue
        },
        // White-based neutrals for soft white theme
        neutral: {
          0: '#fafafa',     // Soft off-white background
          50: '#fefefe',    // Off-white
          100: '#f9f9f9',   // Very light gray
          200: '#f4f4f4',   // Light gray
          300: '#e5e5e5',   // Border gray
          400: '#d4d4d4',   // Medium gray
          500: '#a3a3a3',   // Text gray
          600: '#737373',   // Dark text gray
          700: '#525252',   // Darker text
          800: '#404040',   // Very dark text
          900: '#171717',   // Nearly black
        },
        // Accent colors for highlights
        accent: {
          50: '#f0fdff',
          100: '#ccf7fe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Legacy color support for backward compatibility
        secondary: {
          50: '#fafafa',    // Soft off-white for light theme
          100: '#f9f9f9',   // Very light gray
          200: '#f4f4f4',   // Light gray
          300: '#e5e5e5',   // Border gray
          400: '#d4d4d4',   // Medium gray
          500: '#a3a3a3',   // Text gray
          600: '#737373',   // Dark text gray
          700: '#525252',   // Darker text
          800: '#404040',   // Very dark text
          900: '#171717',   // Nearly black (for dark theme)
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [forms, typography, animate],
}
