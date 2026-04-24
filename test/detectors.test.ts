import { detectCoauthors } from "../src/detectors/coauthor.js";
import { detectCommitter } from "../src/detectors/committer.js";
import { detectCommit } from "../src/detectors/index.js";
import { detectMessage } from "../src/detectors/message.js";
import { expect, test } from "vitest";

test("detects known AI committer emails", () => {
  expect(
    detectCommitter(
      " 208546643+claude-code-action[bot]@users.noreply.github.com ",
    ),
  ).toBe(true);
});

test("detects renamed bots by numeric noreply prefix", () => {
  expect(
    detectCommitter("208546643+renamed-bot[bot]@users.noreply.github.com"),
  ).toBe(true);
});

test("does not use numeric prefix outside GitHub noreply emails", () => {
  expect(detectCommitter("208546643+renamed-bot@example.com")).toBe(false);
});

test("detects high-confidence co-author trailers and deduplicates tools", () => {
  const message = [
    "Implement feature",
    "",
    "Co-authored-by: Claude <noreply@anthropic.com>",
    "Co-Authored-By: Another Claude <noreply@anthropic.com>",
    "Co-authored-by: Cursor <cursoragent@cursor.com>",
  ].join("\n");

  expect(detectCoauthors(message)).toBe(true);
});

test("detects medium-confidence commit message patterns", () => {
  expect(detectMessage("Aider: add tests")).toBe(true);
  expect(detectMessage("Update docs\n\nGenerated with Claude Code")).toBe(true);
  expect(detectMessage("Update docs\nEntire-Agent: agent-id")).toBe(true);
  expect(detectMessage("Update docs\r\nEntire-Agent: agent-id")).toBe(true);
});

test("does not detect partial message pattern matches", () => {
  expect(detectMessage("prefix aider: add tests")).toBe(false);
  expect(detectMessage("Update docs\nNot-Entire-Agent: agent-id")).toBe(false);
});

test("applies registered detectors to commit metadata", () => {
  expect(
    detectCommit({
      committerEmail: "noreply@users.noreply.github.com",
      message: "Fix bug\n\nCo-authored-by: Aider <noreply@aider.chat>",
    }),
  ).toBe(true);
});
