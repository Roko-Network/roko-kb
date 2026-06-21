import fs from "node:fs";
import path from "node:path";

const tenant = process.argv[2] ?? "roko-kb";
const root = process.cwd();
const outDir = path.join(root, "dist", tenant);
const searchDir = path.join(outDir, "search-index");
const manifestPath = path.join(searchDir, "manifest.json");
const fortemiPath = path.join(outDir, "vendor", "fortemi-aiwg-index.js");
const docsMapPath = path.join(outDir, "docs-map-data.js");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(manifestPath)) {
  fail(`missing search manifest: ${manifestPath}`);
}

if (!fs.existsSync(fortemiPath)) {
  fail(`missing Fortemi helper bundle: ${fortemiPath}`);
}

if (!fs.existsSync(docsMapPath)) {
  fail(`missing Docs Map data bundle: ${docsMapPath}`);
}

const fortemi = await import(pathToFileUrl(fortemiPath));
const manifest = readJson(manifestPath);
const manifestValidation = fortemi.validateAiwgFortemiChunkManifest(manifest);
if (!manifestValidation.valid) {
  fail(`invalid Fortemi chunk manifest:\n${manifestValidation.errors.join("\n")}`);
}

const chunks = manifest.parts.map((part) => {
  const chunkPath = path.join(searchDir, part.href);
  if (!fs.existsSync(chunkPath)) {
    fail(`missing search chunk: ${chunkPath}`);
  }
  const chunk = readJson(chunkPath);
  const chunkValidation = fortemi.validateAiwgFortemiChunkPart(chunk, part, manifest);
  if (!chunkValidation.valid) {
    fail(`invalid Fortemi chunk ${part.href}:\n${chunkValidation.errors.join("\n")}`);
  }
  return chunk;
});

const items = chunks.flatMap((chunk) => chunk.items);
if (items.length !== manifest.total) {
  fail(`search item count mismatch: manifest=${manifest.total}, chunks=${items.length}`);
}

const exportIndex = {
  schema_version: "aiwg.fortemi.index.export.v1",
  generated_at: manifest.generated_at,
  source: manifest.source,
  items,
};

const exportValidation = fortemi.validateAiwgFortemiIndexExport(exportIndex);
if (!exportValidation.valid) {
  fail(`chunked records do not form a valid Fortemi export:\n${exportValidation.errors.join("\n")}`);
}

const expectedQueries = [
  ["nanosecond precision", "Nanosecond Precision: Resolution vs. Accuracy"],
  ["censorship resistance", "Transaction Ordering & Censorship Resistance"],
  ["use cases", "Use Cases"],
  ["Publishing and Search", "Publishing and Search"],
];

for (const [query, expectedTitle] of expectedQueries) {
  const result = fortemi.queryAiwgFortemiIndex(exportIndex, query, {
    limit: 5,
    rank: true,
  });
  const titles = result.items.map((item) => item.title);
  if (!titles.includes(expectedTitle)) {
    fail(`query "${query}" did not return "${expectedTitle}"; got ${titles.join(", ")}`);
  }
}

const docsMapText = fs.readFileSync(docsMapPath, "utf8");
for (const required of ["nodes", "edges", "communities"]) {
  if (!docsMapText.includes(required)) {
    fail(`Docs Map data does not include ${required}`);
  }
}

const docsMap = await import(pathToFileUrl(docsMapPath));
const graph = docsMap.DOCS_MAP_GRAPH;
if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges) || !Array.isArray(graph.communities)) {
  fail("Docs Map graph export is missing nodes, edges, or communities arrays");
}
if (graph.nodes.length !== manifest.total) {
  fail(`Docs Map node count mismatch: manifest=${manifest.total}, nodes=${graph.nodes.length}`);
}
if (graph.communities.length < 1) {
  fail("Docs Map graph has no communities");
}

console.log(
  JSON.stringify(
    {
      tenant,
      searchSchema: manifest.schema_version,
      total: manifest.total,
      parts: manifest.parts.length,
      docsMap: {
        path: path.relative(root, docsMapPath),
        nodes: graph.nodes.length,
        edges: graph.edges.length,
        communities: graph.communities.length,
      },
      queries: expectedQueries.length,
    },
    null,
    2,
  ),
);

function pathToFileUrl(filePath) {
  const resolved = path.resolve(filePath).replace(/\\/g, "/");
  return `file://${resolved.startsWith("/") ? "" : "/"}${resolved}`;
}
