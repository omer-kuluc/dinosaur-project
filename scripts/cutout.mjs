// Separates the hero dinosaur from its smooth teal sky so the headline can
// sit between the sky and the head. Region-grows the sky from the image edges:
// the sky is a slow gradient, the dinosaur is outlined in dark ink, so growth
// stops at the outline. Output: an alpha mask PNG at source resolution.
import sharp from 'sharp'

export async function makeCutout(input, crop, outMask) {
  const { data, info } = await sharp(input).extract(crop).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]]
  const lum = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) lum[i] = 0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2]
  // local texture: max abs luminance diff to 4-neighbours
  const tex = new Float32Array(W * H)
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x, l = lum[i]
    tex[i] = Math.max(Math.abs(l - lum[i - 1]), Math.abs(l - lum[i + 1]), Math.abs(l - lum[i - W]), Math.abs(l - lum[i + W]))
  }
  const sky = new Uint8Array(W * H)
  const q = new Int32Array(W * H); let qh = 0, qt = 0
  const isSkyish = (i) => { const [r, g, b] = px(i); return tex[i] < 6 && g >= r - 2 && b >= r - 6 && lum[i] > 8 }
  const seed = (x, y) => { const i = y * W + x; if (!sky[i] && isSkyish(i)) { sky[i] = 1; q[qt++] = i } }
  for (let x = 0; x < W; x += 2) seed(x, 0)
  for (let y = 0; y < H; y += 2) { seed(0, y) }
  for (let x = 0; x < W * 0.45; x += 2) seed(x, H - 1)
  while (qh < qt) {
    const i = q[qh++], x = i % W, y = (i / W) | 0
    for (const j of [i - 1, i + 1, i - W, i + W]) {
      if (j < 0 || j >= W * H || sky[j]) continue
      const jx = j % W; if (Math.abs(jx - x) > 1) continue
      const [r1, g1, b1] = px(i), [r2, g2, b2] = px(j)
      if (Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2) > 14) continue
      if (!isSkyish(j)) continue
      sky[j] = 1; q[qt++] = j
    }
  }
  // Close pinholes: a foreground pixel mostly surrounded by sky becomes sky, and vice versa.
  for (let pass = 0; pass < 2; pass++) {
    const copy = sky.slice()
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      let s = 0
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) s += copy[(y + dy) * W + x + dx]
      const i = y * W + x
      if (s >= 21) sky[i] = 1; else if (s <= 4) sky[i] = 0
    }
  }
  const alpha = Buffer.alloc(W * H)
  for (let i = 0; i < W * H; i++) alpha[i] = sky[i] ? 0 : 255
  await sharp(alpha, { raw: { width: W, height: H, channels: 1 } }).blur(0.8).png().toFile(outMask)
  let s = 0; for (let i = 0; i < W * H; i++) s += sky[i]
  return { W, H, skyShare: s / (W * H) }
}

if (process.argv[1]?.endsWith('cutout.mjs') && process.argv[2]) {
  const r = await makeCutout(process.argv[2], JSON.parse(process.argv[3]), process.argv[4])
  console.log(r)
}
