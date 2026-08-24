import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

function unwrap(node) {
  let current = node;
  while (current && (ts.isAsExpression(current) || ts.isSatisfiesExpression?.(current) || ts.isParenthesizedExpression(current) || ts.isTypeAssertionExpression?.(current))) current = current.expression;
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
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") constants[declaration.name.text] = value;
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
  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const helperToKind = { L: "lead", P: "para", Q: "quote", S: "sub" };
    const kind = helperToKind[node.expression.text];
    if (kind && node.arguments.length === 1) {
      const text = valueFromNode(node.arguments[0], constants);
      if (typeof text === "string") return { k: kind, t: text };
    }
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map((element) => valueFromNode(element, constants)).filter((value) => value !== undefined);
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
    for (const declaration of statement.declarationList.declarations) if (ts.isIdentifier(declaration.name) && declaration.name.text === variableName) return declaration.initializer;
  }
  return undefined;
}

function readLiteralArray(relativePath, variableName) {
  const sourceFile = sourceFor(relativePath);
  const constants = constantsFromSource(sourceFile);
  const initializer = variableInitializer(sourceFile, variableName);
  const value = valueFromNode(initializer, constants);
  if (!Array.isArray(value)) throw new Error(`Unable to read ${variableName} from ${relativePath}`);
  return value;
}

function readLiteralObject(relativePath, variableName) {
  const sourceFile = sourceFor(relativePath);
  const constants = constantsFromSource(sourceFile);
  const initializer = variableInitializer(sourceFile, variableName);
  const value = valueFromNode(initializer, constants);
  if (!value || Array.isArray(value) || typeof value !== "object") throw new Error(`Unable to read ${variableName} from ${relativePath}`);
  return value;
}

export function readStories() {
  return readLiteralArray("src/content/stories.ts", "STORIES").filter((story) => story && typeof story.slug === "string");
}

export function readSignals() {
  return readLiteralArray("src/content/magazineSignals.ts", "MAGAZINE_SIGNALS").filter((signal) => signal && typeof signal.slug === "string");
}

export function readTopics() {
  return readLiteralArray("src/content/magazineOperating.ts", "MAGAZINE_TOPICS").filter((topic) => topic && typeof topic.id === "string");
}

export function readArticleTemplates() {
  return readLiteralArray("src/content/magazineEngine.ts", "MAGAZINE_ARTICLE_TEMPLATES").filter((template) => template && typeof template.id === "string");
}

export function readFeatures() {
  const features = {
    ...readLiteralObject("src/content/magazineFeaturesReported.ts", "MAGAZINE_REPORTED_FEATURES"),
    ...readLiteralObject("src/content/magazineFeaturesExplainers.ts", "MAGAZINE_EXPLAINER_FEATURES"),
  };
  const overlays = readLiteralObject("src/content/magazineEvidenceOverlays.ts", "MAGAZINE_EVIDENCE_OVERLAYS");
  for (const [slug, sources] of Object.entries(overlays)) {
    if (!features[slug] || !Array.isArray(sources)) continue;
    features[slug] = {
      ...features[slug],
      addedSources: [...(features[slug].addedSources ?? []), ...sources],
    };
  }
  return features;
}

export function readImages() {
  return readLiteralObject("src/content/imageRegistry.ts", "IMAGES");
}

export function readFoundingEdition() {
  const value = readLiteralObject("src/content/magazineEditorial.ts", "FOUNDING_EDITION");
  if (!Array.isArray(value.items)) throw new Error("Unable to read FOUNDING_EDITION.items from src/content/magazineEditorial.ts");
  return value;
}

export function absoluteUrl(origin, value) {
  return new URL(value || "/", `${origin.replace(/\/$/, "")}/`).toString();
}
