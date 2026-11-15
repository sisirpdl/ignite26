# Clutch Arena revision

Branch: `design/clutch-arena`.

## User direction

Return to the original HTML app's gamified identity. Keep React Native iOS/Android support, make smaller UI improvements, and give the HTML and native versions a backend.

The remote branches inspected were `main`, `feat/clutch-logo`, `react-native-conversion`, and `design/clutch-studio`. No branch named `dev` or `devs` existed at the time of review. This revision branches from Studio to retain its working native flows, tab-state retention, poll fixes, route fixes, and accessible controls.

## Frontend

Restored near-black surfaces, neon lime/cyan/purple accents, story rings, the shared nightly Clutch card, recovery rings, dense metric cards, streak counters, duels, Phone Down and squad-feed shortcuts. Native maps are unchanged; web gets a dark schematic. Challenge shortcuts now open the corresponding arena section. Profile/ranking fixes and responsive layouts are retained.

## Backend

Added a local Node 24 / SQLite API with isolated anonymous workspaces, hashed bearer tokens, document revisions, request limits, validation, and a Fair Math endpoint. Both the original HTML and native UI save state to it. The clients have different schemas and do not mirror each other's feeds. Real multiplayer, account identity and health ingestion are not implemented.

## Verification

- Fair Math regression suite.
- API integration test: unauthorized access, disallowed origins, workspace isolation, revision conflicts, input validation, and database persistence across a service restart.
- Expo exports for web, iOS and Android.
- Browser checks: original HTML message persisted after full reload; native message and simulated reply persisted after full reload.
- Native arena progress and completed run count persisted after full reload.
- Native app preview at phone sizes; original HTML backend status inspected.

No signed native build or physical-device test was performed. The API is a development foundation; no public deployment was performed. See README for commands and boundaries.
