# Publishing and Search

The ROKO knowledge base is published with Pagenary. The current tenant is
`roko-kb`, registered in `tenants.json`, and builds to `dist/roko-kb`.

## Current Build Path

```bash
npm install
npm run build:docs
npm run validate:release
npm run serve
```

The local preview is served at `/roko-kb/` by `npm run serve`.

`npm run validate:docs` checks the generated Fortemi chunk manifest and part
schemas with the vendored Fortemi validators, confirms Docs Map data exists,
and verifies representative search queries.

`npm run validate:migration` checks migration invariants that should remain true
after moving from the old publishing path: no stale dbbuilder/GitBook guidance
in source docs, no dead root navigation entries, logo assets below Pagenary's
warning threshold, and no tooling/provider files in the published search index.

`npm run validate:release` runs both validators and is the CI release gate.
The AIWG release gate configuration in `.aiwg/release.config` uses the same
commands for local release orchestration.

## Search Architecture

Pagenary emits a Fortemi-backed static search index for the tenant during each
build:

```text
dist/roko-kb/search-index/
├── manifest.json
├── part-0000.json
└── part-0001.json
```

The manifest uses the `aiwg.fortemi.index.chunk-manifest.v1` contract. Chunk
files use `aiwg.fortemi.index.chunk.v1`. The browser command palette loads the
chunked index and returns ranked snippets, facets, and paged results. If the
static index is missing or invalid, Pagenary falls back to an in-browser index
from section modules.

AIWG also maintains a separate project artifact index under `.aiwg/.index/`.
The current Fortemi code understands AIWG index exports directly, so after
framework or indexing-code updates, rebuild the project-local graph and export
the Fortemi contract when needed:

```bash
aiwg index build --force --verbose
aiwg index export --format fortemi --graph project --out /tmp/roko-project-aiwg-fortemi-index.json
npm run validate:aiwg-index
aiwg index status --json
```

For the common local maintenance path, run the combined command:

```bash
npm run index:aiwg
```

That command rebuilds the AIWG project graph with the current installed AIWG
indexing code, exports the project graph in Fortemi format, and validates the
export with the same vendored Fortemi AIWG-index helper used by the published
Pagenary bundle.

The Pagenary search index is the published docs search surface. The AIWG
project index is the agent/artifact discovery surface; both use Fortemi record
contracts but have different scopes and privacy defaults.

Representative queries validated against the generated Fortemi index:

| Query | Expected top result |
| --- | --- |
| `nanosecond precision` | Nanosecond Precision: Resolution vs. Accuracy |
| `censorship resistance` | Transaction Ordering & Censorship Resistance |
| `use cases` | Use Cases |
| `Publishing and Search` | Publishing and Search |

## Knowledge Map

Docs Map is enabled in `config.json` as `Knowledge Map` with the `svg` renderer.
The build generates a relationship graph from the same content corpus and
serves it through `docs-map-data.js`. Review the runtime map at `/#docs-map`.

`npm run validate:docs` imports `dist/roko-kb/docs-map-data.js`, verifies that
the graph arrays are present, reports current graph dimensions, and checks that
the node count matches the Fortemi search record count.

## Fortemi Options

The current release uses Pagenary's built-in static Fortemi index. That is the
right default for a static documentation site because it needs no backend and no
browser-local persistent archive.

Fortemi also provides richer options that should be treated as future product
decisions:

| Option | Use when |
| --- | --- |
| `@fortemi/core/aiwg-index` | Static chunked search over published docs |
| Full `@fortemi/core` archive | Local-first notes, Knowledge Shards, SKOS concepts, embeddings, pgvector semantic search, or hybrid user-owned retrieval |
| `@fortemi/graph` | Custom static or app-rendered graph projection beyond the built-in Docs Map |
| `@fortemi/react` | A future React knowledge application with hooks, GraphView, local archives, embedding workflows, and remote backends |

The migration keeps the static site path as the production baseline. The
semantic/vector archive roadmap is tracked in
`.aiwg/architecture/adr/ADR-002-fortemi-semantic-archive-roadmap.md`; that phase
requires product decisions about privacy, persistence, embedding providers,
storage lifecycle, fallback behavior, and whether the KB should become a
user-owned knowledge workspace.

## Known Follow-Ups

- Confirm production publishing target and secret handling before enabling
  automatic deployment. The current Gitea workflow intentionally stops at a
  validated `roko-kb-pagenary-dist.tgz` artifact plus checksum because no repo
  Actions secrets or variables are configured yet. The working deployment
  options and gates are tracked in
  `.aiwg/deployment/pagenary-publishing-runbook.md`.
- Track the Docs Map static snapshot warning with Pagenary. The installed
  static snapshot generator only extracts literal `html:` values from compiled
  section modules, while the generated Docs Map section delegates to
  `loadDocsMap(...)`. Runtime graph data and navigation are still validated.
