#!/usr/bin/env node

import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import { readdir } from "node:fs/promises";

const FAILURE_MEDIA = /(?:^|\/)(?:trace\.zip|[^/]+\.webm|test-failed[^/]*\.png|error-context\.md)$/i;

async function filesUnder(root) {
  const files = [];

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile()) files.push(relative(root, path).replaceAll("\\", "/"));
    }
  }

  await visit(root);
  return files.sort();
}

export async function verifyEvidence({ outcome, root }) {
  if (!new Set(["success", "failure"]).has(outcome)) {
    throw new Error(`Unsupported Human Craft outcome: ${outcome}`);
  }

  const absoluteRoot = resolve(root);
  const files = await filesUnder(absoluteRoot);
  if (files.length === 0) {
    throw new Error(`Human Craft evidence root is empty: ${absoluteRoot}`);
  }

  const failureMedia = files.filter((path) => FAILURE_MEDIA.test(path));
  if (outcome === "failure" && failureMedia.length === 0) {
    throw new Error(
      `Human Craft failed without retained screenshot, trace, video or error context in ${absoluteRoot}`,
    );
  }

  process.stdout.write(
    `${JSON.stringify({ root: absoluteRoot, outcome, files: files.length, failureMedia: failureMedia.length })}\n`,
  );
  return { files, failureMedia };
}

async function selfTest() {
  const fixtureRoot = await mkdtemp(join(tmpdir(), "gold-human-craft-evidence-"));
  try {
    await writeFile(join(fixtureRoot, "results.json"), "{}\n");
    await verifyEvidence({ outcome: "success", root: fixtureRoot });

    let rejectedEmptyFailure = false;
    try {
      await verifyEvidence({ outcome: "failure", root: fixtureRoot });
    } catch (error) {
      rejectedEmptyFailure = /failed without retained/.test(String(error));
    }
    if (!rejectedEmptyFailure) {
      throw new Error("Negative evidence fixture did not fail closed");
    }

    const failureRoot = join(fixtureRoot, "test-results", "known-failing-fixture");
    await mkdir(failureRoot, { recursive: true });
    await writeFile(join(failureRoot, "trace.zip"), "fixture\n");
    await verifyEvidence({ outcome: "failure", root: fixtureRoot });
    process.stdout.write("Human Craft evidence contract self-test PASS (3/3)\n");
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

const args = process.argv.slice(2);
if (args.includes("--self-test")) {
  await selfTest();
} else {
  const value = (flag) => {
    const index = args.indexOf(flag);
    return index === -1 ? undefined : args[index + 1];
  };
  const outcome = value("--outcome");
  const root = value("--root");
  if (!outcome || !root) {
    throw new Error("Usage: --outcome <success|failure> --root <evidence-directory>");
  }
  await verifyEvidence({ outcome, root });
}
