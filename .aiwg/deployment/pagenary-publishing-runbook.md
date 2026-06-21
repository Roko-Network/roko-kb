# Pagenary Publishing Runbook

## Status

Draft for production target selection.

## Current State

The ROKO knowledge base now builds as the Pagenary tenant `roko-kb`.

- Source remote: `origin` at `git@git.integrolabs.net:roko/roko-kb.git`
- Mirror remote: `github` at `https://github.com/Roko-Network/roko-kb.git`
- Production domain in tenant config: `docs.roko.network`
- Build output: `dist/roko-kb`
- Release validation command: `npm run validate:release`
- AIWG artifact index validation command: `npm run index:aiwg`
- AIWG release gate config: `.aiwg/release.config`
- Production decision record: `.aiwg/deployment/production-target-decision.md`
- Current workflow artifact: `roko-kb-pagenary-dist.tgz` plus SHA-256 checksum

No repository Actions secrets or variables are configured yet, so the workflow
must not automatically push a publish branch or deploy to an external host.

## Release Gates

The machine-readable release checklist lives in `.aiwg/release.config` for the
AIWG `flow-release` skill. The manual gate list below mirrors that config.

Before publishing a production build:

1. Run `npm ci`.
2. Run `npm run list:tenants`.
3. Run `npm run build:docs`.
4. Run `npm run validate:release`.
5. Run `npm run index:aiwg` when the deployment depends on current AIWG artifact
   index records or Fortemi artifact consumers.
6. Confirm the generated artifact checksum.
7. Confirm the target host serves `/roko-kb/` or is configured to route the
   tenant root as expected.
8. Smoke-test these pages after deploy:
   - `/roko-kb/`
   - `/roko-kb/pages/resources--publishing-and-search.html`
   - `/roko-kb/#docs-map`
   - `/roko-kb/docs-map-data.js`
   - `/roko-kb/search-index/manifest.json`

## Target Options

### Option A: Gitea Pages Branch

Use when Gitea is the canonical deployment surface for `docs.roko.network`.

Requirements:

- Confirm the pages branch name and static root expected by the host.
- Configure a repo secret with push permissions.
- Add a deployment job that runs only after validation succeeds.
- Preserve rollback by retaining prior workflow artifacts or previous pages
  branch commits.

Trade-offs:

- Keeps publishing close to the canonical repo.
- Requires confirming Gitea Pages behavior and token permissions.

### Option B: GitHub Pages Branch

Use when GitHub Pages owns the DNS or CDN path.

Requirements:

- Confirm whether `docs.roko.network` points at GitHub Pages.
- Configure GitHub Pages source branch/folder.
- Push validated `dist/roko-kb` output to the configured branch or use the
  native Pages artifact flow in GitHub Actions.

Trade-offs:

- Good fit if public docs are expected to live on GitHub infrastructure.
- Introduces split ownership because Gitea remains the canonical issue/workflow
  tracker in this migration.

### Option C: External Static Host/CDN

Use when production needs CDN controls, redirects, cache headers, or a managed
static host outside the Git remotes.

Requirements:

- Select provider and bucket/project target.
- Configure provider credentials as repo secrets.
- Add cache-control and rollback policy.
- Confirm DNS and TLS ownership for `docs.roko.network`.

Trade-offs:

- Best operational flexibility.
- More provider-specific configuration and secret management.

## Current Recommendation

Keep the workflow at validated artifact publication until the production target
is confirmed. Once a target is selected, add a second deployment workflow or a
manual `workflow_dispatch` deployment job gated by the same validation command.

## Rollback

Rollback should restore the last known-good `roko-kb-pagenary-dist.tgz` artifact
or revert the publish branch to the previous commit. For branch-based hosting,
the rollback command should be a branch reset/re-push performed by a human or a
manual workflow with explicit approval.

## Open Questions

The canonical open decision list is maintained in
`.aiwg/deployment/production-target-decision.md`.
