import fs from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

// This exact asset has no verified rights record in this package. A registry
// mention or the word "licence" is not evidence. Keep it blocked until a future
// independently reviewed change binds the exact file to actual rights evidence.
// Removing the photograph is a valid correction; this gate must not require it.
const unclearedHero = '/assets/species/_index-hero.jpg';

function assertNoUnclearedHero(source) {
  const parsed = ts.createSourceFile('Species.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  assert.equal(parsed.parseDiagnostics.length, 0, 'Rights inspection requires parseable TSX');
  const references = [];
  function visit(node) {
    if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) &&
        node.text.split(/[?#]/, 1)[0] === unclearedHero) {
      references.push(node.getStart(parsed));
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  assert.equal(references.length, 0,
    `Unverified wildlife image ${unclearedHero} remains referenced. Remove it or supply independently reviewed exact-file rights evidence; comments and registry presence cannot clear it.`);
}

test('SPECIES does not directly reference the known uncleared index photograph', () => {
  assertNoUnclearedHero(fs.readFileSync('src/pages/integrated/Species.tsx', 'utf8'));
});

// Evaluator regressions are synthetic fixtures, not product or licence proof.
for (const [name, source] of [
  ['double-quoted JSX', `<img src="${unclearedHero}" />`],
  ['single-quoted JSX', `<img src='${unclearedHero}' />`],
  ['expression attribute', `<img src={'${unclearedHero}'} />`],
  ['template literal attribute', '<img src={`' + unclearedHero + '`} />'],
  ['reordered attributes', `<img alt="Orca" src="${unclearedHero}" />`],
  ['rights comment is not evidence', `/* rights verified */ <img src="${unclearedHero}" />`],
  ['licence label is not evidence', `<section><img src="${unclearedHero}" /><p>licence</p></section>`],
  ['registry mention is not evidence', `const media = {localPath: '${unclearedHero}'};`],
  ['cache query cannot clear rights', `<img src="${unclearedHero}?v=2" />`],
]) {
  test(`rights evaluator rejects ${name}`, () => {
    assert.throws(() => assertNoUnclearedHero(source), /Unverified wildlife image/);
  });
}

test('removing the uncleared photograph is a valid fail-closed correction', () => {
  assert.doesNotThrow(() => assertNoUnclearedHero('<section><p>NO CLEARED IMAGE</p><h1>Meet life on Earth.</h1></section>'));
});

test('an audit comment about the removed asset is not a rendered asset reference', () => {
  assert.doesNotThrow(() => assertNoUnclearedHero(`/* Removed ${unclearedHero} */ <section>NO CLEARED IMAGE</section>`));
});

test('malformed source cannot pass the evaluator', () => {
  assert.throws(() => assertNoUnclearedHero('<section'), /parseable TSX/);
});
