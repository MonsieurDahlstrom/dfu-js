// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: [
      {
        file: 'dist/esm.bundle.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/cjs.bundle.js',
        format: 'cjs',
        sourcemap: true
      }
  ],
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    })
  ],
  external: ['jszip', 'buffer', 'crc', 'async', 'events'],
};
