# NPM Package Release Process

Scope: publish npm packages in `packages/*`.
This does NOT cover registry/console deployment.

## Prereqs
- npm auth available via one of:
  - `.npmrc.publish.local` (preferred, ignored by git)
  - `NPM_TOKEN` env var
  - `npm login` (interactive)

## Standard flow
1) Create changeset
```bash
pnpm changeset
```

2) Bump versions + changelogs
```bash
pnpm release:version
```

3) Publish
```bash
pnpm release:publish
```

Notes:
- `release:publish` should run `release:check` (build + lint + typecheck) before publishing.
- `release:publish` should create git tags automatically.
