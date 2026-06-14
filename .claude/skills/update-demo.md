---
name: update-demo
description: Update the GitHub Pages demo site at docs/index.html. Use when changing the live customizer, adding examples, or refreshing the demo animation config.
---

## Steps

1. **Edit `docs/index.html`** — make the requested changes.
   - The animation loads from `https://esm.sh/@elysian256/noise-wave-flow@<version>`.
   - If a new version was just published, update the version pin in the `import` statement.
   - The live customizer calls `window._flow.update(patch)` — keep `window._flow` assigned in the module script.

2. **Verify the import version** matches the current `version` in `package.json`.

3. **Commit and push** — no tag needed, GitHub Pages deploys automatically from `main`:
   ```bash
   git add docs/index.html
   git commit -m "docs: <description of change>

   Co-Authored-By: Claude <claude@anthropic.com>"
   git push origin main
   ```

4. **Confirm** the Pages URL:
   `https://rohit-sagar256.github.io/noise-wave-flow`

## Notes

- `docs/.nojekyll` must remain — it prevents GitHub Pages from running Jekyll on the folder.
- Do not put build output in `docs/` — the page uses esm.sh to load the published package directly.
- The live customizer panel is toggled by the `⚙` button (bottom-right). All controls call `flow.update()` — no page reload needed.
