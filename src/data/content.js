import images from './images.json'

// Figures are drawn from published sources named in each `cite` line.
// Images are placeholder reconstructions and will be swapped later.

const set = (name, widths, ext) => widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`).join(', ')

// Everything a <picture> needs, plus a tiny inline preview for the ASCII layer.
export const img = (id, name = `specimen-${id}`) => {
  const meta = images[id]
  return {
    avif: set(name, meta.widths, 'avif'),
    webp: set(name, meta.widths, 'webp'),
    src: `/img/${name}-${meta.widths[Math.min(2, meta.widths.length - 1)]}.webp`,
    width: meta.width,
    height: meta.height,
    preview: meta.preview,
  }
}

export const HERO = {
  image: 7,
  alt: 'Biomechanical Tyrannosaurus rex roaring against a teal night sky, one eye glowing amber.',
  title: ['T-REX:', 'ENGINEERED', 'BY', 'EVOLUTION'],
  sub: 'Built from bone, muscle, instinct and time.',
}

export const STATEMENT = {
  text: 'For sixty-six million years the ground kept its secret. Then the rock gave back a skull five feet long.',
  note: 'Follow the tracks. Each set leads to something the excavation found.',
}

export const DISCOVERY = {
  image: 2,
  numeral: 'I',
  title: 'Found in Hell Creek',
  body: 'In 1902 Barnum Brown, collecting for the American Museum of Natural History, dug a partial skeleton out of the Montana badlands. Three years later Henry Fairfield Osborn gave it a name: Tyrannosaurus rex, tyrant lizard king.',
  facts: [
    ['First skeleton', '1902, Montana'],
    ['Named', '1905, H. F. Osborn'],
    ['Rock', 'Hell Creek Formation'],
  ],
  cite: 'Holotype CM 9380, formerly AMNH 973',
  alt: 'Biomechanical Tyrannosaurus rex head facing right against a teal night sky.',
}

export const SENSES = {
  image: 1,
  eye: [0.48, 0.18],
  numeral: 'II',
  title: 'Eyes Forward',
  blocks: [
    { figure: '55°', label: 'Binocular field', text: 'Its eyes faced partly forward, giving T. rex a binocular field of about 55 degrees, wider than a modern hawk.' },
    { figure: 'Scent', label: 'Olfactory bulbs', text: 'Oversized olfactory bulbs point to a sense of smell among the sharpest of any dinosaur studied.' },
    { figure: 'Low Hz', label: 'Hearing', text: 'A long cochlea suggests hearing tuned to deep, low-frequency sound.' },
  ],
  cite: 'After Stevens 2006, Witmer and Ridgely 2009, Zelenitsky et al. 2009',
  alt: 'Pixel-dithered Tyrannosaurus rex roaring through a misty forest, its eye in focus.',
}

export const BITE = {
  image: 4,
  numeral: 'III',
  title: 'The Bite',
  figure: '35,000 N',
  body: 'Estimated force at the back teeth, the strongest of any known land animal. Some models reach 57,000 newtons.',
  detail: 'Its teeth were thick, serrated spikes made to crush bone, not slice flesh.',
  cite: 'After Bates and Falkingham 2012',
  alt: 'Armoured T. rex head facing right, jaws wide open with light inside the mouth.',
}

export const MEASURES = {
  title: 'The Measure of Sue',
  body: 'Found in 1990 near Faith, South Dakota, by Sue Hendrickson, specimen FMNH PR 2081 is one of the largest and most complete T. rex skeletons ever excavated.',
  lead: { value: 12.3, decimals: 1, unit: 'm', label: 'Nose to tail' },
  figures: [
    { value: 4, decimals: 0, unit: 'm', label: 'Tall at the hips' },
    { value: 1.5, decimals: 1, unit: 'm', label: 'Length of the skull' },
    { value: 90, decimals: 0, unit: '%', label: 'Of the skeleton recovered, by bulk' },
  ],
  scale: { max: 13, sue: 12.3, person: 1.8 },
  cite: 'Figures from the Field Museum, Chicago',
}

export const ANATOMY = {
  image: 5,
  word: 'Balance',
  numeral: 'IV',
  title: 'Built to Balance',
  body: 'A massive skull was balanced by a long, heavy tail, the whole body pivoting over the hips. The arms were short, about a meter long, yet strongly muscled. Air sacs reached into its bones, the same system birds use today.',
  facts: [
    ['Length', 'Up to 12 to 13 m'],
    ['Mass', 'Roughly 8 to 9 t'],
    ['Arms', 'About 1 m, two fingers'],
  ],
  cite: 'Mass estimates vary widely between studies',
  alt: 'Full-body mechanical T. rex facing left, its chest opened to show internal structure.',
}

export const CLOSING = {
  image: 6,
  title: 'The Line Never Ended',
  body: 'Some eighty million years before T. rex, Allosaurus hunted the floodplains of the Late Jurassic. Both were theropods, the two-legged branch of dinosaurs that never fully disappeared.',
  kicker: 'Every bird you have ever seen is a theropod.',
  cite: 'Allosaurus fragilis, Morrison Formation, 155 to 145 million years ago',
  alt: 'Pixel-dithered Allosaurus standing in profile against a stormy sky.',
  action: 'Return to the surface',
}

// Geological eras the intro counts through (ICS boundaries, million years ago).
export const ERAS = [
  [161.5, 'Late Jurassic'],
  [145, 'Early Cretaceous'],
  [100.5, 'Late Cretaceous'],
  [66, 'Paleogene'],
  [23, 'Neogene'],
  [2.58, 'Quaternary'],
  [0.5, 'Today'],
]
export const eraOf = (m) => {
  let name = ERAS[0][1]
  for (const [start, label] of ERAS) if (m < start) name = label
  return m < 0.5 ? 'Today' : name
}
