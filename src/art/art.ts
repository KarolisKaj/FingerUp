/**
 * Hand-made, kawaii-style characters in one consistent look (round shapes, big eyes, rosy cheeks),
 * shared by every game. Each is an SVG string on a 200x200 canvas so it can be shown as an <img>
 * in the DOM and drawn onto a <canvas> from the same source.
 */

const INK = '#1D3557'

const eyes = (y = 104, dx = 26, r = 11) =>
  `<ellipse cx="${100 - dx}" cy="${y}" rx="${r * 0.85}" ry="${r}" fill="${INK}"/>` +
  `<ellipse cx="${100 + dx}" cy="${y}" rx="${r * 0.85}" ry="${r}" fill="${INK}"/>` +
  `<circle cx="${100 - dx + r * 0.3}" cy="${y - r * 0.4}" r="${r * 0.36}" fill="#fff"/>` +
  `<circle cx="${100 + dx + r * 0.3}" cy="${y - r * 0.4}" r="${r * 0.36}" fill="#fff"/>`

const cheeks = (y = 126, dx = 46, color = '#FF7AA8') =>
  `<ellipse cx="${100 - dx}" cy="${y}" rx="11" ry="7" fill="${color}" opacity="0.5"/>` +
  `<ellipse cx="${100 + dx}" cy="${y}" rx="11" ry="7" fill="${color}" opacity="0.5"/>`

const smile = (y = 130, w = 12) =>
  `<path d="M${100 - w} ${y} Q100 ${y + w} ${100 + w} ${y}" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`

const catMouth = (y = 132) =>
  `<path d="M88 ${y} Q94 ${y + 9} 100 ${y} Q106 ${y + 9} 112 ${y}" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`

const whiskers = (y = 128) =>
  `<g stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity="0.55">` +
  `<path d="M30 ${y - 6} L62 ${y}"/><path d="M30 ${y + 8} L62 ${y + 6}"/>` +
  `<path d="M170 ${y - 6} L138 ${y}"/><path d="M170 ${y + 8} L138 ${y + 6}"/></g>`

