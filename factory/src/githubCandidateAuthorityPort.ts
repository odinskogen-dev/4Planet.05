import type { CandidateAuthorityRuntimePort } from "./candidateAuthorityRuntime";

const OWNER = "odinskogen-dev";
const REPO = "4Planet.05";
const sha40 = /^[0-9a-f]{40}$/i;

type GitHubRef = { object?: { sha?: string } };
type GitHubContent = { type?: string; content?: string; encoding?: string };
type GitHubCompare = { merge_base_commit?: { sha?: string }; status?: string };
type GitHubPull = {
  number: number;
  body?: string | null;
  base?: { ref?: string };
  head?: { ref?: string };
};

function repoPath(path: string): string {
  return `https://api.github.com/repos/${OWNER}/${REPO}${path}`;
}

async function request<T>(token: string, path: string, allow404 = false): Promise<T | null> {
  const response = await fetch(repoPath(path), {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      "user-agent": "4PLANET-Production-Factory/1.0",
    },
  });
  if (allow404 && response.status === 404) return null;
  const text = await response.text();
  if (!response.ok) throw new Error(`GitHub ${response.status} ${path}: ${text.slice(0, 600)}`);
  return (text ? JSON.parse(text) : {}) as T;
}

function encodeRef(value: string): string {
  return value.split("/").map(encodeURIComponent).join("/");
}

function encodePath(value: string): string {
  return value.split("/").map(encodeURIComponent).join("/");
}

function decodeBase64Utf8(value: string): string {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new TextDecoder().decode(bytes);
}

function workPackageMarker(workPackageId: string): string[] {
  return [
    `Work package: \`${workPackageId}\``,
    `Work Package: \`${workPackageId}\``,
    `workPackageId: ${workPackageId}`,
    `id: ${workPackageId}`,
  ];
}

export function createGitHubCandidateAuthorityPort(token: string): CandidateAuthorityRuntimePort {
  const cleanToken = token.trim();
  if (!cleanToken) throw new Error("Candidate-authority GitHub port requires a token.");

  return {
    async readBranchHead(branch) {
      const ref = await request<GitHubRef>(cleanToken, `/git/ref/heads/${encodeRef(branch)}`);
      const sha = ref?.object?.sha ?? "";
      if (!sha40.test(sha)) throw new Error(`Branch ${branch} did not resolve to an exact SHA.`);
      return sha;
    },

    async readTextFileAtCommit(path, commitSha) {
      const file = await request<GitHubContent>(
        cleanToken,
        `/contents/${encodePath(path)}?ref=${encodeURIComponent(commitSha)}`,
        true,
      );
      if (!file) return null;
      if (file.type !== "file" || file.encoding !== "base64" || typeof file.content !== "string") {
        throw new Error(`Candidate-authority file ${path} is not a readable UTF-8 file.`);
      }
      return decodeBase64Utf8(file.content);
    },

    async isAncestor(baseSha, headSha) {
      if (baseSha === headSha) return true;
      if (!sha40.test(baseSha) || !sha40.test(headSha)) return false;
      const compare = await request<GitHubCompare>(cleanToken, `/compare/${baseSha}...${headSha}`);
      return compare?.merge_base_commit?.sha === baseSha && ["ahead", "identical"].includes(compare.status ?? "");
    },

    async findEquivalentOpenPullRequests({ workPackageId, receiverBranch }) {
      const pulls = await request<GitHubPull[]>(cleanToken, "/pulls?state=open&per_page=100");
      const markers = workPackageMarker(workPackageId);
      return (pulls ?? [])
        .filter((pull) => pull.base?.ref === receiverBranch)
        .filter((pull) => {
          const head = pull.head?.ref ?? "";
          const body = pull.body ?? "";
          return head.includes(workPackageId) || markers.some((marker) => body.includes(marker));
        })
        .map((pull) => ({ number: pull.number, headBranch: pull.head?.ref ?? "" }));
    },
  };
}
