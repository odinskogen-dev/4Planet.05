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
    const record = Object.fromEntries(required.map((key) => [key, read(key)]));
    if (required.some((key) => !record[key])) throw new Error("Mission content is missing a required field");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.slug)) throw new Error("Invalid mission slug");
    return record;
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
