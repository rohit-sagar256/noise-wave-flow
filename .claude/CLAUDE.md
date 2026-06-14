---
alwaysApply: true
---

## Agent rules

- Git identity is always `rohit-sagar256 <dev.rohit256@gmail.com>` — set it before any commit if not already set.
- **Co-author rule:** Do NOT add `Co-Authored-By` to code or release commits. For documentation-only commits (README, CHANGELOG, docs/, `.claude/` files), ADD the following trailer:
  ```
  Co-Authored-By: Claude <claude@anthropic.com>
  ```
- Never commit `dist/`, `node_modules/`, or `package-lock.json` — all three are in `.gitignore`.
- Always run `npm run build` before publishing or tagging a release.

## Publish pipeline

Releases are triggered by pushing a `v*` tag to `main`. The GitHub Actions workflow (`.github/workflows/publish.yml`) handles `npm publish` automatically using the `NPM_TOKEN` secret. Do not run `npm publish` manually.

## Key files

| File | Purpose |
|------|---------|
| `src/core.js` | Pure animation engine — no framework deps |
| `src/index.js` | Re-exports from core |
| `src/react.js` | React hook (`useNoiseFlow`) |
| `src/index.d.ts` | TypeScript declarations for core |
| `src/react.d.ts` | TypeScript declarations for React hook |
| `docs/index.html` | GitHub Pages demo + live customizer |
| `vite.config.js` | Build config — also copies `.d.ts` files to `dist/` |

## Versioning

Use semver. Bump `version` in `package.json` before tagging:
- Patch `0.1.x` — bug fixes, no API changes
- Minor `0.x.0` — new config options or features, backwards compatible
- Major `x.0.0` — breaking API changes

## What NOT to do

- Do not add framework-specific logic to `core.js`.
- Do not bundle `react` — it is a peer dependency.
- Do not push a tag without bumping the version in `package.json` first.
- Do not run `npm publish` manually — the CI workflow handles it.
