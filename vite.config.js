import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const backendOrigin = (env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/$/, '');

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.js'],
                refresh: true,
            }),
            tailwindcss(),
        ],
        server: {
            watch: {
                ignored: ['**/storage/framework/views/**'],
            },
            proxy: {
                '/api': {
                    target: backendOrigin,
                    changeOrigin: true,
                    secure: false,
                },
                '/storage': {
                    target: backendOrigin,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});
