import assert from "node:assert/strict";
import test from "node:test";
import {
  isComposioReadOnlyToolSlug,
  normaliseComposioToolkits,
  publicCapabilityManifest,
} from "./capabilityExpansion";

test("Composio capability exposes only the approved initial app set", () => {
  assert.deepEqual(normaliseComposioToolkits(undefined), ["github", "gmail", "googledrive"]);
  assert.deepEqual(normaliseComposioToolkits(["GMAIL", "github", "gmail"]), ["gmail", "github"]);
  assert.throws(() => normaliseComposioToolkits(["stripe"]), /COMPOSIO_TOOLKIT_NOT_APPROVED/);
});

test("Composio execution is fail-closed to read-only tool verbs", () => {
  assert.equal(isComposioReadOnlyToolSlug("GITHUB_GET_A_REPOSITORY"), true);
  assert.equal(isComposioReadOnlyToolSlug("GMAIL_SEARCH_EMAILS"), true);
  assert.equal(isComposioReadOnlyToolSlug("GOOGLEDRIVE_FIND_FILE"), true);
  assert.equal(isComposioReadOnlyToolSlug("GOOGLEDRIVE_LIST_FILES"), true);
  assert.equal(isComposioReadOnlyToolSlug("GMAIL_SEND_EMAIL"), false);
  assert.equal(isComposioReadOnlyToolSlug("GITHUB_CREATE_AN_ISSUE"), false);
  assert.equal(isComposioReadOnlyToolSlug("GOOGLEDRIVE_UPDATE_FILE"), false);
  assert.equal(isComposioReadOnlyToolSlug("COMPOSIO_REMOTE_BASH_TOOL"), false);
});

test("capability manifest preserves existing governance boundaries", () => {
  const manifest = publicCapabilityManifest();
  assert.equal(manifest.architecture.makerJudgeSeparation, "PRESERVED");
  assert.equal(manifest.architecture.founderRelease, "PRESERVED");
  assert.match(manifest.safety.openaiResponses, /FOUNDER_RELEASE_REQUIRED/);
  assert.equal(manifest.integrations.openaiResponses, "BOUND_AI_GATEWAY_FOUNDER_RELEASE");
  assert.equal(manifest.safety.composio, "READ_ONLY_SESSION_AND_LOCAL_TOOL_POLICY");
});
