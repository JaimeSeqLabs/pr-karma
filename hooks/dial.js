// Red to green, left to right across the arc.
const ARC_COLORS = ['#ff0000', '#ff5f00', '#ff8700', '#ffaf00', '#ffff00', '#d7ff00', '#afff00', '#87ff00', '#00ff00']
const NEEDLE_COLOR = '#ffffff'

// Needle angle in 0..1 on a log scale: 1:1 points straight up, 4x either way pins the needle.
export function karma(opened, reviewed) {
  if (opened === 0 && reviewed === 0) return { p: 0.5, label: '—', good: true }
  if (opened === 0) return { p: 1, label: '∞', good: true }
  const p = 0.5 + Math.log2(reviewed ? reviewed / opened : 1 / 16) / 4
  return { p: Math.min(1, Math.max(0, p)), label: (reviewed / opened).toFixed(1), good: reviewed >= opened }
}

// Braille half dial: `rows` lines of `cols` cells, each { char, color }. Pivot at the bottom center.
export function dial(p, rows = 2, cols = 8) {
  const w = cols * 2, h = rows * 4, cx = (w - 1) / 2, cy = h - 1
  const on = new Map()
  const plot = (x, y, needle) => {
    const k = Math.round(x) + ',' + Math.round(y)
    on.set(k, on.get(k) || needle)
  }
  for (let t = 0; t <= 180; t += 2) {
    const a = (t * Math.PI) / 180
    plot(cx + cx * Math.cos(a), cy - cy * Math.sin(a), false)
  }
  const a = (1 - p) * Math.PI
  for (let s = 0; s <= 0.8; s += 0.02) plot(cx + s * cx * Math.cos(a), cy - s * cy * Math.sin(a), true)

  const LEFT = [1, 2, 4, 64], RIGHT = [8, 16, 32, 128]
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, c) => {
      let bits = 0, needle = false
      for (let dy = 0; dy < 4; dy++)
        for (let dx = 0; dx < 2; dx++) {
          const k = c * 2 + dx + ',' + (row * 4 + dy)
          if (!on.has(k)) continue
          bits += dx ? RIGHT[dy] : LEFT[dy]
          needle ||= on.get(k)
        }
      const color = needle ? NEEDLE_COLOR : ARC_COLORS[Math.round((c * 8) / (cols - 1))]
      return { char: String.fromCodePoint(0x2800 + bits), color }
    }),
  )
}
