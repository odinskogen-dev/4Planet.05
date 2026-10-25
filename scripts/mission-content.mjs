import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const EXTERNAL_HANDOFF_SLUGS = new Set(["m4gazine", "4film"]);

// Build-time projection of the canonical mission content, never a duplicate editorial store.
export function readLocalMissionRecords(root = process.cwd()) {
  const file = path.join(root, "src/content/missions.ts");
  const ast = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statement = ast.statements
    .filter(ts.isVariableStatement)
    .flatMap((item) => [...item.declarationList.declarations])
    .find((item) => ts.isIdentifier(item.name) && item.name.text === "MISSION_CONTENT");
  if (!statement?.initializer || !ts.isArrayLiteralExpression(statement.initializer)) {
    throw new Error("Missing canonical MISSION_CONTENT; no partial prerender");
  }
  const required = ["slug", "name", "domain", "hero", "thesis", "issue", "whyItMatters", "whatCanHelp", "fourPlanetRole", "currentStatus"];
  const records = statement.initializer.elements.map((entry) => {
    if (!ts.isObjectLiteralExpression(entry)) throw new Error("Unsupported mission entry");
    const read = (key) => {
      const field = entry.properties.find((prop) =>
        ts.isPropertyAssignment(prop) &&
        (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) && prop.name.text === key);
      return field && ts.isStringLiteralLike(field.initializer) ? field.initializer.text : null;
    };
    // Source pointers are projected from canonical MISSION_CONTENT, never re-authored.
    const sourceProperty = entry.properties.find((prop) =>
      ts.isPropertyAssignment(prop) &&
      (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) && prop.name.text === "sources");
    if (!sourceProperty || !ts.isArrayLiteralExpression(sourceProperty.initializer)) {
      throw new Error("Missing canonical mission source list");
    }
    const sources = sourceProperty.initializer.elements.map((source) => {
      if (!ts.isObjectLiteralExpression(source)) throw new Error("Invalid mission source entry");
      const field = (key) => {
        const prop = source.properties.find((value) =>
          ts.isPropertyAssignment(value) &&
          (ts.isIdentifier(value.name) || ts.isStringLiteral(value.name)) && value.name.text === key);
        return prop && ts.isStringLiteralLike(prop.initializer) ? prop.initializer.text : null;
      };
      const title = field("title"), url = field("url"), confidence = field("confidence");
      if (!title || !url || !/^https:\/\//.test(url) ||
          !["high", "medium", "needs-review"].includes(confidence)) {
        throw new Error("Mission source must have a title, HTTPS URL and confidence state");
      }
      return { title, url, confidence };
    });
    const record = Object.fromEntries(required.map((key) => [key, read(key)]));
    if (required.some((key) => !record[key])) throw new Error("Mission content is missing a required field");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) throw new Error("Invalid mission slug");
    return { ...record, sources };
  });
  const slugs = records.map((record) => record.slug);
  if (slugs.length !== 16 || new Set(slugs).size !== slugs.length) {
    throw new Error("Mission roster changed; review release/indexing policy before generating routes");
  }
  for (const slug of EXTERNAL_HANDOFF_SLUGS) {
    if (!slugs.includes(slug)) throw new Error("External canonical hand-off changed");
  }
  return records.filter((record) => !EXTERNAL_HANDOFF_SLUGS.has(record.slug));
}
