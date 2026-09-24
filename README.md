# MindQuest Arcade

MindQuest Arcade is a browser-based game-learning prototype for ages 3–18. It currently contains seven game worlds, five age pathways, 20 progressive levels per world and four activities per level.

## Current architecture
- Static web app suitable for GitHub Pages.
- Player-wide profile storage is separated from per-game, per-age checkpoints.
- Checkpoints are created only after meaningful progress and are saved on events/explicit save, not on a continuous timer.
- Practice Insights explicitly describe gameplay practice signals; they are not IQ, clinical or academic assessments.
- Level completion, failure, milestone and account events feed the local intelligence layer.
- Basic accessibility support remains in the free/core experience.
- Premium screens describe roadmap functionality honestly; payment processing and inactive premium modules are not presented as live features.

## Game worlds
Memory Lab, Detective, Reflex Arena, Builder, Team Quest, World Explorer and Money Mission.

## Development status
This remains a prototype. It is not yet a production child-data service, cloud account platform, payment system, teacher platform or validated educational assessment. Real-device testing, educator review and observed child usability testing remain required before production use.

## Regression checks
Run:

```bash
npm test
```

The included tests are dependency-free static/regression checks. The Memory Lab build also includes a dedicated `tests/memory-lab-verify.js` check covering its five pathway schedules, 100 levels, 400 activity slots, unlock metadata and documented difficulty checkpoints. These checks should be complemented by browser/device end-to-end testing as the product moves toward pilot deployment.
