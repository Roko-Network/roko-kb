# Production Target Decision

## Status

Decided 2026-06-21. Live publishing is enabled via Gitea CI
(`.gitea/workflows/docs-deploy.yml`). This supersedes the prior
artifact-only / "pending maintainer decision" posture.

## Scope

This record captures the production deployment target for
`docs.roko.network`. The choices below are now implemented by the
`docs-deploy.yml` workflow and the shared static-docs auto-deploy pattern
on `integro-dev-004`.

## Decision

| Field | Decision |
| --- | --- |
| Target host | `integro-dev-004` (66.94.104.191) — shared Caddy `static-server` origin, fronted by a Cloudflare tunnel for `docs.roko.network`. Rsync target `~/production-deploy/roko-docs/`, bind-mounted read-only to `/srv/roko-docs`. |
| Public base path | Domain root (`/`) — `dist/roko-kb/` is served at `https://docs.roko.network/`. Pagenary output uses relative asset paths, so no path prefix is applied. |
| Deployment trigger | Push to `main` (every docs change publishes) plus manual `workflow_dispatch`. No version tag is required. |
| Deployment credential | Gitea repo secret `DEPLOY_SSH_KEY` — a dedicated SSH key (`deploy-roko-kb@ci`) whose public half is in the deploy host's `~/.ssh/authorized_keys`. Host/port/path/user are inlined in the workflow as infrastructure facts, not secrets. |
| Rollback method | Re-run a prior known-good commit via `workflow_dispatch`, or restore the last `roko-kb-pagenary-dist.tgz` artifact from `docs-build.yml` and rsync it to `~/production-deploy/roko-docs/`. Timestamped server-side backups of prior output exist under `~/production-deploy/roko-docs-backup-*`. |
| Post-deploy smoke URL | `https://docs.roko.network/` (canonical). The deploy job also verifies `index.html` is present on the origin and references ROKO before reporting success. |

## Implementation

- Deploy workflow: `.gitea/workflows/docs-deploy.yml` (build → `npm run validate:release` → rsync `--delete` over SSH → content verify).
- Validation workflow: `.gitea/workflows/docs-build.yml` (build, validate, package the rollback artifact on push/PR).
- The prior manual deploy (`~/roko-docs/deploy.sh` from `Roko-Network/public-docs`) and the stale `~/roko-kb` server checkout were retired to `~/retired-docs-automation-20260621-*` on the deploy host. The unrelated `roko-marketing` deploy-watcher services were left untouched.

## Acceptance Criteria (met)

- [x] Target host is selected (`integro-dev-004`, Caddy `/srv/roko-docs`).
- [x] Public base path is selected (domain root) and matches `tenants.json` host routing.
- [x] Deployment trigger is selected (push to `main` + `workflow_dispatch`).
- [x] Required repo secret is defined (`DEPLOY_SSH_KEY`); maintainer adds the value in Gitea.
- [x] Rollback path is documented.
- [x] Post-deploy smoke URL is documented (`https://docs.roko.network/`).
- [ ] Gitea issue #4 is updated with the selected deployment path.
- [x] A deploy workflow publishes only after `npm run validate:release` succeeds.
