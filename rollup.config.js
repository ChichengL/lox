import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

const addJsExtension = () => {
  return {
    name: "add-js-extension",
    transform(code, id) {
      const pattern = /(import|export)(.*)from\s+(['"])([^'"]+)(['"]);/g;
      const newCode = code.replace(
        pattern,
        (match, importOrExport, rest, quote1, path, quote2) => {
          if (
            !path.includes("node_modules") &&
            !path.endsWith(".js") &&
            !path.endsWith(".json") &&
            !path.endsWith(".ts")
          ) {
            console.log(`Adding .js extension to: ${path} in ${id}`);
            return `${importOrExport}${rest}from ${quote1}${path}.js${quote2};`;
          }
          return match;
        }
      );
      return {
        code: newCode,
        map: null,
      };
    },
    resolveId(source, importer) {
      if (
        !source.endsWith(".js") &&
        !source.endsWith(".json") &&
        !source.endsWith(".ts")
      ) {
        const resolved = this.resolve(source + ".js", importer, {
          skipSelf: true,
        });
        return resolved;
      }
      return null;
    },
  };
};

// 定义一个函数来识别 Node.js 内置模块
const isNodeBuiltin = (id) => {
  const builtins = [
    "assert",
    "buffer",
    "child_process",
    "cluster",
    "console",
    "constants",
    "crypto",
    "dgram",
    "dns",
    "domain",
    "events",
    "fs",
    "http",
    "https",
    "net",
    "os",
    "path",
    "process",
    "punycode",
    "querystring",
    "readline",
    "repl",
    "stream",
    "string_decoder",
    "sys",
    "timers",
    "tls",
    "tty",
    "url",
    "util",
    "v8",
    "vm",
    "zlib",
  ];
  return builtins.some((builtin) => id.startsWith(builtin));
};

export default {
  input: "lox/Lox.ts",
  output: {
    entryFileNames: "[name].js",
    chunkFileNames: "[name]-[hash].js",
    file: "dist/bundle.js",
    format: "es",
  },
  plugins: [
    nodeResolve({
      extensions: [".js", ".json", ".ts"],
    }),
    typescript(),
    addJsExtension(),
  ],
  // 将 Node.js 内置模块标记为外部依赖
  external: (id) => isNodeBuiltin(id),
};
