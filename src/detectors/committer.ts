const knownAgentCommitters = new Set([
  "209825114+claude[bot]@users.noreply.github.com",
  "215619710+anthropic-claude[bot]@users.noreply.github.com",
  "208546643+claude-code-action[bot]@users.noreply.github.com",
  "198982749+copilot@users.noreply.github.com",
  "167198135+copilot[bot]@users.noreply.github.com",
  "206951365+cursor[bot]@users.noreply.github.com",
  "215057067+openai-codex[bot]@users.noreply.github.com",
  "199175422+chatgpt-codex-connector[bot]@users.noreply.github.com",
  "176961590+gemini-code-assist[bot]@users.noreply.github.com",
  "208079219+amazon-q-developer[bot]@users.noreply.github.com",
  "158243242+devin-ai-integration[bot]@users.noreply.github.com",
  "205137888+cline[bot]@users.noreply.github.com",
  "230936708+continue[bot]@users.noreply.github.com",
  "201248094+sourcegraph-cody[bot]@users.noreply.github.com",
  "220155983+jetbrains-ai[bot]@users.noreply.github.com",
  "136622811+coderabbitai[bot]@users.noreply.github.com",
]);

const numericPrefixes = new Set(
  Array.from(knownAgentCommitters, (email) =>
    email.slice(0, email.indexOf("+")),
  ),
);

export function detectCommitter(commitEmail: string): boolean {
  const email = commitEmail.trim().toLowerCase();
  if (email === "") return false;

  if (knownAgentCommitters.has(email)) {
    return true;
  }

  if (email.endsWith("@users.noreply.github.com")) {
    const plusIndex = email.indexOf("+");
    if (plusIndex > 0) {
      return numericPrefixes.has(email.slice(0, plusIndex));
    }
  }

  return false;
}
