# Changelog

All notable changes to the ROKO Network documentation site are recorded here.
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [0.2.2] - 2026-06-21

### Changed
- Tightened sidebar navigation spacing: smaller gaps between collapsed
  top-level sections and the bottom standalone links (CHANGELOG, KNOWLEDGE
  MAP), and slightly less space between a section heading and its articles.

## [0.2.1] - 2026-06-21

### Fixed
- Removed the redundant Pagenary theme-picker dropdown (`themePicker.enabled:
  false` in `config.json`); theme switching is handled by the custom `☀ Theme`
  button in the banner (`overrides/roko-theme.js`).

## [0.2.0] - 2026-06-21

### Added
- Automated publishing pipeline: `.gitea/workflows/docs-deploy.yml` builds the
  Pagenary `roko-kb` tenant, runs the release validation gates, and deploys
  `docs.roko.network` on every push to `main` — rsync over SSH to the shared
  Caddy origin (integro-dev-004, `/srv/roko-docs`), fronted by a Cloudflare
  tunnel. Replaces the prior manual deploy.
- `scripts/strip-fact-comments.mjs`: post-build pass that removes the
  evidence-grade `<!-- fact:… -->` citation markers from the rendered output
  while leaving the markdown sources intact (chained into `build:docs`).

### Fixed
- Light theme: the nav sidebar, sticky topbar, and modal overlays no longer
  render black in light mode, and dark nav text is no longer invisible —
  restored the `--surface-rgb` / `--ink-rgb` companion variables that the
  config-theme injection flips to dark in `:root`.
- Fact-citation comments no longer leak as visible text across 21 pages
  (Pagenary's `marked` renderer escapes inline HTML comments instead of
  stripping them).
- `docs-build.yml` now runs inside a digest-pinned `node:20` container,
  fixing intermittent `exec: node: not found` failures on the Gitea runner;
  it continues to publish the `roko-kb-pagenary-dist.tgz` rollback artifact.

### Changed
- Recorded the production deployment target in
  `.aiwg/deployment/production-target-decision.md`; deploy coordinates
  (`DEPLOY_HOST/PORT/USER/PATH`) and the SSH key are CI secrets so they stay
  out of the public mirror.

[0.2.2]: https://git.integrolabs.net/roko/roko-kb/compare/v0.2.1...v0.2.2
[0.2.1]: https://git.integrolabs.net/roko/roko-kb/compare/v0.2.0...v0.2.1
[0.2.0]: https://git.integrolabs.net/roko/roko-kb/compare/v0.1.0...v0.2.0
[0.1.0]: https://git.integrolabs.net/roko/roko-kb/releases/tag/v0.1.0
