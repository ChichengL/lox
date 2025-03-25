import Lox from "./Lox";
import Token from "./Token";
import { TokenType } from "./TokenType";

class Scanner {
  readonly source: string;
  readonly tokens: Array<Token> = [];
  readonly lox: Lox = new Lox();
  start: number = 0;
  current: number = 0;
  line: number = 0;
  constructor(source: string) {
    this.source = source;
  }
  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }
    this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
    return this.tokens;
  }
  isAtEnd() {
    return this.current >= this.source.length;
  }
  scanToken(): void {
    const char = this.advance();
    switch (char) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      default:
        this.lox.error(this.line, "Unexpected character.");
        break;
    }
  }
  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private addToken(type: TokenType): void;
  private addToken(type: TokenType, literal: any): void;
  private addToken(type: TokenType, literal: any = null): void {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }
}

export default Scanner;
