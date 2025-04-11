import { TokenType } from "./TokenType";

export class Token {
  readonly type: TokenType;
  readonly lexeme: string; //语义
  readonly literal: any; // 文字
  readonly line: number;

  constructor(type: TokenType, lexeme: string, literal: any, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
