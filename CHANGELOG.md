# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-06-14

### Added
- `gradient` config option — array of RGB strings for a linear gradient line color
- `gradientAngle` config option — gradient direction in degrees (default 135)
- Live gradient controls (from/to color pickers + angle slider) in the demo customizer

### Changed
- Default `alpha` raised from `0.14` to `0.3` for better visibility on dark backgrounds
- Line width increased from `0.7px` to `1.0px` for crisper rendering

### Fixed
- Lines no longer fade on hover — far lines maintain their base alpha, near lines (cursor area) get brighter

## [0.1.0] - 2026-06-14

### Added
- `createNoiseFlow(canvas, container, config)` — attach animation to an existing canvas
- `mountNoiseFlow(container, config)` — auto-create and inject a canvas
- `useNoiseFlow(config)` React hook
- TypeScript declaration files for all exports
- GitHub Pages demo site with live customizer panel
- Local dev demo (`npm run demo`) importing directly from source

[Unreleased]: https://github.com/rohit-sagar256/noise-wave-flow/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/rohit-sagar256/noise-wave-flow/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/rohit-sagar256/noise-wave-flow/releases/tag/v0.1.0
