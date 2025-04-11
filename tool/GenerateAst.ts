import fs from 'fs';
import path from 'path';

class Writer {
  private stream: fs.WriteStream;

  constructor(filePath: string) {
    this.stream = fs.createWriteStream(path.resolve(filePath), {
      encoding: 'utf8',
    });
  }

  println(line: string = ''): void {
    this.stream.write(line + '\n');
  }

  close(): void {
    this.stream.end();
  }
}

class GenerateAst {
  main(args: Array<string>): void {
    if (args.length != 1) {
      console.error('Usage: generate_ast <output directory>');
      process.exit(64);
    }
    const outputDir = args[0];
    this.defineAst(outputDir, 'Expr', [
      'Binary : Expr left, Token operator, Expr right',
      'Grouping : Expr expression',
      'Literal : Object value',
      'Unary : Token operator, Expr right',
    ]);
  }
  private defineAst(
    outputDir: string,
    baseName: string,
    types: Array<string>
  ): void {
    const filePath = path.join(outputDir, `${baseName}.ts`);
    const writer = new Writer(filePath);

    // 对应 Java 代码中的包声明和导入语句
    writer.println('import { Token } from \'./Token\';');
    writer.println();

    writer.println(`abstract class ${baseName} {`);
    this.defineVisitor(writer, baseName, types);

    for (const type of types) {
      const className = type.split(':')[0].trim();
      const fields = type.split(':')[1].trim();
      this.defineType(writer, baseName, className, fields);
    }

    writer.println();
    writer.println('  abstract <R> accept(visitor: Visitor<R>): R;');

    writer.println('}');
    writer.close();
  }

  private defineType(
    writer: Writer,
    baseName: string,
    className: string,
    fieldList: string
  ): void {
    writer.println(`  static class ${className} extends ${baseName} {`);
    // Constructor
    writer.println(`    constructor(${fieldList}) {`);

    // Store parameters in fields.
    const fields = fieldList.split(', ');
    for (const field of fields) {
      const name = field.split(' ')[1];
      writer.println(`      this.${name} = ${name};`);
    }
    writer.println('    }');
    // Visitor pattern.
    writer.println();
    writer.println('    <R> accept(visitor: Visitor<R>): R {');
    writer.println(`      return visitor.visit${className}${baseName}(this);`);
    writer.println('    }');

    writer.println('  }');

    // Fields.
    writer.println();

    for (const field of fields) {
      writer.println(`    readonly ${field};`);
    }
    writer.println('  }');
  }

  private defineVisitor(
    writer: Writer,
    baseName: string,
    types: Array<string>
  ) {
    writer.println('interface Visitor<R> {');

    for (const type of types) {
      const typeName = type.split(':')[0].trim();
      writer.println(
        `  R visit${typeName}${baseName}(${typeName} ${baseName.toLowerCase()}): R;`
      );
    }

    writer.println('}');
  }
}

// 调用 main 方法
const args = process.argv.slice(2);
const generator = new GenerateAst();
generator.main(args);
