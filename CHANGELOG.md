# v8.2 — Global Product Localization

- Removed country-specific product copy and examples from the core experience.
- Money Mission now uses neutral currency values and generic financial scenarios rather than a country-specific currency.
- World Explorer replaced country-specific places, culture, climate, direction, route and time-zone examples with globally distributed examples.
- Updated regression tests to verify the globalized content.

# Changelog

## v8.1 — Independent Review Hardening + v7.12 Integration

### Integrated from reviewer release
- Added the missing header-actions mount point so Player Profile is reachable.
- Adopted the reviewer’s corrected World Explorer direction and distance-order generation.
- Adopted the reviewer’s Savings Planner wording/options and Budget Builder criterion clarification.
- Added the reviewer regression-test concept and converted it into dependency-free checks suitable for this static prototype.

### Preserved or strengthened beyond v7.12
- Kept the stronger Exact Change implementation with Undo, Clear, higher denominations and fractional currency units.
- Kept the expanded Detective probability bank rather than reverting to the smaller reviewer bank.
- Kept the adult/guardian account gate.
- Kept export/delete local-data controls.
- Kept premium-roadmap honesty and free accessibility support.
- Kept the broader World Explorer mechanics already present in the hardened build.

### Persistence hardening
- Introduced versioned player/profile storage alongside versioned checkpoints.
- Checkpoints contain per-game/per-pathway progress only.
- Added legacy migration from prior v4/v3 checkpoint and player stores.
- Added a meaningful-progress guard to prevent phantom Level 1 checkpoints.
- Removed continuous save and console-render intervals.
- Saves now occur on meaningful events, explicit Save & Arcade, visibility changes and page exit.
- Added pathway-aware duplicate protection for level-completion logging.
- Player-wide XP and profile information remain independent of Resume state.

### Important validation note
This release is stronger technically, but it is still a prototype. Browser/device testing, child usability testing, educator content review and production privacy/security work remain required.
