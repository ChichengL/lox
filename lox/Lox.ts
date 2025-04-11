import readline, { type Interface } from "readline";
import { readFile } from "fs/promises";
import Scanner from "./Scanner";
import { Expr, Binary, Unary, Literal, Grouping } from "./Expr";
import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { AstPrinter } from "./AstPrinter";

class Lox {
  hadError: boolean;
  rl: Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.hadError = false;
  }

  async runFile(path: string) {
    this.hadError = false;
    try {
      const data = await readFile(path, "utf8");
      this.run(data);
      if (this.hadError) {
        process.exit(65);
      }
    } catch (error) {
      this.error(0, `Failed to read file: ${(error as Error).message}`);
    }
  }

  runPrompt() {
    this.rl.setPrompt("> ");
    this.rl.prompt();

    this.rl
      .on("line", (line) => {
        this.run(line);
        //如果用户犯了错误，则不应终止其整个会话。
        this.hadError = false;
        this.rl.prompt();
      })
      .on("close", () => {
        console.log("Exiting...");
        process.exit(0);
      });
  }

  run(source: string) {
    const scanner = new Scanner(source, this);
    const tokens = scanner.scanTokens();

    for (const token of tokens) {
      console.log(token);
    }
  }

  error(line: number, message: string) {
    this.report(line, "", message);
  }

  report(line: number, where: string, message: string) {
    console.error(`[line ${line}] Error ${where} : ${message}`);
    this.hadError = true;
  }
}
export default Lox;

function main() {
  //解析文件内容
  const args = process.argv.slice(2);
  console.log("args", args);
  if (args.length > 1) {
    console.log("Usage: node --experimental-modules lox.mjs [script]");
    process.exit(64);
  } else if (args.length === 1) {
    const lox = new Lox();
    lox.runFile(args[0]);
  } else {
    const lox = new Lox();
    lox.runPrompt();
  }

  /**
   * 尝试AstPrinter
   */
  const expression: Expr = new Binary(
    new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)),
    new Token(TokenType.STAR, "*", null, 1),
    new Grouping(new Literal(45.67))
  );

  const astPrinter = new AstPrinter();
  const printedExpression = astPrinter.print(expression);
  console.log(printedExpression);
}

main();
