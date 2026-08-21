import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#1A382B',
                'on-primary': '#FFFFFF',
                'primary-container': '#D2E8DA',
                'on-primary-container': '#052116',
                'primary-fixed-dim': '#B6CDBE',
                'on-primary-fixed': '#052116',
                
                surface: '#F8FAF8',
                'surface-dim': '#E1E3E0',
                'surface-container': '#EEF0ED',
                'surface-container-low': '#F3F5F2',
                'surface-container-lowest': '#FFFFFF',
                'surface-container-high': '#E8EAE7',
                'surface-container-highest': '#E2E4E1',
                'surface-variant': '#E0E4DF',
                'on-surface': '#191C1A',
                'on-surface-variant': '#414944',
                
                background: '#F8FAF8',
                'on-background': '#191C1A',
                
                outline: '#717973',
                'outline-variant': '#C0C8C3',
                error: '#BA1A1A',
                'error-container': '#FFDAD6',
            },
            spacing: {
                xs: '4px',
                sm: '8px',
                md: '16px',
                lg: '24px',
                xl: '32px',
                'pos-touch-target': '64px',
            },
            fontSize: {
                'headline-md': ['24px', '32px'],
                'headline-sm': ['20px', '28px'],
                'body-md': ['14px', '20px'],
                'label-bold': ['14px', '20px'],
                'label-sm': ['11px', '16px'],
                'pos-price': ['18px', '24px'],
            },
        },
    },
    plugins: [forms],
};