const shine = (cx: number, cy: number, rx = 18, ry = 10) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="0.35" transform="rotate(-25 ${cx} ${cy})"/>`

const ART = {
  cat:
    `<path d="M40 92 L50 22 L98 60 Z" fill="#F59A3D"/><path d="M160 92 L150 22 L102 60 Z" fill="#F59A3D"/>` +
    `<path d="M52 74 L57 38 L82 58 Z" fill="#FFC3D0"/><path d="M148 74 L143 38 L118 58 Z" fill="#FFC3D0"/>` +
    `<circle cx="100" cy="114" r="70" fill="#FFAA4C"/>${shine(70, 74)}` +
    `<g stroke="#E08328" stroke-width="6" stroke-linecap="round"><path d="M100 46 V62"/><path d="M84 50 L88 64"/><path d="M116 50 L112 64"/></g>` +
    `${eyes(106)}${cheeks()}<path d="M93 120 L107 120 L100 128 Z" fill="#FF7AA8" stroke="#FF7AA8" stroke-width="3" stroke-linejoin="round"/>` +
    `${catMouth(130)}${whiskers(126)}`,

  bear:
    `<circle cx="46" cy="56" r="26" fill="#A86B3C"/><circle cx="154" cy="56" r="26" fill="#A86B3C"/>` +
    `<circle cx="46" cy="56" r="13" fill="#E6B98A"/><circle cx="154" cy="56" r="13" fill="#E6B98A"/>` +
    `<circle cx="100" cy="114" r="72" fill="#B97A45"/>${shine(70, 72)}` +
    `<ellipse cx="100" cy="138" rx="32" ry="24" fill="#EBC79C"/>${eyes(102)}${cheeks(124, 50)}` +
    `<ellipse cx="100" cy="128" rx="11" ry="8" fill="${INK}"/>${smile(140, 9)}`,

  bunny:
    `<g transform="rotate(-10 72 60)"><ellipse cx="72" cy="50" rx="18" ry="48" fill="#E9E1F5"/><ellipse cx="72" cy="52" rx="9" ry="36" fill="#FFC3D0"/></g>` +
    `<g transform="rotate(10 128 60)"><ellipse cx="128" cy="50" rx="18" ry="48" fill="#E9E1F5"/><ellipse cx="128" cy="52" rx="9" ry="36" fill="#FFC3D0"/></g>` +
    `<circle cx="100" cy="122" r="66" fill="#EFE8F8"/>${shine(72, 86)}${eyes(114, 24, 10)}${cheeks(134, 42)}` +
    `<ellipse cx="100" cy="132" rx="8" ry="6" fill="#FF7AA8"/>` +
    `<path d="M100 137 V142" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>${catMouth(142)}` +
    `<path d="M95 149 h10 v7 a3 3 0 0 1 -3 3 h-4 a3 3 0 0 1 -3 -3 Z" fill="#fff" stroke="${INK}" stroke-width="2"/>`,

  pig:
    `<path d="M38 70 L46 24 L84 50 Z" fill="#FF92B0"/><path d="M162 70 L154 24 L116 50 Z" fill="#FF92B0"/>` +
    `<circle cx="100" cy="112" r="72" fill="#FFB3C7"/>${shine(70, 72)}${eyes(98)}${cheeks(122, 52)}` +
    `<ellipse cx="100" cy="132" rx="30" ry="21" fill="#FF8FAE"/>` +
    `<ellipse cx="90" cy="132" rx="5" ry="8" fill="#D9577F"/><ellipse cx="110" cy="132" rx="5" ry="8" fill="#D9577F"/>` +
    `${smile(158, 8)}`,

  frog:
    `<circle cx="60" cy="66" r="30" fill="#5CC46B"/><circle cx="140" cy="66" r="30" fill="#5CC46B"/>` +
    `<ellipse cx="100" cy="124" rx="84" ry="62" fill="#6BD17A"/>${shine(60, 104, 20, 10)}` +
    `<circle cx="60" cy="64" r="19" fill="#fff"/><circle cx="140" cy="64" r="19" fill="#fff"/>` +
    `<circle cx="63" cy="66" r="10" fill="${INK}"/><circle cx="143" cy="66" r="10" fill="${INK}"/>` +
    `<circle cx="66" cy="62" r="3.5" fill="#fff"/><circle cx="146" cy="62" r="3.5" fill="#fff"/>` +
    `${cheeks(132, 56)}<path d="M58 128 Q100 168 142 128" stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"/>`,

  chick:
    `<g stroke="#F2B705" stroke-width="7" stroke-linecap="round" fill="none"><path d="M100 50 Q96 30 84 24"/><path d="M100 50 Q104 28 118 22"/></g>` +
    `<ellipse cx="34" cy="128" rx="18" ry="28" fill="#FFC928" transform="rotate(-20 34 128)"/>` +
    `<ellipse cx="166" cy="128" rx="18" ry="28" fill="#FFC928" transform="rotate(20 166 128)"/>` +
    `<circle cx="100" cy="116" r="70" fill="#FFDB4D"/>${shine(70, 76)}${eyes(104)}${cheeks(126, 48)}` +
    `<path d="M86 120 L114 120 L100 140 Z" fill="#FF8A3D" stroke="#FF8A3D" stroke-width="5" stroke-linejoin="round"/>`,

  panda:
    `<circle cx="48" cy="54" r="25" fill="#2B2D42"/><circle cx="152" cy="54" r="25" fill="#2B2D42"/>` +
    `<circle cx="100" cy="114" r="72" fill="#FFFFFF" stroke="#D9DEE7" stroke-width="5"/>` +
    `<ellipse cx="70" cy="106" rx="20" ry="25" fill="#2B2D42" transform="rotate(-25 70 106)"/>` +
    `<ellipse cx="130" cy="106" rx="20" ry="25" fill="#2B2D42" transform="rotate(25 130 106)"/>` +
    `<circle cx="73" cy="104" r="9" fill="#fff"/><circle cx="127" cy="104" r="9" fill="#fff"/>` +
    `<circle cx="74" cy="105" r="5.5" fill="${INK}"/><circle cx="128" cy="105" r="5.5" fill="${INK}"/>` +
    `${cheeks(132, 50)}<ellipse cx="100" cy="130" rx="11" ry="8" fill="#2B2D42"/>${smile(142, 9)}`,

  mouse:
    `<circle cx="42" cy="62" r="36" fill="#AEB8C6"/><circle cx="158" cy="62" r="36" fill="#AEB8C6"/>` +
    `<circle cx="42" cy="62" r="22" fill="#FFC3D0"/><circle cx="158" cy="62" r="22" fill="#FFC3D0"/>` +
    `<circle cx="100" cy="120" r="64" fill="#BCC5D2"/>${shine(74, 86)}${eyes(112, 24, 10)}${cheeks(134, 42)}` +
    `<circle cx="100" cy="134" r="8" fill="#FF7AA8"/>${smile(144, 8)}${whiskers(136)}`,

  lion:
    Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2
      return `<circle cx="${(100 + Math.cos(a) * 62).toFixed(1)}" cy="${(104 + Math.sin(a) * 62).toFixed(1)}" r="30" fill="#E8862E"/>`
    }).join('') +
    `<circle cx="100" cy="110" r="70" fill="#E8862E"/>` +
    `<circle cx="58" cy="62" r="15" fill="#FFC56E"/><circle cx="142" cy="62" r="15" fill="#FFC56E"/>` +
    `<circle cx="100" cy="114" r="56" fill="#FFC56E"/>${shine(78, 84, 14, 8)}${eyes(106, 22, 9)}${cheeks(126, 38)}` +
    `<ellipse cx="100" cy="136" rx="22" ry="15" fill="#FFE2AE"/><path d="M92 126 L108 126 L100 134 Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
    `${catMouth(138)}`,

  fish:
    `<path d="M140 100 L190 62 Q180 100 190 138 Z" fill="#FF7A45"/>` +
    `<path d="M70 58 Q96 30 120 56 Z" fill="#FF7A45"/>` +
    `<ellipse cx="88" cy="102" rx="70" ry="52" fill="#FF9A5C"/>${shine(60, 74, 20, 10)}` +
    `<g stroke="#FFC09A" stroke-width="5" fill="none" stroke-linecap="round"><path d="M104 80 Q116 92 104 104"/><path d="M122 84 Q132 96 122 110"/><path d="M104 104 Q116 116 104 128"/></g>` +
    `<ellipse cx="56" cy="94" rx="10" ry="12" fill="${INK}"/><circle cx="59" cy="89" r="4" fill="#fff"/>` +
    `<ellipse cx="44" cy="118" rx="10" ry="6" fill="#FF5C8A" opacity="0.45"/>` +
    `<path d="M28 108 Q36 118 46 110" stroke="${INK}" stroke-width="5" fill="none" stroke-linecap="round"/>`,

  octopus:
    [40, 72, 104, 136, 164]
      .map(
        (x, i) =>
          `<path d="M${x} 130 Q${x + (i % 2 ? 12 : -12)} 160 ${x + (i % 2 ? -4 : 4)} 184" stroke="#8C68E0" stroke-width="22" fill="none" stroke-linecap="round"/>`,
      )
      .join('') +
    `<path d="M30 132 Q30 34 100 34 Q170 34 170 132 Q100 150 30 132 Z" fill="#9B7BEA"/>${shine(70, 66, 20, 11)}` +
    `${eyes(100, 26, 11)}${cheeks(122, 46)}${smile(124, 11)}` +
    `<circle cx="130" cy="58" r="7" fill="#B9A0F2"/><circle cx="146" cy="76" r="5" fill="#B9A0F2"/>`,

  ladybug:
    `<g stroke="#2B2D42" stroke-width="5" stroke-linecap="round" fill="none"><path d="M86 36 Q76 16 62 14"/><path d="M114 36 Q124 16 138 14"/></g>` +
    `<circle cx="62" cy="14" r="7" fill="#2B2D42"/><circle cx="138" cy="14" r="7" fill="#2B2D42"/>` +
    `<circle cx="100" cy="122" r="70" fill="#FF5A5F"/>${shine(64, 92, 16, 9)}` +
    `<path d="M100 60 V190" stroke="#2B2D42" stroke-width="5"/>` +
    `<circle cx="64" cy="128" r="13" fill="#2B2D42"/><circle cx="136" cy="128" r="13" fill="#2B2D42"/>` +
    `<circle cx="78" cy="168" r="10" fill="#2B2D42"/><circle cx="122" cy="168" r="10" fill="#2B2D42"/>` +
    `<path d="M50 70 Q100 20 150 70 Q100 88 50 70 Z" fill="#2B2D42"/>` +
    `<circle cx="82" cy="58" r="10" fill="#fff"/><circle cx="118" cy="58" r="10" fill="#fff"/>` +
    `<circle cx="84" cy="60" r="5.5" fill="${INK}"/><circle cx="120" cy="60" r="5.5" fill="${INK}"/>` +
    `<path d="M90 72 Q100 80 110 72" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`,

  // Fruit (with friendly faces) for the pinch game.
  strawberry:
    `<path d="M100 186 Q34 150 34 92 Q34 56 100 60 Q166 56 166 92 Q166 150 100 186 Z" fill="#FF4F64"/>${shine(64, 90, 16, 9)}` +
    [[56, 96], [144, 96], [50, 126], [150, 126], [66, 152], [134, 152], [100, 168], [84, 84], [116, 84]]
      .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="4.5" fill="#FFE07A"/>`)
      .join('') +
    `<path d="M100 66 L66 46 L88 50 L80 28 L100 46 L120 28 L112 50 L134 46 Z" fill="#45B649" stroke="#45B649" stroke-width="6" stroke-linejoin="round"/>` +
    `${eyes(112, 22, 9)}${smile(132, 9)}`,

  orange:
    `<circle cx="100" cy="110" r="74" fill="#FFA62B"/>${shine(70, 74)}` +
    `<path d="M100 38 Q104 24 114 20" stroke="#7A5230" stroke-width="6" stroke-linecap="round" fill="none"/>` +
    `<path d="M106 34 Q132 14 150 30 Q128 44 106 34 Z" fill="#45B649"/>` +
    `${eyes(108)}${cheeks(128, 48, '#FF5C5C')}${smile(132)}`,

  apple:
    `<path d="M100 60 Q70 36 44 64 Q20 100 44 152 Q66 192 100 176 Q134 192 156 152 Q180 100 156 64 Q130 36 100 60 Z" fill="#FF5A5F"/>${shine(62, 82)}` +
    `<path d="M100 62 Q98 40 106 26" stroke="#7A5230" stroke-width="7" stroke-linecap="round" fill="none"/>` +
    `<path d="M108 42 Q130 20 152 34 Q132 54 108 42 Z" fill="#45B649"/>` +
    `${eyes(112)}${cheeks(132, 46, '#FFD0D0')}${smile(136)}`,

  blueberry:
    `<circle cx="100" cy="110" r="72" fill="#5B6EE1"/>${shine(70, 74)}` +
    `<path d="M86 46 L100 34 L114 46 L108 52 L92 52 Z" fill="#3F4FB8"/>` +
    `${eyes(108)}${cheeks(128, 48)}${smile(132)}`,

  lemon:
    `<ellipse cx="100" cy="110" rx="80" ry="62" fill="#FFE04D"/><ellipse cx="22" cy="110" rx="10" ry="8" fill="#FFE04D"/><ellipse cx="178" cy="110" rx="10" ry="8" fill="#FFE04D"/>${shine(66, 78)}` +
    `${eyes(104)}${cheeks(124, 48)}${smile(128)}`,

  // Flower used by the spread ("bloom") game; petals are animated separately.
  bud:
    `<path d="M100 190 V120" stroke="#45B649" stroke-width="10" stroke-linecap="round"/>` +
    `<path d="M100 160 Q70 140 60 150 Q76 172 100 166" fill="#45B649"/>` +
    `<path d="M100 130 Q64 100 100 40 Q136 100 100 130 Z" fill="#FF7AA8"/>` +
    `<path d="M100 130 Q80 104 100 60" stroke="#FF5C8A" stroke-width="4" fill="none" stroke-linecap="round"/>`,
} satisfies Record<string, string>

