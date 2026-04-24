const entireIoTrailers = [
  "Entire-Metadata",
  "Entire-Metadata-Task",
  "Entire-Strategy",
  "Entire-Session",
  "Entire-Condensation",
  "Entire-Source-Ref",
  "Entire-Checkpoint",
  "Entire-Agent",
];

const commitMessagePatterns: Array<(message: string) => boolean> = [
  (message) => message.toLowerCase().startsWith("aider:"),
  (message) => message.includes("Generated with Claude Code"),
  (message) =>
    entireIoTrailers.some((trailer) => message.includes(`\n${trailer}:`)),
];

export function detectMessage(commitMessage: string): boolean {
  if (commitMessage === "") return false;

  return commitMessagePatterns.some((matches) => matches(commitMessage));
}
