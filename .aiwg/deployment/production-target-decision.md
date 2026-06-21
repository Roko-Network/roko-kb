# Production Target Decision

## Status

Pending maintainer decision.

## Scope

This record captures the choices required before the Pagenary artifact workflow
can publish `docs.roko.network` automatically. Until these fields are decided
and the matching repo secret or variable exists, the workflow must remain
artifact-only.

## Required Decision

| Field | Decision |
| --- | --- |
| Target host | Pending: Gitea Pages, GitHub Pages, or external static host/CDN |
| Public base path | Pending: `/roko-kb/` or domain root |
| Deployment trigger | Pending: manual approval, every `main` push, or tag-based release |
| Deployment credential | Pending: repo secret or host-native credential name |
| Rollback method | Pending: prior artifact restore, publish branch revert, or host-native rollback |
| Post-deploy smoke URL | Pending: canonical `https://docs.roko.network/...` URL set |

## Current Safe Default

The current `.gitea/workflows/docs-build.yml` workflow builds, validates,
packages, checksums, and uploads `roko-kb-pagenary-dist.tgz`. It does not push a
publish branch or deploy to an external host.

This is intentional because Gitea currently has no repository Actions secrets
or variables configured for `roko/roko-kb`.

## Decision Options

### Gitea Pages

Select this if Gitea owns the canonical production docs deployment.

Required follow-up:

- Configure the Pages branch/static-root policy.
- Add the deployment token secret.
- Add a deploy job that runs after `npm run validate:release`.
- Smoke-test the canonical docs URLs after deploy.

### GitHub Pages

Select this if the GitHub mirror owns public Pages hosting for
`docs.roko.network`.

Required follow-up:

- Confirm DNS points to GitHub Pages.
- Configure the Pages source branch or Pages artifact workflow.
- Add or confirm the credential path from the Gitea workflow to the GitHub
  mirror.
- Smoke-test the canonical docs URLs after deploy.

### External Static Host/CDN

Select this if production needs CDN controls, cache headers, provider-managed
rollback, or a static host outside the Git remotes.

Required follow-up:

- Select provider, project, bucket, or site identifier.
- Add provider credential secret.
- Define cache-control and invalidation policy.
- Smoke-test the canonical docs URLs after deploy.

## Acceptance Criteria To Enable Live Publishing

- [ ] Target host is selected.
- [ ] Public base path is selected and matches `tenants.json`/host routing.
- [ ] Deployment trigger is selected.
- [ ] Required repo secret or variable is configured.
- [ ] Rollback path is documented.
- [ ] Post-deploy smoke URLs are documented.
- [ ] Gitea issue #4 is updated with the selected deployment path.
- [ ] `.gitea/workflows/docs-build.yml` or a separate deploy workflow is updated
      to publish only after `npm run validate:release` succeeds.
