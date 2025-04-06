import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "dist/Lox.js",
  output: {
    file: "dist/bundle.js",
    format: "es",
  },
  plugins: [nodeResolve()],
  external: ["readline", "fs/promises"], // 声明外部依赖
};
