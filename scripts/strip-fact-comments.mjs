#!/usr/bin/env node
// Strip evidence-grade fact-citation markers from the BUILT Pagenary output.
//
// Source markdown keeps inline `<!-- fact:CC-05 -->` citations (truth-discipline
// in CLAUDE.md: every factual claim cites fact ids, mechanically auditable).
// Pagenary renders via `marked`, which ESCAPES inline HTML comments to
// `&lt;!-- fact:... --&gt;` instead of stripping them, so they leak as visible
// text on the published site. This post-build pass removes them from the
// rendered artifacts only — the markdown sources are untouched.
//
// Usage: node scripts/strip-fact-comments.mjs <tenant-id>   (default: roko-kb)

import fs from "node:fs";
import path from "node:path";

const tenant = process.argv[2] || "roko-kb";
const distRoot = path.join(process.cwd(), "dist", tenant);

if (!fs.existsSync(distRoot)) {
  console.error(`strip-fact-comments: dist directory not found: ${distRoot}`);
  process.exit(1);
}

// Match the fact marker in both encodings, with any surrounding whitespace, so
// removing a mid-sentence marker collapses to a single separating space.
//   escaped (JS/HTML):  &lt;!-- fact:... --&gt;
//   raw     (JSON):     <!-- fact:... -->
const patterns = [
  /\s*&lt;!--\s*fact:[^&]*?--&gt;\s*/g,
  /\s*<!--\s*fact:[^>]*?-->\s*/g,
];

const exts = new Set([".js", ".html", ".json"]);
let filesChanged = 0;
let markersRemoved = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (exts.has(path.extname(entry.name))) {
      processFile(full);
    }
  }
}

function processFile(file) {
  const original = fs.readFileSync(file, "utf8");
  let out = original;
  let count = 0;
  for (const re of patterns) {
    out = out.replace(re, (m) => {
      count += 1;
      // Preserve a separating space unless the marker hugged a tag boundary.
      return m.startsWith(" ") || m.endsWith(" ") ? " " : "";
    });
  }
  if (count > 0 && out !== original) {
    fs.writeFileSync(file, out);
    filesChanged += 1;
    markersRemoved += count;
  }
}

walk(distRoot);
console.log(
  `strip-fact-comments: removed ${markersRemoved} fact marker(s) from ${filesChanged} file(s) in dist/${tenant}`,
);
