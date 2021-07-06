// rollup.config.js
import resolve from "rollup-plugin-node-resolve";
import babel from "rollup-plugin-babel";
import builtins from "rollup-plugin-node-builtins";

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/esm.bundle.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/cjs.bundle.js",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: [
    babel({
      exclude: "node_modules/**", // only transpile our source code
    }),
    resolve({ preferBuiltins: true }),
    builtins(),
  ],
};
