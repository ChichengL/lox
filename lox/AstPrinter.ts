import { Binary, Expr, Grouping, Literal, Unary, Visitor } from "./Expr";
import { Token } from "./Token";
import { TokenType } from "./TokenType";

class AstPrinter implements Visitor<string> {
  print(expr: Expr): string {
    return expr.accept(this);
  }
  visitBinaryExpr(expr: Binary): string {
    return parenthesize(expr.operator.lexeme, expr.left, expr.right);
  }
  // 实现 visitGroupingExpr 方法
  visitGroupingExpr(expr: Grouping): string {
    return parenthesize("group", expr.expression);
  }

  // 实现 visitLiteralExpr 方法
  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return "nil";
    return expr.value.toString();
  }

  // 实现 visitUnaryExpr 方法
  visitUnaryExpr(expr: Unary): string {
    return parenthesize(expr.operator.lexeme, expr.right);
  }
}

function parenthesize(name: string, ...exprs: Expr[]) {
  let result = `(${name}`;
  for (const expr of exprs) {
    result += ` ${expr.accept(new AstPrinter())}`;
  }
  result += ")";
  return result;
}

function main() {
  const expression: Expr = new Binary(
    new Unary(new Token(TokenType.MINUS, "-", null, 1), new Literal(123)),
    new Token(TokenType.STAR, "*", null, 1),
    new Grouping(new Literal(45.67))
  );

  const astPrinter = new AstPrinter();
  const printedExpression = astPrinter.print(expression);
  console.log(printedExpression);
}

// 调用 main 函数
main();
