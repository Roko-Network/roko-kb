# ADR-001: Pagenary and Fortemi Search Architecture

## Status

Accepted

## Date

2026-06-20

## Context

The ROKO knowledge base is moving from the old dbbuilder proof-of-concept
publisher to Pagenary. The repository is large enough that publishing cannot be
treated as a simple Markdown-to-HTML conversion; search, graph navigation, and
future semantic retrieval options need to be explicit.

Current evidence:

- `@pagenary/publisher@2026.6.13` builds the tenant successfully.
- The build emits 112 current sections, static snapshots for content pages, SEO
  artifacts, Docs Map with the SVG renderer, and a Fortemi search index.
- The generated search index uses
  `aiwg.fortemi.index.chunk-manifest.v1` with chunk files using
  `aiwg.fortemi.index.chunk.v1`.
- Representative Fortemi queries return expected top results across core
  technology, meetings, archive, and resources.
- `npm run validate:docs` validates the emitted Fortemi chunk manifest, chunk
  files, Docs Map data, and representative search queries.
- `@fortemi/core@2026.6.7` provides both static AIWG index search through
  `@fortemi/core/aiwg-index` and a heavier browser-local PGlite archive with
  full-text, pgvector-backed semantic search, embeddings, hybrid ranking, SKOS
  concepts, and Knowledge Shards.
- `@fortemi/graph@2026.6.7` provides framework-agnostic graph projection helpers
  for static or app-hosted community graph views.
- `@fortemi/react@2026.6.7` provides React bindings, hooks, and GraphView for a
  future richer knowledge application, but this repository currently publishes a
  static documentation site.
- AIWG also maintains a project artifact index under `.aiwg/.index/project`.
  Latest Fortemi can consume `aiwg index export --format fortemi` output
  directly; this is separate from Pagenary's published docs search chunks.
- `npm run index:aiwg` rebuilds the AIWG project graph with the current
  installed indexing code, exports `/tmp/roko-project-aiwg-fortemi-index.json`,
  and validates that export with Pagenary's vendored Fortemi AIWG-index helper.

## Decision

Use Pagenary's built-in Fortemi static index as the production search path for
this knowledge base now.

Enable Pagenary Docs Map for graph navigation over the same corpus.

Do not add full `@fortemi/core` archive runtime, pgvector embeddings, or
`@fortemi/react` application state to the published KB in this migration slice.
Track that as a future product decision because it changes the site from a
static documentation bundle into a local-first browser knowledge application
with persistent local storage, embedding capability setup, and more operational
surface area.

## Options Considered

### Option A: Pagenary static Fortemi index

This is the selected baseline. It is already emitted by Pagenary, works on
static hosting, supports chunked index loading, ranked snippets, facets, and
offset paging, and has been validated against representative ROKO queries.

### Option B: Pagenary static index plus Docs Map

This is also selected. Docs Map adds graph navigation without introducing
browser-local persistent storage or a React application shell. The current build
validator imports the generated graph data, reports graph dimensions, and
checks that graph nodes match the Fortemi search record count.

### Option C: Full `@fortemi/core` local archive with embeddings

Deferred. This would unlock browser-local notes, Knowledge Shards, SKOS
concepts, search history, pgvector-backed semantic retrieval, hybrid ranking,
and embedding-set workflows. It also requires product choices about local
storage modes, embedding providers, privacy posture, user state, and whether the
published KB is still a static docs site or a richer knowledge app.

### Option D: `@fortemi/react` knowledge application

Deferred. This is appropriate if the KB becomes an interactive React knowledge
workspace with note capture, related-note views, import/export, remote backends,
or user-specific archives. It is not necessary for static docs publishing.

### Option E: Direct `@fortemi/graph` projection customization

Deferred unless the built-in Docs Map proves insufficient. It is a good fit for
custom static graph snapshots or a bespoke graph UI without React or PGlite.

## Consequences

Positive:

- The published KB remains static-host friendly.
- Search and graph navigation are enabled without a separate backend.
- The CI workflow can validate the search-index contract after each build.
- Local and CI validation share the same `npm run validate:docs` command.
- The decision keeps heavier vector/embedding features available without
  prematurely committing the site to persistent browser-local state.

Trade-offs:

- Current production search is lexical/static-index search with graph facets,
  not a fully personalized semantic archive.
- Embedding-backed similarity search and Knowledge Shard workflows remain
  future work.
- Docs Map currently emits a build warning for static HTML extraction of the
  dynamic map page. Runtime data and module generation are valid and checked by
  `npm run validate:docs`; the warning is caused by the installed Pagenary
  static snapshot extractor expecting a literal `html:` property while the
  generated Docs Map module delegates to `loadDocsMap(...)`.

## Follow-Up Work

- Confirm whether production publishing should force-push a `pages` branch or
  use another static hosting target.
- Decide whether the KB should later expose a full local-first Fortemi archive
  mode for semantic search and user-owned notes.
- Review the Docs Map static snapshot warning with Pagenary maintainers if a
  crawlable static snapshot of the dynamic map page is required.
- Rebuild `.aiwg/.index/project` after AIWG indexing-code updates and export the
  project graph with `npm run index:aiwg` when a Fortemi consumer needs
  artifact-level AIWG records.
