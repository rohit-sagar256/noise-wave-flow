---
name: release
description: Cut a new release of @elysian256/noise-wave-flow. Bumps the version, builds, commits, tags, and pushes — which triggers the publish workflow.
---

## Steps

1. **Determine the version bump** — ask the user if not specified:
   - `patch` (0.1.x) — bug fixes only
   - `minor` (0.x.0) — new features or config options, backwards compatible
   - `major` (x.0.0) — breaking API changes

2. **Update `package.json`** — set the new `version` field.

3. **Run the build** to confirm everything compiles cleanly:
   ```bash
   npm run build
   ```
   If the build fails, stop and report the error before continuing.

4. **Commit** the version bump:
   ```bash
   git add package.json
   git commit -m "<new-version>"
   ```
   No Co-Authored-By. Use the repo git identity (`rohit-sagar256 / dev.rohit256@gmail.com`).

5. **Create and push the tag** — this triggers `.github/workflows/publish.yml`:
   ```bash
   git tag v<new-version>
   git push origin main v<new-version>
   ```

6. **Confirm** by showing the Actions URL:
   `https://github.com/rohit-sagar256/noise-wave-flow/actions`

## Important

- Do not run `npm publish` manually. The CI workflow handles it using `NPM_TOKEN`.
- The tag must match `v*` exactly (e.g., `v0.2.0`) to trigger the workflow.
- If the tag already exists, delete it first: `git tag -d v<x> && git push origin :refs/tags/v<x>`.
