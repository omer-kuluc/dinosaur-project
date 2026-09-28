import images from './images.json'

// Figures are drawn from published sources named in each `cite` line.
// Images are placeholder reconstructions and will be swapped later.

export const img = (id) => {
  const meta = images[id]
  return {
    src: `/img/specimen-${id}-${meta.widths[1]}.webp`,
    srcSet: meta.widths.map((w) => `/img/specimen-${id}-${w}.webp ${w}w`).join(', '),
    width: meta.width,
    height: meta.height,
  }
}

export const HERO = {
  image: 1,
  alt: 'Pixel-dithered Tyrannosaurus rex roaring through a misty forest.',
  meta: 'Late Cretaceous, 68 to 66 million years ago',
  lines: ['Tyrant', 'Lizard King'],
  sub: 'An after-hours walk through the bones, senses and bite of Tyrannosaurus rex, one of the last giants of the Cretaceous.',
}

export const INTRO = {
  statement: 'For sixty-six million years the ground kept its secret. Then the rock gave back a skull five feet long.',
  note: 'Follow the tracks. Each set leads to something the excavation found.',
}

export const EXHIBITS = [
  {
    id: 'discovery',
    image: 2,
    focus: [0.62, 0.4],
    side: 'left',
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
  },
  {
    id: 'senses',
    image: 3,
    focus: [0.3, 0.45],
    side: 'right',
    numeral: 'II',
    title: 'Eyes Forward',
    body: 'Its eyes faced partly forward, giving T. rex a binocular field of about 55 degrees, wider than a modern hawk. Oversized olfactory bulbs point to a sense of smell among the sharpest of any dinosaur studied.',
    facts: [
      ['Binocular field', 'About 55°'],
      ['Smell', 'Very large olfactory bulbs'],
      ['Hearing', 'Tuned to low frequencies'],
    ],
    cite: 'After Stevens 2006, Witmer and Ridgely 2009, Zelenitsky et al. 2009',
    alt: 'Mechanical T. rex head facing left, one eye glowing amber.',
  },
  {
    id: 'bite',
    image: 4,
    focus: [0.6, 0.4],
    side: 'left',
    numeral: 'III',
    title: 'The Bite',
    body: 'Models put the bite of an adult at 35,000 to 57,000 newtons at the back teeth, the strongest of any known land animal. Its teeth were thick, serrated spikes made to crush bone, not slice flesh.',
    facts: [
      ['Bite force', '35,000 to 57,000 N'],
      ['Teeth', 'About 50 to 60'],
      ['Largest tooth', 'About 30 cm with root'],
    ],
    cite: 'After Bates and Falkingham 2012',
    alt: 'Armoured T. rex head facing right, jaws open with light inside the mouth.',
  },
  {
    id: 'anatomy',
    image: 5,
    focus: [0.32, 0.4],
    side: 'right',
    numeral: 'IV',
    title: 'Built to Balance',
    body: 'A massive skull was balanced by a long, heavy tail, the whole body pivoting over the hips. The arms were short, about a meter long, yet strongly muscled. Air sacs reached into its bones, the same system birds use today.',
    facts: [
      ['Length', 'Up to 12 to 13 m'],
      ['Mass', 'Roughly 8 to 9 t'],
      ['Arms', 'About 1 m, two fingers'],
    ],
    cite: 'Mass estimates vary widely between studies',
    alt: 'Full-body mechanical T. rex facing left, its chest opened to show glowing internal structure.',
  },
]

export const MEASURES = {
  title: 'The Measure of Sue',
  body: 'Found in 1990 near Faith, South Dakota, by Sue Hendrickson, specimen FMNH PR 2081 is one of the largest and most complete T. rex skeletons ever excavated.',
  figures: [
    { value: 12.3, decimals: 1, unit: 'm', label: 'Nose to tail', size: 'xl' },
    { value: 4, decimals: 0, unit: 'm', label: 'Tall at the hips', size: 'md' },
    { value: 1.5, decimals: 1, unit: 'm', label: 'Length of the skull', size: 'md' },
    { value: 90, decimals: 0, unit: '%', label: 'Of the skeleton recovered, by bulk', size: 'lg' },
  ],
  scale: { max: 13, sue: 12.3, person: 1.8 },
  cite: 'Figures from the Field Museum, Chicago',
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
