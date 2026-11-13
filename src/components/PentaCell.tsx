/** Regular pentagon helpers (point-up, SVG y-down). */

function verts(cx: number, cy: number, r: number): [number, number][] {
  return Array.from({ length: 5 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number]
  })
}

function poly(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ')
}

const CX = 50
const CY = 50
const OUTER_R = 48
const INNER_R = 17.5
const outer = verts(CX, CY, OUTER_R)
const inner = verts(CX, CY, INNER_R)
const outerPoly = poly(outer)
const innerPoly = poly(inner)

/** Centroids of the five trapezoid segments (between outer & inner edges). */
const segmentCenters = outer.map((_, i) => {
  const j = (i + 1) % 5
  const [ox1, oy1] = outer[i]
  const [ox2, oy2] = outer[j]
  const [ix1, iy1] = inner[i]
  const [ix2, iy2] = inner[j]
  return {
    x: (ox1 + ox2 + ix1 + ix2) / 4,
    y: (oy1 + oy2 + iy1 + iy2) / 4,
  }
})

const spokes = outer
  .map(([ox, oy], i) => {
    const [ix, iy] = inner[i]
    return `M ${ox.toFixed(2)} ${oy.toFixed(2)} L ${ix.toFixed(2)} ${iy.toFixed(2)}`
  })
  .join(' ')

interface PentaCellProps {
  numbers: number[]
  answer: number | null
  active: boolean
  flash: 'idle' | 'correct' | 'wrong'
  disabled: boolean
  onPick: (value: number) => void
  onSelect: () => void
}

export function PentaCell({
  numbers,
  answer,
  active,
  flash,
  disabled,
  onPick,
  onSelect,
}: PentaCellProps) {
  const solved = answer !== null
  const state =
    solved
      ? 'k-penta--solved'
      : active
        ? `k-penta--active${flash !== 'idle' ? ` k-penta--${flash}` : ''}`
        : ''

  return (
    <div className={`k-penta ${state}`.trim()} onClick={onSelect}>
      <svg className="k-penta__svg" viewBox="0 0 100 100" aria-hidden="true">
        <polygon className="k-penta__face" points={outerPoly} />
        <path className="k-penta__spokes" d={spokes} />
        <polygon className="k-penta__core" points={innerPoly} />
      </svg>

      {!solved &&
        numbers.map((n, i) => {
          const c = segmentCenters[i]
          return (
            <button
              key={`${i}-${n}`}
              type="button"
              className="k-penta__num"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                onPick(n)
              }}
            >
              {n}
            </button>
          )
        })}

      {solved && (
        <span className="k-penta__answer" aria-label={`Lösung ${answer}`}>
          {answer}
        </span>
      )}
    </div>
  )
}
