// Pixel art drawn from bitmaps: each "#" becomes one square in an SVG path,
// rendered with crispEdges so it stays pixel-sharp at any size.

const toPath = (rows, dy = 0) =>
  rows
    .flatMap((row, y) => [...row].map((c, x) => (c === '#' ? `M${x} ${y + dy}h1v1h-1z` : '')))
    .join('')

const REX_BODY = [
  '..........########',
  '..........#.######',
  '..........########',
  '..........########',
  '..........#####...',
  '..........#######.',
  '#........#####....',
  '#.......########..',
  '##.....######..#..',
  '###...#######.....',
  '############......',
  '.##########.......',
  '..########........',
  '...######.........',
]
const REX_LEGS = {
  stand: ['....##.##.........', '....#...#.........', '....##..##........'],
  run1: ['....##.##.........', '....#...##........', '....##............'],
  run2: ['....##.##.........', '.....##.#.........', '........##........'],
}

const BODY_D = toPath(REX_BODY)
const LEG_D = Object.fromEntries(Object.entries(REX_LEGS).map(([k, rows]) => [k, toPath(rows, REX_BODY.length)]))

export function PixelRex({ className = '' }) {
  return (
    <svg className={`rex ${className}`} viewBox="0 0 18 17" shapeRendering="crispEdges" data-pose="stand" aria-hidden="true">
      <path className="rex__body" d={BODY_D} />
      <rect className="rex__lid" x="11" y="1" width="1" height="1" />
      {Object.entries(LEG_D).map(([k, d]) => (
        <path key={k} className={`rex__legs rex__legs--${k}`} d={d} />
      ))}
    </svg>
  )
}

// Three-toed theropod track, toes pointing up (-y).
const PRINT = [
  '#...#...#',
  '#...#...#',
  '.#..#..#.',
  '.#.###.#.',
  '..#####..',
  '..#####..',
  '...###...',
  '...###...',
  '....#....',
]
export const PRINT_D = toPath(PRINT)
export const PRINT_SIZE = 9

// ASCII furniture.
export const BONES = [' .-.       .-.', '(   )=====(   )', " '-'       '-'", '    []-[]-[]-[]'].join('\n')

const CACTI = {
  tall: [
    '....##....',
    '....##....',
    '....##..#.',
    '.#..##..#.',
    '.#..##..#.',
    '.#..##..#.',
    '.#..#####.',
    '.#####....',
    '....##....',
    '....##....',
    '....##....',
    '....##....',
  ],
  short: ['..#..', '..#.#', '#.#.#', '#.###', '###..', '..#..', '..#..'],
}

export function Cactus({ kind = 'tall', className = '', style = {} }) {
  const rows = CACTI[kind]
  return (
    <svg className={`cactus ${className}`} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" aria-hidden="true" style={{ '--w': rows[0].length, '--h': rows.length, ...style }}>
      <path d={toPath(rows)} />
    </svg>
  )
}
