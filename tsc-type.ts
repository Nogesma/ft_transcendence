import * as ts from "typescript";

function extractTypeSignature(filename: string, aliasName: string): string {
  const program: ts.Program = ts.createProgram([filename], {
    emitDeclarationOnly: true,
  });
  const sourceFile: ts.SourceFile = program.getSourceFile(filename);
  const typeChecker: ts.TypeChecker = program.getTypeChecker();
  // Get the declaration node you're looking for by it's type name.
  // This condition can be adjusted to your needs
  const statement: ts.Statement | undefined = sourceFile.statements.find(
    (s) => ts.isTypeAliasDeclaration(s) && s.name.text === aliasName
  );
  if (!statement) {
    throw new Error(`Type: '${aliasName}' not found in file: '${filename}'`);
  }
  const type: ts.Type = typeChecker.getTypeAtLocation(statement);
  const fields: string[] = [];
  // Iterate over the `ts.Symbol`s representing Property Nodes of `ts.Type`
  for (const prop of type.getProperties()) {
    const name: string = prop.getName();
    const propType: ts.Type = typeChecker.getTypeOfSymbolAtLocation(
      prop,
      statement
    );
    const propTypeName: string = typeChecker.typeToString(propType);
    fields.push(`${name}: ${propTypeName};`);
  }
  return `type ${aliasName} = {\n  ${fields.join("\n  ")}\n}`;
}

console.log(extractTypeSignature("./src/main.ts", "test"));
console.log(extractTypeSignature("./src/main.ts", "t"));
console.log(extractTypeSignature("./src/main.ts", "u"));
