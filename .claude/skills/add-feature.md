---
name: add-feature
description: Add a new config option or feature to the noise-wave-flow animation engine. Covers core.js, TypeScript declarations, README, and demo site.
---

## Checklist

When adding a new config option or feature, update **all four** of these:

### 1. `src/core.js`
- Add the new key with its default value to the `DEFAULTS` object.
- Use `cfg.<key>` in the render loop — never read it from `userConfig` directly.
- The config is live-patchable via `update(patch)` automatically — no extra wiring needed.

### 2. `src/index.d.ts`
- Add the new property to the `NoiseFlowConfig` interface with a JSDoc comment.
- If it introduces a new type, export it from the same file.

### 3. `README.md`
- Add a row to the Config reference table with: option name, type, default, description.

### 4. `docs/index.html`
- Add a row to the on-page config table.
- If the option is slider-friendly, add a control to the live customizer panel and wire it to `flow.update()`.

## After making changes

Run the build to confirm no breakage:
```bash
npm run build
```

Then follow the `/release` skill to publish a new version (minor bump if new feature, patch if bug fix).

## Rules

- Do not add framework-specific logic to `core.js` — keep it pure DOM/Canvas API.
- Do not remove or rename existing config keys — that is a breaking change requiring a major bump.
- Do not bundle `react` — it is a peer dependency.
