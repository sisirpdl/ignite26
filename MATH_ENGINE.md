# Fair Math Normalization Engine

`fair-math.js` turns wearable observations into a device-neutral *relative* score. It does not diagnose health or convert one vendor's HRV unit into another.

## Rules

- HRV and resting heart rate are scored against a 30-day rolling **median + MAD** baseline, keyed by both source and metric. A Samsung `HEART_RATE_VARIABILITY` value can never be evaluated using an Apple `SDNN` baseline. This avoids pretending that SDNN and RMSSD are interchangeable.
- A baseline needs at least 14 valid days. Readings that are too old or tied to a mismatched source/metric are unavailable rather than silently guessed.
- HRV uses a bounded robust z-score; RHR uses the same method in the inverse direction. The median scores 50; large deviations saturate rather than dominating the day.
- Sleep gives full duration credit for 7.5–8.5 hours and blends duration (80%) with efficiency (20%).
- Step Target Achievement Ratio (TAR) is `steps / personalTarget`, capped at `1.20` before awards. The target earns 100 points and the maximum verified over-target bonus is 20, so 30,000 steps cannot outscore 12,000 steps on a 10,000-step goal.

## Scores and eligibility

Recovery is readiness only: **35% HRV, 35% sleep, 15% RHR**, normalized across those three weights. The Daily Fair Score uses the specified **35% HRV, 35% sleep, 15% RHR, 15% verified steps**.

Leaderboard eligibility additionally needs a complete score, at least 0.80 evidence confidence, and four passing step checks: monotonic cumulative data, plausible rate, no duplicated source, and consistent location. A non-verified record remains visible to its owner but is not ranked.

## Month Challenge

Each leaderboard-eligible Daily Fair Score is one daily entry from 0–100. For the month view, every Fair Score point is expressed as **five fixed Challenge Score units**. This is a shared unit conversion, not a player-specific multiplier, bonus pool, or second XP calculation, so it cannot change the ranking.

The 12-hour chart begins from each player's cumulative score through day 18 and plots only the verified movement on day 19. Its Y-axis is a compressed thousands-based scale: it dynamically sets the lower and upper bounds, then gives finer visual resolution near the leading scores (for example, 6,000 → 7,000 → 7,500 → 7,800 → 8,000). That keeps the current leader visibly highest without hiding today's movement.

Run the deterministic checks with:

```bash
node fair-math.test.js
```
