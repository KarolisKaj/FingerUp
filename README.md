# FingerUp

Fine motor skill games for children with special needs, built for use by an occupational therapist.
Runs in the browser on any tablet (iPad or Android) and installs to the Home Screen as an offline app.
No app store, no accounts, no server: all data stays on the device.

The previous React Native/Expo app is preserved at the git tag `legacy-react-native-2023`.

## Develop

Requires Node 20+.

```sh
npm install
npm run dev        # http://localhost:5173 (add --host to open it from a tablet on the same Wi-Fi)
npm test           # unit tests (vitest)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run icons      # regenerate PWA icons from public/favicon.svg
```

## Deploy

Every push to `master` runs tests, builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`: https://karoliskaj.github.io/FingerUp/

`dist/` is a plain static site, so any other static host works too. The build uses
relative paths and hash routing, so it works from a sub-path such as `/FingerUp/` without config.
The therapist opens the URL once and uses **Share → Add to Home Screen**. Updates download in the
background and apply on the next launch.

## Structure

```
src/
  audio/        sound.ts: all sounds synthesised with Web Audio (no audio files)
                speech.ts: spoken instructions via the device's built-in voices
  components/   Mascot (Pip), Confetti, StarJar, HoldButton (press-and-hold to leave a game)
  db/           Dexie (IndexedDB) schema for children, per-child settings and sessions, plus backup/restore
  games/
    registry.tsx       game list shown in the menu (unported games are marked "Coming soon")
    connectDots/       shapes.ts (library + geometry), engine.ts (canvas + pointer input),
                       ConnectDots.tsx (screen flow, rewards, saving results)
  screens/      Home, GameMenu, Settings, Progress, Tools (backup)
```

## Design principles

- **No failure states for the child.** Every finished round earns a star; misses play a soft "boop" and
  the line gently fades. Metrics (misses, line control, speed) are shown only on the Progress screen.
- **Sensory-aware.** Pentatonic, soft-attack sounds; no flashing; Calm mode and `prefers-reduced-motion`
  reduce effects and volume.
- **Robust touch.** One finger at a time (palms and extra fingers ignored), generous adjustable touch
  targets, no browser zoom/scroll/back-swipe during play.
- **Therapist control.** Per-child difficulty, rounds, touch target size, guide, voice, volume and calm mode.
