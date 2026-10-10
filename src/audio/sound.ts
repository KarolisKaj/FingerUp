/**
 * All game sounds are synthesised with the Web Audio API: soft marimba/bell tones on a
 * pentatonic scale (any sequence sounds pleasant), a gentle non-punishing "miss", and
 * warm celebratory arpeggios. Nothing is loud, sharp or buzzy.
 */

// C major pentatonic, C5 upwards.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0]
// Walk up and back down the scale so long shapes never jump from a high note to a low one.
const MELODY = [...SCALE.keys(), ...[...SCALE.keys()].reverse().slice(1, -1)]

interface ToneOptions {
  freq: number
  at?: number
  duration?: number
  gain?: number
  /** Adds a 4x partial for a bell/marimba shimmer. */
  bell?: boolean
  type?: OscillatorType
}

class SoundEngine {
  private ctx: AudioContext | null = null
  private out: GainNode | null = null
  private reverbSend: GainNode | null = null
  private noise: AudioBuffer | null = null
  private volume = 0.8
  private calm = false

  configure({ volume, calm }: { volume: number; calm: boolean }) {
    this.volume = volume
    this.calm = calm
    if (this.out && this.ctx) this.out.gain.setTargetAtTime(this.masterGain(), this.ctx.currentTime, 0.05)
  }

  /** Must run inside a user gesture (browsers keep audio locked until the first tap). */
  unlock() {
    // iOS 17+: play even when the ring/silent switch is on.
    const nav = navigator as Navigator & { audioSession?: { type: string } }
    if (nav.audioSession) nav.audioSession.type = 'playback'

    if (!this.ctx) this.build()
    if (this.ctx && this.ctx.state !== 'running') void this.ctx.resume()
  }

  private masterGain() {
    return this.volume * (this.calm ? 0.55 : 0.9)
  }

  private build() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const out = ctx.createGain()
    out.gain.value = this.masterGain()

    // Soft limiter so stacked notes never clip.
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 4
    out.connect(comp).connect(ctx.destination)

    const reverb = ctx.createConvolver()
    reverb.buffer = this.impulse(ctx, 2.2)
    const reverbSend = ctx.createGain()
    reverbSend.gain.value = 0.28
    reverbSend.connect(reverb).connect(out)

