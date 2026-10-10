/** Spoken instructions via the device's built-in voices (works offline on iPad and Android). */

let enabled = true
let cachedVoice: SpeechSynthesisVoice | null | undefined

function pickVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice !== undefined) return cachedVoice
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'))
  if (voices.length === 0) return null // Voices load asynchronously; try again next time.
  const preferred = [/premium|enhanced|natural/i, /samantha|karen|moira|google us english|google uk english female/i]
  cachedVoice = preferred.map((re) => voices.find((v) => re.test(v.name))).find(Boolean) ?? voices[0]
  return cachedVoice
}

export const speech = {
  setEnabled(value: boolean) {
    enabled = value
    if (!value) this.stop()
  },

  /** Speaks `text`. By default it interrupts; with `queue` it waits for whatever is being said. */
  say(text: string, { queue = false } = {}) {
    if (!enabled || !('speechSynthesis' in window)) return
    if (!queue) window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = pickVoice()
    if (voice) utterance.voice = voice
    utterance.lang = voice?.lang ?? 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1.1
    window.speechSynthesis.speak(utterance)
  },

  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  },
}
