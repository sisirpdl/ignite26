# Clutch Arena

A gamified social-fitness app for iOS, Android and web, based on the original HTML prototype. This branch restores the original dark surfaces, neon accents, story circles, squad challenges and dense health cards, while keeping the native navigation and interaction fixes.

## Run both versions with the backend

Requires **Node 24+** (the API uses built-in `node:sqlite`).

```sh
npm ci
npm run build:preview
npm run server
```

- React Native web: http://127.0.0.1:8787/
- Original HTML with persistence: http://127.0.0.1:8787/legacy
- API health: http://127.0.0.1:8787/api/health

Both versions now use the same development API. Their demo state uses separate document schemas: edits in the HTML feed do not appear in the native feed. Each browser/device receives a private demo workspace token. No sign-up or external service keys are needed for local review.

## Native iOS / Android

Keep the backend running, then start Expo in a second terminal:

```sh
npm start
# or
npm run ios
npm run android
```

The default API address is `127.0.0.1:8787` on iOS Simulator/web and `10.0.2.2:8787` on the Android emulator.

For a physical phone on the same trusted Wi-Fi network, bind the API to your computer's LAN address and set the native client URL before starting Expo:

```sh
HOST=0.0.0.0 npm run server
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_LAN_IP:8787 npm start
```

Use a compatible Expo Go client or a development build. Physical-device and signed-store builds still need QA; production requires HTTPS and platform map configuration. The React Native app uses native maps on iOS/Android. The browser-only map is explicitly labeled as a demo route schematic.

## What persists

- Native messages (including polls/reactions), profile preferences, arena progress and completed run summaries.
- HTML feed, selected group, score adjustments/events, duels, Clutch challenges, badge progress and seen stories.
- SQLite database under `server/data/clutch.sqlite`, ignored by Git.
- A private workspace token stored locally; only its hash is stored in SQLite.

A save indicator shows pending, successful and failed writes. Wait for **Saved to backend** before closing the app. Failed network writes retry; revision conflicts are reported rather than silently overwriting another tab. State is not synchronized live between clients. Native in-progress maps/races are session state; completed runs are persisted.

## Backend

The dependency-free Node HTTP service serves both frontends and these endpoints:

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Development API health |
| `POST /api/session` | Create a private anonymous demo workspace |
| `GET /api/state` | Read the workspace documents (Bearer token required) |
| `PUT /api/state/:key` | Save `{revision, value}` with optimistic concurrency |
| `POST /api/score` | Run Fair Math against submitted observations |

Allowed document keys: `messages`, `preferences`, `game`, `runs`, `html`. The API validates document shape, limits payloads and request rate, restricts browser origins, and isolates sessions. A stale revision returns HTTP 409. The scoring endpoint labels submitted data as unverified; it is not proof of real wearable activity.

Configuration: `PORT` (8787), `HOST` (127.0.0.1), `CLUTCH_DB` (database path), `ALLOWED_ORIGINS` (comma-separated browser origins), and `EXPO_PUBLIC_API_URL` (client address, baked into Expo exports).

## Checks

```sh
npm run test:math
npm run test:server
EXPO_NO_TELEMETRY=1 npx expo export --platform all
```

See `DESIGN_REVIEW.md` for the review record.

## Development scope

This is a **persistent development prototype**, not a production multiplayer service. Squad members, wearable readings, messages from teammates, race movement and game settlements are simulated. Document persistence is not a server-authoritative game ledger. Production work still includes account authentication and recovery, real squad membership, secure device credentials, health-provider ingestion, verified scoring/settlement, real-time events, backups, observability and deployment. Do not expose the development API publicly or use it for real health data.

The original HTML file still uses CDN dependencies. Serve it through the backend; opening it with `file://` does not connect the API.
