# QueueMate mobile

Expo React Native app for QueueMate customers and agents.

## Run locally

1. Copy `.env.example` to `.env.local` and change the API URL only when using a local API.
2. From the repository root, run `npm install`.
3. Run `npm run start:mobile` for Expo Go, or `npm run start:mobile:dev` for a development build.

For a physical phone using a local API, use the computer's LAN address rather than `localhost`.

## Builds

Run `npx eas init` once to replace the placeholder EAS project ID, then use:

- `npx eas build --profile preview --platform android` for a test APK.
- `npx eas build --profile production --platform android` for Play Store output.
- `npx eas build --profile production --platform ios` for App Store output.
