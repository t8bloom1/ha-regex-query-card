import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const dev = process.env.ROLLUP_WATCH;
const production = !dev;

export default {
  input: 'src/ha-regex-query-card.ts',
  output: [
    {
      file: 'dist/ha-regex-query-card.js',
      format: 'es',
      sourcemap: true,
    },
    // Create minified version for production
    production && {
      file: 'dist/ha-regex-query-card.min.js',
      format: 'es',
      sourcemap: true,
      plugins: [terser({
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: {
          properties: {
            regex: /^_/,
          },
        },
      })],
    },
  ].filter(Boolean),
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    typescript({
      declaration: false,
      outDir: 'dist',
      sourceMap: true,
    }),
    // Basic minification for development builds
    dev && terser({
      format: {
        comments: true,
      },
      compress: false,
      mangle: false,
    }),
  ].filter(Boolean),
  external: [],
  // Optimize bundle size
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    unknownGlobalSideEffects: false,
  },
};