// Generate placeholder PWA icons (no deps — raw PNG via zlib). Replace with a
// real logo later. Dark background + an accent dot, plus a maskable variant
// with extra safe-area padding.
import { writeFileSync, mkdirSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const BG = [0x15, 0x17, 0x1c]
const FG = [0xff, 0xcf, 0x5c]

function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return (~c) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

function png(size, dotRatio) {
  const raw = Buffer.alloc((size * 3 + 1) * size)
  const cx = size / 2
  const cy = size / 2
  const r = size * dotRatio
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 3 + 1)
    raw[rowStart] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const inside = (x - cx) ** 2 + (y - cy) ** 2 <= r * r
      const [rr, gg, bb] = inside ? FG : BG
      const p = rowStart + 1 + x * 3
      raw[p] = rr; raw[p + 1] = gg; raw[p + 2] = bb
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // color type: truecolor
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

mkdirSync('public', { recursive: true })
writeFileSync('public/pwa-192.png', png(192, 0.32))
writeFileSync('public/pwa-512.png', png(512, 0.32))
writeFileSync('public/pwa-512-maskable.png', png(512, 0.24)) // smaller dot = safe area
writeFileSync('public/apple-touch-icon.png', png(180, 0.32))
console.log('wrote placeholder icons to public/')
