import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '$lib': path.resolve('./src/lib'),
            '$env/dynamic/private': path.resolve('./scripts/val_env.js'),
            '$env/static/private': path.resolve('./scripts/val_env.js'),
            '$app/environment': path.resolve('./scripts/val_app_env.js')
        }
    }
});
