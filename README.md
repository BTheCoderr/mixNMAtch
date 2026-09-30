# Mix N' Match

A modern revival of the original Mix N' Match / Boxeo React Native project.

The original repository started from a dating-app template, but its product direction had already shifted toward **finding combat-sports sparring and training partners**. This revival keeps that idea and removes the dating-template dependency from the primary product experience.

## Current web app

The production-ready app lives in `web/` and builds with Vite.

### Features

- Discover local training partners
- Filter by:
  - combat style
  - experience level
  - distance
  - weight range
- Connect / pass / undo
- Local training matches
- Session planner
- Training intensity and session-type planning
- Local athlete profile
- Basic training-safety reminders
- Dark/light theme
- Responsive mobile navigation
- Installable PWA
- Offline app shell
- Local persistence via `localStorage`

The current revival intentionally does **not** require a database, login, Firebase, geolocation, push notifications, video calls, or payments.

This lets the original product concept work as a complete portfolio/demo application before any backend is introduced.

## Local-first storage

Browser data is saved under:

```
mix-n-match-v2
```

Stored data includes:

- skipped profiles
- training matches
- planned sessions
- discovery filters
- athlete profile
- theme

The included fighter cards are fictional demo profiles for product demonstration.

## Run the web app

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production output is written to `dist/`.

## Netlify

`netlify.toml` is included at the repository root.

- Build command: `npm run build`
- Publish directory: `dist`

## Legacy React Native source

The original iOS/Android React Native source remains in the repository as historical reference.

That native app was built around React Native 0.63-era dependencies, Firebase, legacy navigation, Expo unimodules, WebRTC/Twilio, push notifications, and in-app purchases. It is **not** part of the modern web build.

A previously hard-coded legacy in-app-purchase shared secret was removed during the revival.

If a native app is revived later, it should be rebuilt on a current React Native architecture rather than attempting to ship the old dependency tree unchanged.

## Product direction

Mix N' Match is now positioned as:

> A combat-sports training network for finding compatible sparring and drilling partners by style, size, experience, goals, availability, and preferred intensity.

The next backend phase, if needed, would add real accounts, profiles, messaging, gym verification, and location-based discovery.
