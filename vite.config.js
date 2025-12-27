import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Development mode: serve the example
  if (mode === 'development') {
    return {
      root: './example',
      server: {
        port: 3000,
      },
    };
  }

  // Production mode: build the library
  return {
    build: {
      minify: false,
      lib: {
        entry: resolve(__dirname, 'src/parchment.js'),
        name: 'Parchment',
        fileName: (format) => `parchment.${format}.js`,
        formats: ['es', 'umd'],
      },
      rollupOptions: {
        output: {
          assetFileNames: 'parchment.[ext]',
        },
      },
    },
  };
});
