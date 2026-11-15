# Clutch Native

Clutch is a native iOS and Android migration of the original social-fitness web prototype. It retains the dark, squad-focused experience: Fair Score/recovery dashboard, ranked month challenge, squad chat with polls and reactions, live location/turf/routing, ghost races, and profile streaks/badges.

## Stack

- Expo SDK 58, React Native, JavaScript
- `react-native-maps` for native Google Maps (Android) / Apple Maps (iOS)
- `expo-location` for the explicit **Use my location** action
- `@react-native-async-storage/async-storage` for local preferences
- `react-native-svg` for the native score ring
- `@expo-google-fonts/manrope` to retain the original typography

## Prerequisites

- Node.js 22.13 or newer
- npm 10 or newer
- Expo Go on a physical device, or an Android emulator / iOS Simulator
- For iOS simulator development, macOS with Xcode

## Install

```bash
npm install
npx expo install --fix
npx expo-doctor
```

`expo install` resolves Expo-compatible native package versions; run it after updating the Expo SDK.

## Run

```bash
npm start
npm run android
npm run ios
npm run web
```

`npm start` prints a QR code. Scan it with Expo Go to test on a physical Android or iOS device. The map works in Expo Go; a store build requires native map credentials as described below.

## Quality checks

```bash
npm run test:math
npm run lint
npm run doctor
```

## Production builds

Install and sign in to EAS once:

```bash
npm install --global eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

For Android Google Maps in a production build, create a Google Cloud project, enable the Maps SDK for Android, then add its key to the `react-native-maps` Expo config plugin. iOS uses Apple Maps by default. Do not commit API keys; store them in EAS secrets/app configuration.

## Structure

```
App.js                  app entry and persistent preference bootstrap
src/ClutchApp.js        app coordination, tabs, profile overlay, toast
src/screens/            Dashboard, leaderboard, chat, map, profile
src/components/         reusable UI and common primitives
src/constants/data.js   demo squad, routes, and feed data
src/styles/theme.js     design tokens
src/utils/metrics.js    bridges the existing Fair Math engine into the app
fair-math.js            original tested score-normalization engine
```

## Notes

- The original app is a deterministic demo and has no real wearable, chat, or server backend. Native interactions remain local/demo state; production health-provider integrations and real-time APIs need their own authenticated services.
- The original Leaflet map is migrated to a genuine native map. The locations, route geometry, turf grid, and ghost run remain demo data until a real activity/location provider is connected.
- Screen-time sharing stays privacy-preserving: only the original pass/fail behavior should be synced to teammates in a backend implementation.
