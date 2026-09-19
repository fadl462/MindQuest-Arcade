# MindQuest Arcade — Memory Lab v0.2

## What is included
- 20 progressive Memory Lab levels.
- 4 mini-activities per level = 80 activities.
- Automatic level progression after all 4 activities are passed.
- A failed activity fails the level and restarts it from Activity 1.
- Six memory activity types: Visual Recall, Sequence Recall, Location Memory, Pair Memory, Feature Memory and Working Memory.
- Age-specific memory loads and timing for ages 3–5, 6–8, 9–11, 12–14 and 15–18.
- Difficulty progressively increases through memory load, distractors, sequence length, spatial grids, feature combinations and response windows.
- No external libraries.

## Timing approach
The timing is deliberately conservative: younger learners receive longer study and response windows, while older pathways gradually receive shorter windows and higher memory loads. These settings are intended for a playable educational prototype and should be tuned further using real learner performance data rather than treated as a clinically validated optimum.

## Files
- index.html
- styles.css
- app.js
- memory-lab.js

## Deploy
Replace the corresponding files in the MindQuest-Arcade GitHub Pages repository and commit/push them to `main`.

## v0.3 interaction update
Each Memory Lab activity now opens with a dedicated instruction screen before the timed challenge begins. The learner sees the objective, how to play, timing and pass condition, then chooses “Start Activity”.


## v0.6 — Single-screen game experience

All five games now use the same compact viewport-first experience:
- Instruction screen appears before the activity.
- The activity does not start until the learner presses Start Activity.
- Game content is sized to fit the available viewport on desktop/laptop screens.
- Detective, Reflex Arena, Builder and Team Quest now have dedicated instruction screens just like Memory Lab.
- The gameplay area uses compact layouts so the learner should not need to scroll during a normal activity.
