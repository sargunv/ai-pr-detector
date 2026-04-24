const knownCoAuthorEmails = new Set([
  "noreply@anthropic.com",
  "cursoragent@cursor.com",
  "noreply@aider.chat",
]);

const coAuthorPattern = /^co-authored-by:\s*[^<]*<([^>]+)>/gim;

export function detectCoauthors(commitMessage: string): boolean {
  if (commitMessage === "") return false;

  for (const match of commitMessage.matchAll(coAuthorPattern)) {
    const email = match[1]?.trim().toLowerCase();
    if (email === undefined) continue;

    if (knownCoAuthorEmails.has(email)) {
      return true;
    }
  }

  return false;
}
