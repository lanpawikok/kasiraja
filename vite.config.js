import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            input: 'resources/js/app.jsx',
        },
    },
    server: {
        host: '127.0.0.1', // Ubah jadi ini agar sinkron saat buka localhost/127.0.0.1
        port: 5173,
    },
});