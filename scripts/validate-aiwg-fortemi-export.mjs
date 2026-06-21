import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exportPath = process.argv[2] ?? "/tmp/roko-project-aiwg-fortemi-index.json";
const tenant = process.argv[3] ?? "roko-kb";
const fortemiPath = path.join(root, "dist", tenant, "vendor", "fortemi-aiwg-index.js");

function fail(message) {
  throw new Error(message);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

if (!fs.existsSync(exportPath)) {
  fail(`missing AIWG Fortemi export: ${exportPath}`);
}

if (!fs.existsSync(fortemiPath)) {
  fail(`missing Fortemi helper bundle: ${fortemiPath}; run npm run build:docs first`);
}

const fortemi = await import(pathToFileUrl(fortemiPath));
const index = readJson(exportPath);
const validation = fortemi.validateAiwgFortemiIndexExport(index);
if (!validation.valid) {
  fail(`invalid AIWG Fortemi export:\n${validation.errors.join("\n")}`);
}

const items = index.items;
const artifactRecords = items.filter((item) => item.type === "aiwg.artifact");
if (artifactRecords.length === 0) {
  fail("AIWG Fortemi export has no aiwg.artifact records");
}

const requiredTitles = [
  "ADR-001: Pagenary and Fortemi Search Architecture",
  "ADR-002: Fortemi Semantic Archive Roadmap",
  "Pagenary Publishing Runbook",
  "Production Target Decision",
];

for (const title of requiredTitles) {
  if (!artifactRecords.some((item) => item.title === title)) {
    fail(`AIWG Fortemi export is missing artifact title: ${title}`);
  }
}

const queryChecks = [
  ["Pagenary", "ADR-001: Pagenary and Fortemi Search Architecture"],
  ["semantic archive roadmap", "ADR-002: Fortemi Semantic Archive Roadmap"],
  ["publishing runbook", "Pagenary Publishing Runbook"],
  ["production target decision", "Production Target Decision"],
];

for (const [query, expectedTitle] of queryChecks) {
  const result = fortemi.queryAiwgFortemiIndex(index, query, {
    limit: 5,
    rank: true,
  });
  const titles = result.items.map((item) => item.title);
  if (!titles.includes(expectedTitle)) {
    fail(`query "${query}" did not return "${expectedTitle}"; got ${titles.join(", ")}`);
  }
}

console.log(
  JSON.stringify(
    {
      export: path.relative(root, exportPath),
      schema: index.schema_version,
      total: items.length,
      counts: validation.counts,
      queries: queryChecks.length,
    },
    null,
    2,
  ),
);

function pathToFileUrl(filePath) {
  const resolved = path.resolve(filePath).replace(/\\/g, "/");
  return `file://${resolved.startsWith("/") ? "" : "/"}${resolved}`;
}
