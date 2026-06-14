---
name: changelog
description: Add or update entries in CHANGELOG.md. Use when releasing a new version or recording notable changes. Follows Keep a Changelog format.
---

## Format

`CHANGELOG.md` follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

Change types (use only what applies):
- **Added** — new features or config options
- **Changed** — changes to existing behavior or defaults
- **Fixed** — bug fixes
- **Removed** — removed features
- **Deprecated** — soon-to-be removed features

## When releasing a new version

1. Move everything under `## [Unreleased]` into a new versioned section:
   ```markdown
   ## [0.2.0] - 2026-06-14
   ```
2. Add a fresh empty `## [Unreleased]` section at the top.
3. Add a comparison link at the bottom of the file:
   ```markdown
   [0.2.0]: https://github.com/rohit-sagar256/noise-wave-flow/compare/v0.1.0...v0.2.0
   ```

## When making notable changes (before release)

Add entries under `## [Unreleased]` as you work — don't batch them at release time.

Example:
```markdown
## [Unreleased]

### Added
- `gradient` config option for linear gradient line color
- `gradientAngle` config option (degrees, default 135)

### Fixed
- Lines no longer fade on hover — far lines maintain base alpha
```

## Rules

- Write entries for users, not developers — describe the observable behavior change, not the implementation.
- Do not reference internal function or variable names.
- Each bullet is one change. Keep them short (one sentence).
- Never delete old version sections — the changelog is a permanent record.
- Commit the changelog update in the same commit as the version bump.
- Changelog-only commits are documentation — add the Claude co-author trailer:
  ```
  Co-Authored-By: Claude <claude@anthropic.com>
  ```
