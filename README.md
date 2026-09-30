# Mix N' Match

<!-- repo-intro:start -->
**Project snapshot:** Mix N' Match is a combat-sports training partner network with shared matching logic across a React web/PWA client and an Expo/React Native mobile client.

**What it demonstrates:** React · React Native/Expo · shared domain logic · local-first state · matching UX.
<!-- repo-intro:end -->

<!-- portfolio-refresh:start -->
## Product at a glance

| Area | Current build |
| --- | --- |
| Surfaces | React web/PWA + Expo/React Native mobile |
| Shared logic | One fighter model + compatibility engine across both clients |
| Discovery | Ranked partners with explainable compatibility scoring |
| Training flow | Discover → Connect → Plan session → Accept → Complete/Cancel |
| Safety | Local report/block controls + pace/safety guidance |
| Release work | EAS profiles, bundle IDs, native assets, Android/iOS export checks |

### Engineering angle

The key rebuild decision was to **replace the obsolete mobile dependency stack without throwing away the product idea**. The modern web and mobile clients now share domain logic instead of maintaining two incompatible matching systems.
<!-- portfolio-refresh:end -->

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

The mobile app stores local state in AsyncStorage under `mix-n-match-mobile-v2`.

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
2. shared-core syntax + automated compatibility tests
3. clean Expo mobile install + dependency compatibility check
4. Android JavaScript export through Expo/Metro
5. iOS JavaScript export through Expo/Metro
6. release-config and mobile asset checks

## Release-readiness pass

The current release shell now also includes:

- iOS bundle identifier: `com.bthecoderr.mixnmatch`
- Android package: `com.bthecoderr.mixnmatch`
- dedicated app icon, adaptive Android icon, and splash asset
- EAS `development`, `preview`, and `production` build profiles
- native mobile date/time selection for session planning
- detailed "Why we matched" score breakdowns on web and mobile
- local report reasons and blocked-profile management
- shared match-engine tests
- CI bundling checks for both Android and iOS JavaScript

The local report flow is intentionally transparent: without a production backend, reports are saved only on the user's device and hide the selected profile locally. When a real backend is added, this UI can be connected to a moderation queue instead of pretending reports are being transmitted today.

### EAS builds

From `mobile/` after authenticating with Expo/EAS:

```bash
npm run build:preview
npm run build:production
```

No Expo project ID, App Store credentials, Google Play credentials, or signing secrets are committed to the repository.
