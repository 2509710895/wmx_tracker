// import path from "path";
import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/core/index.ts",
    output: [
      {
        file: "./dist/index.esm.js",
        format: "es",
      },
      {
        file: "./dist/index.cjs.js",
        format: "cjs",
      },
      {
        file: "./dist/index.umd.js",
        format: "umd",
        name: "wmxTracker",
      },
    ],
    plugins: [typescript()],
  },
  {
    input: "src/core/index.ts",
    output: {
      file: "./dist/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
