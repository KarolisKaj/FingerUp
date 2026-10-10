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
