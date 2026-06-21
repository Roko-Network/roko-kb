import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tenant = "roko-kb";
const distRoot = path.join(root, "dist", tenant);
const maxLogoBytes = 500 * 1024;

const sourceFiles = [
  "README.md",
  "CLAUDE.md",
  "AIWG.md",
  "AGENTS.md",
  "PAGE_HIERARCHY_GUIDE.md",
  "_manifest.json",
  "config.json",
  "tenants.json",
  "resources/publishing-and-search.md",
  ".aiwg/AIWG.md",
  ".aiwg/release.config",
  ".aiwg/architecture/adr/ADR-001-pagenary-fortemi-search.md",
  ".aiwg/architecture/adr/ADR-002-fortemi-semantic-archive-roadmap.md",
  ".aiwg/deployment/pagenary-publishing-runbook.md",
  ".aiwg/deployment/production-target-decision.md",
  ".gitea/workflows/docs-build.yml",
];

const stalePatterns = [
  /published with GitBook/i,
  /organized for GitBook/i,
  /GitBook homepage/i,
  /GitBook navigation/i,
  /No build system/i,
  /consumed directly by GitBook/i,
  /699KB/i,
];

function fail(message) {
  throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assertNoStaleTerms() {
  const failures = [];
  for (const file of sourceFiles) {
    const filePath = path.join(root, file);
    if (!fs.existsSync(filePath)) continue;
    const text = fs.readFileSync(filePath, "utf8");
    for (const pattern of stalePatterns) {
      if (pattern.test(text)) {
        failures.push(`${file}: ${pattern}`);
      }
    }
  }
  if (failures.length > 0) {
    fail(`stale migration references found:\n${failures.join("\n")}`);
  }
}

function assertRootManifest() {
  const manifest = readJson(path.join(root, "_manifest.json"));
  const order = manifest.order ?? [];
  const exclude = new Set(manifest.exclude ?? []);
  const requiredOrder = [
    "README",
    "getting-started",
    "core-technology",
    "products",
    "articles",
    "resources",
  ];
  for (const id of requiredOrder) {
    if (!order.includes(id)) {
      fail(`root manifest order is missing ${id}`);
    }
  }
  for (const id of order) {
    if (id === "README") continue;
    const dirPath = path.join(root, id);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      fail(`root manifest order references missing directory: ${id}`);
    }
  }
  for (const id of [
    "technical",
    "_facts",
    "archive",
    "meetings",
    "signals",
    "scripts",
    "dist",
    "node_modules",
    "package",
    "package-lock",
    "tenants",
    "config",
  ]) {
    if (id === "technical") {
      if (order.includes(id)) fail("root manifest still includes removed technical section");
    } else if (!exclude.has(id)) {
      fail(`root manifest exclude is missing ${id}`);
    }
  }
}

function assertAssets() {
  for (const file of [
    ".public/favicon.png",
    ".public/favicon-roko.png",
    ".public/logos/favicon-roko.png",
  ]) {
    const filePath = path.join(root, file);
    const size = fs.statSync(filePath).size;
    if (size > maxLogoBytes) {
      fail(`${file} is ${size} bytes, expected <= ${maxLogoBytes}`);
    }
  }
  if (fs.existsSync(path.join(root, ".public/gitbook.svg"))) {
    fail(".public/gitbook.svg should not be present after Pagenary migration");
  }
}

function assertPublishedSearchScope() {
  const manifestPath = path.join(distRoot, "search-index", "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    fail("dist search manifest is missing; run npm run build:docs first");
  }
  const manifest = readJson(manifestPath);
  const items = manifest.parts.flatMap((part) => {
    const chunk = readJson(path.join(distRoot, "search-index", part.href));
    return chunk.items;
  });
  const forbiddenSections = ["scripts", "node_modules", "dist", ".aiwg", ".gitea", ".claude"];
  const bad = items.filter((item) => {
    const sections = item.facets?.section ?? [];
    const sourcePath = item.source?.repo_relative_path ?? item.source?.path ?? "";
    return forbiddenSections.some((prefix) =>
      sourcePath.startsWith(prefix) || sections.some((section) => section.startsWith(prefix)),
    );
  });
  if (bad.length > 0) {
    fail(`published search includes non-content records:\n${bad.map((item) => `${item.title} (${item.source?.path})`).join("\n")}`);
  }
}

function assertReleaseConfig() {
  const filePath = path.join(root, ".aiwg", "release.config");
  if (!fs.existsSync(filePath)) {
    fail(".aiwg/release.config is missing");
  }
  const text = fs.readFileSync(filePath, "utf8");
  const requiredSnippets = [
    "name: roko-kb",
    "run: npm run build:docs",
    "run: npm run validate:release",
    "run: npm run index:aiwg",
    "tracker: gitea",
    "required_workflows:",
    "- docs-build.yml",
    "name: production-target-decision",
    "path: .aiwg/deployment/production-target-decision.md",
  ];
  const missing = requiredSnippets.filter((snippet) => !text.includes(snippet));
  if (missing.length > 0) {
    fail(`release config is missing required gate snippets:\n${missing.join("\n")}`);
  }
}

function assertProductionDecisionRecord() {
  const filePath = path.join(root, ".aiwg", "deployment", "production-target-decision.md");
  if (!fs.existsSync(filePath)) {
    fail(".aiwg/deployment/production-target-decision.md is missing");
  }
  const text = fs.readFileSync(filePath, "utf8");
  const requiredSnippets = [
    "Decided",
    "Target host",
    "Public base path",
    "Deployment trigger",
    "Deployment credential",
    "Rollback method",
    "Post-deploy smoke URL",
    "DEPLOY_SSH_KEY",
    "Gitea issue #4",
  ];
  const missing = requiredSnippets.filter((snippet) => !text.includes(snippet));
  if (missing.length > 0) {
    fail(`production target decision record is missing required snippets:\n${missing.join("\n")}`);
  }
}

assertNoStaleTerms();
assertRootManifest();
assertAssets();
assertPublishedSearchScope();
assertReleaseConfig();
assertProductionDecisionRecord();

console.log(
  JSON.stringify(
    {
      staleReferences: 0,
      rootManifest: "ok",
      assets: "ok",
      publishedSearchScope: "ok",
      releaseConfig: "ok",
      productionDecision: "decided",
    },
    null,
    2,
  ),
);
