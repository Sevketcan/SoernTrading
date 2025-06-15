/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/styles/**/*.{css,scss,sass}', // Include CSS modules for purging
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            // Custom color palette
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                gray: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                },
            },

            // Custom font families
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },

            // Custom spacing for consistent layout
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },

            // Custom animations
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
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
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },

            // Custom shadows
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
                'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
            },

            // Custom border radius
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [
        // Plugin for better form styling
        require('@tailwindcss/forms'),

        // Plugin for typography (if using rich text)
        require('@tailwindcss/typography'),

        // Custom plugin for component variations
        function ({ addComponents, theme }) {
            addComponents({
                // Container component
                '.container-custom': {
                    maxWidth: theme('screens.2xl'),
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingLeft: theme('spacing.4'),
                    paddingRight: theme('spacing.4'),
                    '@screen sm': {
                        paddingLeft: theme('spacing.6'),
                        paddingRight: theme('spacing.6'),
                    },
                    '@screen lg': {
                        paddingLeft: theme('spacing.8'),
                        paddingRight: theme('spacing.8'),
                    },
                },

                // Common button base styles
                '.btn-base': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: theme('borderRadius.md'),
                    fontWeight: theme('fontWeight.medium'),
                    transition: 'all 0.2s ease-in-out',
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 2px ${theme('colors.blue.500')}40`,
                    },
                },
            })
        },

        // Plugin for custom utilities
        function ({ addUtilities }) {
            addUtilities({
                '.text-balance': {
                    'text-wrap': 'balance',
                },
                '.animation-delay-100': {
                    'animation-delay': '100ms',
                },
                '.animation-delay-200': {
                    'animation-delay': '200ms',
                },
                '.animation-delay-300': {
                    'animation-delay': '300ms',
                },
            })
        },
    ],
} 