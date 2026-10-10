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

## Games

Ordered roughly by the age skills develop (most suit 1–3 year olds; the last two suit 3+).

| Game | Practises | Levels change |
|---|---|---|
| Bubble Pop | Pointing and tapping with one finger | Bubble size, speed, pops per round |
| Rainbow Paint | Free finger painting, colour names | Brush size; a faint animal to colour in |
| Wipe & Find | Swiping/scrubbing, finishing a task, animal names | Brush width, how much to clear |
| Move with Pip | Gross motor imitation (clap, reach, stomp, jump, turn) | More movements; two in a row |
| Squish & Bloom | Pinch (pincer grasp) and spreading fingers | How far to pinch/spread; must start on the object |
| Shadow Match | Drag and drop, visual matching | 2–4 animals |
| Peekaboo Pairs | Visual memory, matching | 2–4 pairs |
| Ladybug Lines | Pre-writing strokes in developmental order | Lines → circle/cross/square → triangle/X/spiral; path width |
| Connect the Dots | Finger control, straight lines | 3×3 → 5×5 grids |

Every game records its own measures (accuracy, retries, time, line control…) for the therapist's
Progress screen. The child only ever sees stars and celebrations.

## Structure

```
src/
  art/          art.ts: all characters (animals, fruit) as SVG strings, used in the DOM and on canvas
  audio/        sound.ts: all sounds synthesised with Web Audio (no audio files)
                speech.ts: spoken instructions via the device's built-in voices
  components/   Mascot (Pip, incl. movement poses), Confetti, StarJar, Burst, HoldButton
  db/           Dexie (IndexedDB) schema for children, per-child settings and sessions, plus backup/restore
  games/
    GameShell.tsx   intro, rounds, star jar, rewards, saving results, press-and-hold exit
    types.ts        GameInfo: what a game provides (Round component, plan, levels, metrics)
    registry.tsx    the game list shown in the menu, settings and progress
    canvas.ts       shared canvas loop, particles and helpers
    <game>/         index.tsx (GameInfo) + the Round component and its styles
  screens/      Home, GameMenu, PlayGame, Settings, Progress, Tools (backup)
```

### Adding a game

1. Create `src/games/<name>/` with a `Round` component. It receives the round number, level,
   settings, the session plan and `active`, and calls `complete(result, praise?)` when the round is done.
2. Export a `GameInfo` from `index.tsx` (title, colour, icon, intro, level descriptions, `plan`, `metrics`).
3. Add it to `games` in `src/games/registry.tsx`. Settings, progress and routing pick it up automatically.

## Design principles

- **No failure states for the child.** Every finished round earns a star. Misses never buzz: lines fade,
  pieces glide home, cards wobble and turn back. Metrics are shown only on the Progress screen.
- **Made for toddlers.** No reading needed (voice and pictures), big targets, short rounds, and every touch
  does something visible.
- **Sensory-aware.** Pentatonic, soft-attack sounds; no flashing; Calm mode and `prefers-reduced-motion`
  reduce effects and volume.
- **Robust touch.** One finger at a time (palms and extra fingers ignored), generous adjustable touch
  targets, no browser zoom/scroll/back-swipe during play.
- **Therapist control.** Per-child difficulty, rounds, touch target size, guide, voice, volume and calm mode.
