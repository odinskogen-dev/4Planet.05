import type { Section, WorkPackage } from "./contracts";

export type AdapterMode = "READ_ONLY" | "BOUNDED_WRITE" | "NO_EXECUTION";

export interface SectionAdapterPolicy {
  section: Section;
  mode: AdapterMode;
  allowedReadPrefixes: string[];
  allowedWritePrefixes: string[];
  forbiddenCapabilities: string[];
}

const POLICY: Record<Section, SectionAdapterPolicy> = {
  PRODUCT_DESIGN: {
    section: "PRODUCT_DESIGN",
    mode: "BOUNDED_WRITE",
    allowedReadPrefixes: ["public/", "src/", "tests/", "docs/"],
    allowedWritePrefixes: ["public/", "src/"],
    forbiddenCapabilities: ["LIVE_DEPLOY", "BRAIN_WRITE", "EXTERNAL_SEND", "PAYMENT"],
  },
  CODE_QA: {
    section: "CODE_QA",
    mode: "BOUNDED_WRITE",
    allowedReadPrefixes: ["public/", "src/", "tests/", ".github/", "scripts/", "docs/"],
    allowedWritePrefixes: ["tests/", ".github/", "scripts/"],
    forbiddenCapabilities: ["LIVE_DEPLOY", "BRAIN_WRITE", "EXTERNAL_SEND", "PAYMENT"],
  },
  RESEARCH_DATA: {
    section: "RESEARCH_DATA",
    mode: "BOUNDED_WRITE",
    allowedReadPrefixes: ["public/", "src/", "docs/", "data/"],
    allowedWritePrefixes: ["public/data/", "src/data/", "docs/research/", "data/"],
    forbiddenCapabilities: ["LIVE_DEPLOY", "BRAIN_WRITE", "EXTERNAL_SEND", "UNSOURCED_CLAIM", "PAYMENT"],
  },
  USER_DISTRIBUTION: {
    section: "USER_DISTRIBUTION",
    mode: "BOUNDED_WRITE",
    allowedReadPrefixes: ["public/analytics/", "tests/", "docs/"],
    allowedWritePrefixes: ["public/analytics/", "tests/e2e/"],
    forbiddenCapabilities: ["LIVE_DEPLOY", "BRAIN_WRITE", "EXTERNAL_SEND", "PAYMENT"],
  },
  CAPITAL: {
    section: "CAPITAL",
    mode: "READ_ONLY",
    allowedReadPrefixes: ["docs/", "data/", "public/"],
    allowedWritePrefixes: [],
    forbiddenCapabilities: ["EXTERNAL_SEND", "PAYMENT", "SIGNATURE", "BRAIN_WRITE", "LIVE_DEPLOY"],
  },
  LEARNING: {
    section: "LEARNING",
    mode: "BOUNDED_WRITE",
    allowedReadPrefixes: ["docs/", "tests/", "public/", "src/", "factory/"],
    allowedWritePrefixes: ["docs/learning/", "factory/"],
    forbiddenCapabilities: ["CANON_PROMOTION", "BRAIN_WRITE", "LIVE_DEPLOY", "EXTERNAL_SEND", "PAYMENT"],
  },
  BRAIN_CONTROL: {
    section: "BRAIN_CONTROL",
    mode: "READ_ONLY",
    allowedReadPrefixes: ["docs/", "factory/"],
    allowedWritePrefixes: [],
    forbiddenCapabilities: ["BRAIN_WRITE", "CANON_PROMOTION", "LIVE_DEPLOY", "EXTERNAL_SEND", "PAYMENT"],
  },
};

const normalise = (scope: string) => scope.trim().replace(/^\.\//, "").replace(/^\//, "");
const matchesPrefix = (scope: string, prefix: string) => {
  const clean = normalise(scope);
  const allowed = normalise(prefix);
  return clean === allowed.replace(/\/$/, "") || clean.startsWith(allowed);
};

export interface AdapterScopeCheck {
  ok: boolean;
  mode: AdapterMode;
  rejectedScopes: string[];
  policy: SectionAdapterPolicy;
}

export function getSectionAdapterPolicy(section: Section): SectionAdapterPolicy {
  return POLICY[section];
}

export function checkPackageAdapterScope(pkg: WorkPackage): AdapterScopeCheck {
  const policy = getSectionAdapterPolicy(pkg.section);
  if (policy.mode === "READ_ONLY") {
    return {
      ok: pkg.writeScopes.length === 0,
      mode: policy.mode,
      rejectedScopes: pkg.writeScopes,
      policy,
    };
  }
  if (policy.mode === "NO_EXECUTION") {
    return { ok: false, mode: policy.mode, rejectedScopes: pkg.writeScopes, policy };
  }
  const rejectedScopes = pkg.writeScopes.filter(
    (scope) => !policy.allowedWritePrefixes.some((prefix) => matchesPrefix(scope, prefix)),
  );
  return { ok: rejectedScopes.length === 0, mode: policy.mode, rejectedScopes, policy };
}
