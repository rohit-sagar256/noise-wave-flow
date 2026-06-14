import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

function copyDts() {
    return {
        name: 'copy-dts',
        closeBundle() {
            copyFileSync('src/index.d.ts', 'dist/index.d.ts');
            copyFileSync('src/react.d.ts', 'dist/react.d.ts');
        },
    };
}

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(import.meta.dirname, 'src/index.js'),
                react: resolve(import.meta.dirname, 'src/react.js'),
            },
        },
        rollupOptions: {
            external: ['react'],
            output: [
                {
                    format: 'es',
                    entryFileNames: '[name].js',
                    chunkFileNames: '[name].js',
                    dir: 'dist',
                },
                {
                    format: 'cjs',
                    entryFileNames: '[name].cjs',
                    chunkFileNames: '[name].cjs',
                    dir: 'dist',
                },
            ],
        },
        sourcemap: true,
    },
    plugins: [copyDts()],
});
