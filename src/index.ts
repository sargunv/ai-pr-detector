import { detectCommit } from "./detectors/index.js";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { fileURLToPath } from "node:url";

function getInput(name: string, fallback = ""): string {
  return core.getInput(name) || fallback;
}

export async function run(): Promise<void> {
  const token = getInput("github-token") || process.env["GITHUB_TOKEN"];
  if (token === undefined || token === "") {
    throw new Error("github-token is required");
  }

  const pullNumber = github.context.payload.pull_request?.number;
  if (pullNumber === undefined) {
    throw new Error(
      "This action must run on pull_request or pull_request_target events",
    );
  }

  const { owner, repo } = github.context.repo;
  const octokit = github.getOctokit(token);
  const commits = await octokit.paginate(octokit.rest.pulls.listCommits, {
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });
  const detected = commits.some((commit) =>
    detectCommit({
      committerEmail: commit.commit.committer?.email ?? "",
      message: commit.commit.message,
    }),
  );

  core.setOutput("ai-detected", String(detected));

  if (detected) {
    core.info("AI-generated PR metadata detected.");
  } else {
    core.info(
      `No AI-generated PR metadata detected across ${commits.length} commit(s).`,
    );
  }

  const label = getInput("label").trim();
  if (detected && label !== "") {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: pullNumber,
      labels: [label],
    });
    core.info(`Added label '${label}' to PR #${pullNumber}.`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((error: unknown) => {
    core.setFailed(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
