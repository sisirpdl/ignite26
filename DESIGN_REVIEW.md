# Clutch Studio — frontend review

Branch: `design/clutch-studio`, based on `origin/react-native-conversion`.

## What was reviewed

- `main`: original single-page social fitness prototype and Fair Math engine.
- `feat/clutch-logo`: generated logo direction.
- `react-native-conversion`: Expo iOS/Android migration and interactive demo flows.

## Direction

A premium, approachable training club: paper-colored surfaces, forest ink, lime accents, Manrope typography, and a compact vector brand mark. Today prioritizes readiness, personal effort, the next squad challenge, and recovery. Standings, Squad, Explore, profiles, and the arena share the new palette.

## Preserved frontend functions

- Readiness and Fair Score from the existing normalization engine; steps, strain, sleep, stress, battery, screen time, VO₂ max.
- Four ranking chart ranges and member profiles.
- Local squad messages, simulated replies, reactions, polls, view-once snaps, and quick replies.
- Duels, squad challenges, bonuses, overnight Clutch, Phone Down, and reward progress.
- Native route maps, location permission, rally points, turf, and ghost runs.
- Local profile preferences, streaks, badges, and daily spotlight.

Chat and map state now survive tab switches. Poll votes are mutually exclusive. Profile rank/total comes from the leaderboard. Profile social actions respond in the demo. A runner now follows the selected route, and GPS failures show feedback.

## Review locally

Use Node 22.13+ (Node 24 recommended).

```sh
npm ci
npm run build:preview
npm run preview
```

Open http://127.0.0.1:8082. The browser map is a labeled, interactive route schematic. iOS/Android retain `react-native-maps`; the schematic is isolated in a `.web.js` platform file.

For native testing: `npm start`, then open in a compatible Expo Go client or use `npm run ios` / `npm run android`. If macOS reports an EMFILE watcher limit, install/configure Watchman or review the static export instead.

## Validation

- Existing `node fair-math.test.js`: passed.
- Expo production exports for web, iOS, Android: passed.
- Browser checks: phone layouts at 320 and 390 CSS pixels; tablet DOM width at 768 (no horizontal overflow).
- Interactive checks: chat send/reply and retention across tabs; navigation; standings; profile totals; route selection/start/end; duel creation/settlement.
- Physical iOS/Android devices, safe-area behavior on actual hardware, permission dialogs, and native map rendering still require device QA. Bundle export is not a signed native build.

## Frontend-only boundary

This is a design-review demo. Health readings, chat participants, races, scores and game outcomes are seeded/simulated, not connected services. Chat and games are session state; only profile preferences persist across reloads. Existing challenge scoring and badge systems are independent demo state, not a unified ledger. No backend, accounts, real wearable synchronization, push notifications, real-time location sharing or production health-data storage were added. Backend work waits for design approval.