    this.noise = this.whiteNoise(ctx)
    this.ctx = ctx
    this.out = out
    this.reverbSend = reverbSend
  }

  private impulse(ctx: AudioContext, seconds: number) {
    const length = Math.floor(ctx.sampleRate * seconds)
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3)
    }
    return buffer
  }

  private whiteNoise(ctx: AudioContext) {
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    return buffer
  }

  /** Filtered noise burst: claps, splashes, card swishes. */
  private burst({
    at = 0,
    duration = 0.15,
    gain = 0.2,
    freq = 1200,
    q = 1,
    sweepTo,
  }: {
    at?: number
    duration?: number
    gain?: number
    freq?: number
    q?: number
    sweepTo?: number
  }) {
    const ctx = this.ctx
    if (!ctx || !this.out || !this.noise || !this.reverbSend) return
    const t = ctx.currentTime + 0.01 + at
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.Q.value = q
    filter.frequency.setValueAtTime(freq, t)
    if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, t + duration)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(gain, t + 0.005)
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    src.connect(filter).connect(env)
    env.connect(this.out)
    env.connect(this.reverbSend)
    src.start(t, Math.random() * 0.5)
    src.stop(t + duration + 0.05)
  }

  /** A pitch glide: boings, pops and slides. */
  private glide({
    from,
    to,
    at = 0,
    duration = 0.2,
    gain = 0.2,
    type = 'sine',
  }: {
    from: number
    to: number
    at?: number
    duration?: number
    gain?: number
    type?: OscillatorType
  }) {
    const ctx = this.ctx
    if (!ctx || !this.out || !this.reverbSend) return
    const t = ctx.currentTime + 0.01 + at
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(from, t)
    osc.frequency.exponentialRampToValueAtTime(to, t + duration)
    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(gain, t + 0.01)
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    osc.connect(env)
    env.connect(this.out)
    env.connect(this.reverbSend)
    osc.start(t)
    osc.stop(t + duration + 0.05)
  }

  private tone({ freq, at = 0, duration = 0.6, gain = 0.3, bell = true, type = 'sine' }: ToneOptions) {
    const ctx = this.ctx
    if (!ctx || !this.out || !this.reverbSend) return
    const t = ctx.currentTime + 0.01 + at

    const env = ctx.createGain()
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(gain, t + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, t + duration)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = Math.min(9000, freq * 6)
    env.connect(filter)
    filter.connect(this.out)
    filter.connect(this.reverbSend)

    const partials: [number, number, number, OscillatorType][] = [[1, 1, 1, type]]
    // A touch of triangle gives the body; the quick 4x partial is the "mallet" strike.
    if (bell) partials.push([1, 0.25, 1, 'triangle'], [4, 0.12, 0.25, 'sine'])

    for (const [ratio, level, decay, wave] of partials) {
      const osc = ctx.createOscillator()
      osc.type = wave
      osc.frequency.value = freq * ratio
      const g = ctx.createGain()
      g.gain.setValueAtTime(level, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration * decay)
      osc.connect(g).connect(env)
      osc.start(t)
      osc.stop(t + duration + 0.05)
    }
  }

  private sparkles(count: number, at: number, spread: number) {
    if (this.calm) return
    for (let i = 0; i < count; i++) {
      const freq = SCALE[5 + Math.floor(Math.random() * 5)] * 2
      this.tone({ freq, at: at + Math.random() * spread, duration: 0.35, gain: 0.05 })
    }
  }

  /** Soft click for UI buttons. */
  tap() {
    this.tone({ freq: 1046.5, duration: 0.12, gain: 0.08, bell: false })
  }

  /** Played when a game begins. */
  start() {
    ;[0, 2, 4].forEach((n, i) => this.tone({ freq: SCALE[n], at: i * 0.09, duration: 0.5, gain: 0.2 }))
  }

  /** "Here I am": the finger landed away from where it should start. */
  hint() {
    this.tone({ freq: SCALE[2], duration: 0.25, gain: 0.1 })
    this.tone({ freq: SCALE[3], at: 0.1, duration: 0.3, gain: 0.1 })
  }

  /** Each successful step plays the next note of a rising and falling melody. */
  step(index: number) {
    const n = MELODY[index % MELODY.length]
    this.tone({ freq: SCALE[n], duration: 0.9, gain: 0.32 })
    // Quiet fifth below for warmth.
    this.tone({ freq: SCALE[n] / 1.5, duration: 0.7, gain: 0.08, bell: false })
    this.sparkles(2, 0.05, 0.2)
  }

  /** Bubble pop: a quick wet "plip" plus a bell note, so a run of pops makes a tune. */
  pop(index = Math.floor(Math.random() * 8)) {
    this.glide({ from: 1400, to: 380, duration: 0.09, gain: 0.22 })
    this.burst({ duration: 0.05, gain: 0.08, freq: 3000, q: 0.8 })
    this.tone({ freq: SCALE[MELODY[index % MELODY.length]], at: 0.03, duration: 0.6, gain: 0.16 })
  }

  /** Rising soft ticks while fingers pinch or spread (level 1..3). */
  stretch(level: number) {
    this.tone({ freq: SCALE[level * 2], duration: 0.25, gain: 0.1 })
  }

  /** Juicy squish: a low boing and a splash. */
  squish() {
    this.glide({ from: 320, to: 120, duration: 0.25, gain: 0.3, type: 'triangle' })
    this.burst({ at: 0.02, duration: 0.3, gain: 0.18, freq: 900, q: 0.7, sweepTo: 300 })
    ;[4, 5, 7].forEach((n, i) => this.tone({ freq: SCALE[n], at: 0.12 + i * 0.07, duration: 0.6, gain: 0.14 }))
  }

  /** A flower opening: fast harp-like upward sweep. */
  bloom() {
    ;[0, 1, 2, 3, 4, 5, 6, 7].forEach((n, i) => this.tone({ freq: SCALE[n], at: i * 0.045, duration: 0.9, gain: 0.12 }))
    this.sparkles(5, 0.3, 0.6)
  }

  /** Bouncy "boing" for characters landing or jumping. */
  boing() {
    this.glide({ from: 220, to: 520, duration: 0.18, gain: 0.18 })
    this.glide({ from: 520, to: 300, at: 0.16, duration: 0.2, gain: 0.12 })
  }

  /** Card turning over. */
  flip() {
    this.burst({ duration: 0.12, gain: 0.12, freq: 1800, q: 1.5, sweepTo: 4000 })
  }

  /** Two things belong together (cards match, piece fits its shadow). */
  match() {
    this.tone({ freq: SCALE[4], duration: 0.7, gain: 0.22 })
    this.tone({ freq: SCALE[7], at: 0.1, duration: 0.9, gain: 0.22 })
    this.sparkles(3, 0.15, 0.4)
  }

  /** A soft landing: piece dropped into place. */
  place() {
    this.glide({ from: 300, to: 160, duration: 0.12, gain: 0.25, type: 'triangle' })
  }

  /** A piece gliding back home: quiet and neutral, never a "wrong" sound. */
  slideBack() {
    this.glide({ from: 520, to: 360, duration: 0.3, gain: 0.08 })
  }

  /** Harp pluck for painting; index walks the scale (0 = low). */
  pluck(index: number) {
    const i = Math.max(0, Math.min(SCALE.length - 1, index))
    this.tone({ freq: SCALE[i], duration: 0.7, gain: 0.1 })
  }

  /** Hand clap for the movement game's beat. */
  clap(at = 0) {
    this.burst({ at, duration: 0.09, gain: 0.3, freq: 1500, q: 0.9 })
    this.burst({ at: at + 0.012, duration: 0.12, gain: 0.18, freq: 1100, q: 0.9 })
  }

  /** Soft drum for marching/stomping. */
  drum(at = 0) {
    this.glide({ from: 150, to: 55, at, duration: 0.25, gain: 0.45 })
  }

  /**
   * Continuous "swish" while wiping. Returns a handle: set the intensity (0..1) as the
   * finger moves and stop it when done.
   */
  wipe() {
    const ctx = this.ctx
    if (!ctx || !this.out || !this.noise) return { set: () => {}, stop: () => {} }
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 900
    filter.Q.value = 0.6
    const env = ctx.createGain()
    env.gain.value = 0
    src.connect(filter).connect(env).connect(this.out)
    src.start()
    return {
      set: (intensity: number) => {
        const v = Math.max(0, Math.min(1, intensity))
        env.gain.setTargetAtTime(v * 0.12, ctx.currentTime, 0.05)
        filter.frequency.setTargetAtTime(600 + v * 1400, ctx.currentTime, 0.08)
      },
      stop: () => {
        env.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
        src.stop(ctx.currentTime + 0.3)
      },
    }
  }

  /** Gentle, low "boop-boop": not wrong, just try again. */
  miss() {
    this.tone({ freq: 392.0, duration: 0.28, gain: 0.14, bell: false, type: 'triangle' })
    this.tone({ freq: 329.63, at: 0.14, duration: 0.4, gain: 0.12, bell: false, type: 'triangle' })
  }

  /** One shape/round finished. */
  roundComplete() {
    const notes = [0, 2, 4, 5, 7]
    notes.forEach((n, i) => this.tone({ freq: SCALE[n], at: i * 0.08, duration: 0.9, gain: 0.22 }))
    this.sparkles(6, 0.35, 0.8)
  }

  /** Whole session finished: short fanfare melody resolving to a warm chord. */
  celebrate() {
    const beat = this.calm ? 0.2 : 0.15
    const melody = [0, 2, 4, 2, 4, 5]
    melody.forEach((n, i) => this.tone({ freq: SCALE[n], at: i * beat, duration: 0.5, gain: 0.22 }))
    const chordAt = melody.length * beat
    for (const n of [0, 2, 3, 5]) {
      this.tone({ freq: SCALE[n], at: chordAt, duration: 2.2, gain: 0.16 })
      this.tone({ freq: SCALE[n] / 2, at: chordAt, duration: 2.0, gain: 0.07, bell: false, type: 'triangle' })
    }
    this.sparkles(14, chordAt, 1.6)
  }
}

export const sound = new SoundEngine()
