# Mix N' Match

Mix N' Match is a combat-sports training network for finding compatible sparring, drilling, pad-work, grappling, and conditioning partners.

The original repository was a React Native 0.63-era app built from a dating template. Its own copy and configuration had already shifted toward finding sparring partners. The modern revival keeps that product direction and now ships as **both a web/PWA client and a fresh mobile client**.

## Architecture

```
shared/
  core.js              # fighter model, demo data, compatibility engine, session rules

web/
  src/                 # React/Vite web product
  public/              # PWA assets

mobile/
  App.js               # fresh Expo/React Native client
  app.json
  metro.config.js
  package.json

android/ ios/ src/     # archived legacy React Native implementation
```

The web and mobile apps intentionally share the same fighter data model and match engine instead of maintaining two separate versions of the product logic.

## Shared product features

Both clients now include:

- Ranked training-partner discovery
- Compatibility percentages and match reasons
- Matching based on:
  - weight
  - primary/secondary combat style
  - experience level
  - availability
  - preferred intensity
  - training goal
  - distance
  - gym verification
- Rich fighter profiles:
  - stance
  - years training
  - competition background
  - preferred round length
  - gear
  - contact preference
  - availability
  - home gym
- Connect / Pass / Undo
- Local match list
- Training session planning
- Session lifecycle: Proposed → Accepted → Completed / Canceled
- Completed-session history
- Verified-gym filtering
- Basic safety/pace guidance
- First-run onboarding
- Local-first persistence
- Dark/light theme

The included fighter profiles are fictional demo data.

## Web

The web app is built with React and Vite.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Netlify publishes `dist/` using the repository's `netlify.toml`.

Browser state is stored under `mix-n-match-v3`.

## Mobile

The new mobile app uses the current stable Expo line:

- Expo SDK 57
- React Native 0.86.3
- React 19.2.3
- AsyncStorage 2.2.0

Install and run:

```bash
cd mobile
npm install
npx expo start
```

Native development builds:

```bash
npm run ios
npm run android
```

The mobile app stores local state in AsyncStorage under `mix-n-match-mobile-v1`.

The mobile implementation is intentionally new. It does not depend on the obsolete Firebase/Twilio/IAP/navigation packages from the archived native app.

## Backend status

The current product does not require a backend to demonstrate the full discovery → match → plan → complete training loop.

A future backend phase can add:

- real accounts and athlete profiles
- messaging
- gym verification
- approximate location-based discovery
- real mutual connection requests
- push notifications
- moderation/report review
- synced training history

Those features should share one backend across web and mobile.

## Legacy native source

The old React Native 0.63 iOS/Android code remains in the repository as historical reference only. It is not part of either modern build.

A hard-coded legacy in-app-purchase shared secret was removed during the first revival pass.

## Validation

GitHub Actions now validates both product surfaces:

1. clean Node 22 web install + Vite production build
2. shared-core syntax
3. clean Expo mobile install + dependency check
4. Android JavaScript export through Expo/Metro
