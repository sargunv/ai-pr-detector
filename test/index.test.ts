import { run } from "../src/index.js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, expect, test, vi } from "vitest";

const githubMock = vi.hoisted(() => ({
  addLabels: vi.fn(),
  context: {
    payload: { pull_request: { number: 42 } },
    repo: { owner: "owner", repo: "repo" },
  },
  getOctokit: vi.fn(),
  listCommits: vi.fn(),
  paginate: vi.fn(),
}));

vi.mock("@actions/github", () => ({
  context: githubMock.context,
  getOctokit: githubMock.getOctokit,
}));

beforeEach(() => {
  githubMock.addLabels.mockReset();
  githubMock.getOctokit.mockReset();
  githubMock.listCommits.mockReset();
  githubMock.paginate.mockReset();
  githubMock.context.payload = { pull_request: { number: 42 } };
  githubMock.context.repo = { owner: "owner", repo: "repo" };
  githubMock.getOctokit.mockReturnValue({
    paginate: githubMock.paginate,
    rest: {
      issues: { addLabels: githubMock.addLabels },
      pulls: { listCommits: githubMock.listCommits },
    },
  });
});

test("sets output and labels detected PRs", async () => {
  const { outputPath, previousEnv } = configureActionEnv("ai-generated");
  githubMock.paginate.mockResolvedValue([
    {
      sha: "abc123",
      commit: {
        committer: {
          email: "208546643+renamed[bot]@users.noreply.github.com",
        },
        message: "Fix bug",
      },
    },
  ]);

  try {
    await run();
  } finally {
    process.env = previousEnv;
  }

  expect(fs.readFileSync(outputPath, "utf8")).toContain("true");
  expect(githubMock.paginate).toHaveBeenCalledWith(githubMock.listCommits, {
    owner: "owner",
    repo: "repo",
    pull_number: 42,
    per_page: 100,
  });
  expect(githubMock.addLabels).toHaveBeenCalledWith({
    owner: "owner",
    repo: "repo",
    issue_number: 42,
    labels: ["ai-generated"],
  });
});

test("sets false output and skips labeling when no AI metadata is detected", async () => {
  const { outputPath, previousEnv } = configureActionEnv("ai-generated");
  githubMock.paginate.mockResolvedValue([
    {
      sha: "abc123",
      commit: {
        committer: { email: "developer@example.com" },
        message: "Fix bug",
      },
    },
  ]);

  try {
    await run();
  } finally {
    process.env = previousEnv;
  }

  expect(fs.readFileSync(outputPath, "utf8")).toContain("false");
  expect(githubMock.addLabels).not.toHaveBeenCalled();
});

test("skips labeling when label input is empty", async () => {
  const { previousEnv } = configureActionEnv("");
  githubMock.paginate.mockResolvedValue([
    {
      sha: "abc123",
      commit: {
        committer: {
          email: "208546643+renamed[bot]@users.noreply.github.com",
        },
        message: "Fix bug",
      },
    },
  ]);

  try {
    await run();
  } finally {
    process.env = previousEnv;
  }

  expect(githubMock.addLabels).not.toHaveBeenCalled();
});

test("fails when requested label cannot be added", async () => {
  const { previousEnv } = configureActionEnv("missing-label");
  githubMock.paginate.mockResolvedValue([
    {
      sha: "abc123",
      commit: {
        committer: {
          email: "208546643+claude-code-action[bot]@users.noreply.github.com",
        },
        message: "Fix bug",
      },
    },
  ]);
  githubMock.addLabels.mockRejectedValue({ status: 422 });

  try {
    await expect(run()).rejects.toEqual({ status: 422 });
  } finally {
    process.env = previousEnv;
  }
});

function configureActionEnv(label: string): {
  outputPath: string;
  previousEnv: NodeJS.ProcessEnv;
} {
  const tempDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "ai-pr-detector-"),
  );
  const outputPath = path.join(tempDirectory, "output.txt");
  fs.writeFileSync(outputPath, "");

  const previousEnv = { ...process.env };
  process.env["GITHUB_OUTPUT"] = outputPath;
  process.env["GITHUB_TOKEN"] = "token";
  process.env["INPUT_LABEL"] = label;

  return { outputPath, previousEnv };
}
