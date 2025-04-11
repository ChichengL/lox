import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
  input: "dist/Lox.js",
  output: {
    file: "dist/bundle.js", // 根据你的项目实际情况修改
    format: "es",
  },
  plugins: [
    nodeResolve({
      extensions: [".js", ".json", ".ts"], // 配置需要处理的扩展名
    }),
  ],
};
