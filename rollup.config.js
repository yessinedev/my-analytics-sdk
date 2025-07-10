import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/analytics.js",
      format: "umd",
      name: "Analytics",
      sourcemap: true,
    },
    {
      file: "dist/analytics.min.js",
      format: "umd",
      name: "Analytics",
      sourcemap: false,
      plugins: [terser()], // minify this output
    },
  ],
  plugins: [resolve(), commonjs(), typescript({ sourceMap: true })],
};