export type ArtId = keyof typeof ART

export const ANIMALS: { id: ArtId; name: string }[] = [
  { id: 'cat', name: 'cat' },
  { id: 'bear', name: 'bear' },
  { id: 'bunny', name: 'bunny' },
  { id: 'pig', name: 'pig' },
  { id: 'frog', name: 'frog' },
  { id: 'chick', name: 'chick' },
  { id: 'panda', name: 'panda' },
  { id: 'mouse', name: 'mouse' },
  { id: 'lion', name: 'lion' },
  { id: 'fish', name: 'fish' },
  { id: 'octopus', name: 'octopus' },
  { id: 'ladybug', name: 'ladybug' },
]

export const FRUITS: { id: ArtId; name: string; juice: string }[] = [
  { id: 'strawberry', name: 'strawberry', juice: '#FF4F64' },
  { id: 'orange', name: 'orange', juice: '#FFA62B' },
  { id: 'apple', name: 'apple', juice: '#FF5A5F' },
  { id: 'blueberry', name: 'blueberry', juice: '#5B6EE1' },
  { id: 'lemon', name: 'lemon', juice: '#FFD400' },
]

export function artSvg(id: ArtId) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">${ART[id]}</svg>`
}

const urls = new Map<ArtId, string>()
export function artUrl(id: ArtId) {
  let url = urls.get(id)
  if (!url) {
    url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(artSvg(id))}`
    urls.set(id, url)
  }
  return url
}

const images = new Map<ArtId, HTMLImageElement>()
/** Decoded image for canvas drawing. Check `complete` before drawing; it loads in a few ms. */
export function artImage(id: ArtId) {
  let img = images.get(id)
  if (!img) {
    img = new Image()
    img.src = artUrl(id)
    images.set(id, img)
  }
  return img
}

export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Picks n different items; repeats only when n exceeds the pool. */
export function pick<T>(items: readonly T[], n: number, random = Math.random): T[] {
  const out: T[] = []
  while (out.length < n) out.push(...shuffle(items, random).slice(0, n - out.length))
  return out
}
