import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

function unwrap(node) {
  let current = node;
  while (
    current &&
    (ts.isAsExpression(current) ||
      ts.isSatisfiesExpression?.(current) ||
      ts.isParenthesizedExpression(current) ||
      ts.isTypeAssertionExpression?.(current))
  ) {
    current = current.expression;
  }
  return current;
}

function propertyName(node) {
  if (!node) return "";
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return "";
}

function constantsFromSource(sourceFile) {
  const constants = {};
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const value = valueFromNode(declaration.initializer, constants);
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        constants[declaration.name.text] = value;
      }
    }
  }
  return constants;
}

function valueFromNode(rawNode, constants = {}) {
  const node = unwrap(rawNode);
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isIdentifier(node)) return constants[node.text];

  if (ts.isTemplateExpression(node)) {
    let output = node.head.text;
    for (const span of node.templateSpans) {
      const value = valueFromNode(span.expression, constants);
      if (value === undefined) return undefined;
      output += String(value) + span.literal.text;
    }
    return output;
  }

  if (ts.isArrayLiteralExpression(node)) {
    return node.elements
      .map((element) => valueFromNode(element, constants))
      .filter((value) => value !== undefined);
  }

  if (ts.isObjectLiteralExpression(node)) {
    const object = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) continue;
      const key = propertyName(property.name);
      if (!key) continue;
      const value = valueFromNode(property.initializer, constants);
      if (value !== undefined) object[key] = value;
    }
    return object;
  }

  return undefined;
}

function sourceFor(relativePath) {
  const absolute = path.join(root, relativePath);
  const text = fs.readFileSync(absolute, "utf8");
  return ts.createSourceFile(relativePath, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function variableInitializer(sourceFile, variableName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) return declaration.initializer;
    }
  }
  return undefined;
}

export function readStories() {
  const sourceFile = sourceFor("src/content/stories.ts");
  const constants = constantsFromSource(sourceFile);
  const initializer = variableInitializer(sourceFile, "STORIES");
  const value = valueFromNode(initializer, constants);
  if (!Array.isArray(value)) throw new Error("Unable to read STORIES from src/content/stories.ts");
  return value.filter((story) => story && typeof story.slug === "string");
}

export function readImages() {
  const sourceFile = sourceFor("src/content/imageRegistry.ts");
  const constants = constantsFromSource(sourceFile);
  const initializer = variableInitializer(sourceFile, "IMAGES");
  const value = valueFromNode(initializer, constants);
  if (!value || Array.isArray(value) || typeof value !== "object") throw new Error("Unable to read IMAGES from src/content/imageRegistry.ts");
  return value;
}

export function absoluteUrl(origin, value) {
  return new URL(value || "/", `${origin.replace(/\/$/, "")}/`).toString();
}
