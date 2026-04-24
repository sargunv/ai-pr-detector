import { detectCoauthors } from "./coauthor.js";
import { detectCommitter } from "./committer.js";
import { detectMessage } from "./message.js";

export function detectCommit(input: {
  committerEmail: string;
  message: string;
}): boolean {
  return (
    detectCommitter(input.committerEmail) ||
    detectCoauthors(input.message) ||
    detectMessage(input.message)
  );
}
