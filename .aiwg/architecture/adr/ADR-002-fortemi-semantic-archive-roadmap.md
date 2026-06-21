# ADR-002: Fortemi Semantic Archive Roadmap

## Status

Proposed

## Date

2026-06-20

## Context

The ROKO knowledge base is large enough that search quality matters. The current
Pagenary migration emits a static Fortemi-compatible AIWG index for the
published docs. That index is validated in CI and is the right baseline for a
static documentation site.

The installed Pagenary package vendors Fortemi's static AIWG-index helper. Its
available contract covers:

- `aiwg.fortemi.index.export.v1` records
- `aiwg.fortemi.index.chunk-manifest.v1` chunk manifests
- chunked loading and cache control
- lexical query matching across title, text, tags, and concepts
- facets and privacy classifications
- relationships and community graph projection
- review-decision export helpers

The richer Fortemi packages remain future options:

- `@fortemi/core` for local-first archives, Knowledge Shards, SKOS concepts,
  embeddings, pgvector-backed semantic search, and hybrid retrieval
- `@fortemi/react` for a React knowledge application with hooks and GraphView
- `@fortemi/graph` for bespoke graph projections beyond Pagenary Docs Map

Adding those packages would change the published KB from a static docs bundle
into a browser knowledge application with local state, embedding configuration,
and more user-facing operational behavior.

## Decision

Keep Pagenary's static Fortemi AIWG index as the production search baseline for
this migration.

Do not add full `@fortemi/core`, vector embeddings, browser-local archive state,
or `@fortemi/react` in this migration slice.

Track a later semantic archive phase separately. That phase must start with a
product decision, not only a package install, because it affects privacy,
persistence, model/provider choices, user data ownership, and support
expectations.

## Options

### Option A: Static Fortemi AIWG Index

Selected now.

Use for:

- static hosting
- command palette search
- snippets and facets
- Docs Map graph data
- zero backend operation
- deterministic CI validation

Risks:

- lexical matching cannot answer broad semantic questions as well as embeddings
- no user-owned notes or local archives
- no vector-neighbor exploration

### Option B: AIWG Artifact Index Export

Selected for agent/artifact workflows, not for public docs UX.

Use for:

- `.aiwg/.index/project` artifact discovery
- agent-readable ADR/runbook navigation
- exporting `aiwg.artifact` records with `aiwg index export --format fortemi`

Risks:

- privacy default is project/private
- scope is AIWG artifacts, not public docs pages

### Option C: Full Fortemi Core Archive

Deferred.

Use when the KB needs:

- browser-local persistent archives
- user notes and Knowledge Shards
- SKOS concept modeling
- embedding sets and vector similarity
- hybrid lexical plus semantic retrieval
- import/export of user-owned knowledge state

Prerequisites:

- privacy model for local state and any remote embedding calls
- embedding provider and cost model
- persistence lifecycle and reset/export UX
- browser compatibility and storage-quota checks
- fallback mode when embeddings are unavailable
- support policy for user-owned local archives

### Option D: Fortemi React Knowledge Application

Deferred.

Use when the site becomes an interactive knowledge app rather than a static docs
site.

Prerequisites:

- React application shell decision
- UI design for archives, notes, related views, and graph exploration
- migration plan from Pagenary static shell or a sidecar app strategy

### Option E: Custom Fortemi Graph Projection

Deferred unless Pagenary Docs Map is insufficient.

Use when the KB needs:

- custom graph layouts
- custom community scoring
- static graph snapshots outside Pagenary's built-in Docs Map
- graph exports for other systems

## Consequences

Positive:

- The current published KB remains static-host friendly and operationally simple.
- Search and graph behavior are validated without adding persistent browser
  state or embedding dependencies.
- The semantic/vector path remains available with clear prerequisites.

Trade-offs:

- Semantic/vector retrieval remains future work.
- Product owners must choose whether the KB is only public docs or also a
  user-owned knowledge workspace.
- If semantic archive work starts later, it needs a separate prototype and
  acceptance criteria.

## Follow-Up Work

- File and track a product decision issue for the semantic archive phase.
- Prototype full Fortemi core on a branch or sidecar demo before adding it to
  production docs.
- Define representative semantic queries and compare static search vs hybrid
  semantic retrieval.
- Decide whether embedding generation happens locally, via a remote provider, or
  via precomputed static vectors.
- Document privacy and storage behavior before exposing local archives to users.
