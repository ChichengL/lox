import Lox from "./Lox";
import Token from "./Token";
import { TokenType } from "./TokenType";

class Scanner {
  readonly source: string;
  readonly tokens: Array<Token> = [];
  lox: Lox;
  keywords: Map<string, TokenType> = new Map();
  start: number = 0;
  current: number = 0;
  line: number = 0;
  constructor(source: string, lox: Lox) {
    this.source = source;
    this.keywords = new Map();
    this.lox = lox;
    this.keywords.set("and", TokenType.AND);
    this.keywords.set("class", TokenType.CLASS);
    this.keywords.set("else", TokenType.ELSE);
    this.keywords.set("false", TokenType.FALSE);
    this.keywords.set("for", TokenType.FOR);
    this.keywords.set("fun", TokenType.FUN);
    this.keywords.set("if", TokenType.IF);
    this.keywords.set("nil", TokenType.NIL);
    this.keywords.set("or", TokenType.OR);
    this.keywords.set("print", TokenType.PRINT);
    this.keywords.set("return", TokenType.RETURN);
    this.keywords.set("super", TokenType.SUPER);
    this.keywords.set("this", TokenType.THIS);
    this.keywords.set("true", TokenType.TRUE);
    this.keywords.set("var", TokenType.VAR);
    this.keywords.set("while", TokenType.WHILE);
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
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          while (this.peek() !== "\n" && !this.isAtEnd()) {
            this.advance();
          }
        } else if (this.peekNext() === "*") {
          this.blockComment();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;

      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      case "o":
        if (this.match("r")) {
          this.addToken(TokenType.OR);
        }
        break;
      default:
        if (this.isDigit(char)) {
          // 如果是正常数字那么不进行任何操作，如果是小数点，那么需要判断是否是小数点后面的数字
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          this.lox.error(this.line, "Unexpected character.");
        }
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
  private match(expected: string) {
    if (this.isAtEnd()) return false;
    if (this.source.charAt(this.current) !== expected) return false;
    this.current++;
    return true;
  }
  private peek() {
    if (this.isAtEnd()) return "\0";
    return this.source.charAt(this.current);
  }
  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }
    if (this.isAtEnd()) {
      this.lox.error(this.line, "Unterminated string.");
      return;
    }
    this.advance();
    let value = this.source.substring(this.start, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }
  private number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    this.addToken(
      TokenType.NUMBER,
      Number(this.source.substring(this.start, this.current))
    );
  }
  private isDigit(char: string) {
    return /[0-9]/.test(char);
  }
  private peekNext() {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }
  private identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const text = this.source.substring(this.start, this.current);
    const type = this.keywords.get(text);
    this.addToken(type ?? TokenType.IDENTIFIER);
  }
  private isAlphaNumeric(char: string) {
    return this.isAlpha(char) || this.isDigit(char);
  }
  private isAlpha(char: string) {
    return /[a-zA-Z_]/.test(char);
  }
  private blockComment() {
    // 解析块级注释
    while (this.peek() !== "*" || this.peekNext() !== "/") {
      if (this.peek() === "\n") this.line++;
      this.advance();
      if (this.isAtEnd()) {
        this.lox.error(this.line, "Unterminated block comment.");
        return;
      }
    }
    // 跳过 "*/"
    this.advance(); // '*' 字符
    this.advance(); // '/' 字符

    // 跳过注释内容中可能的空白字符
    while (this.peek() === " " || this.peek() === "\t") {
      this.advance();
    }
  }
}

export default Scanner;
