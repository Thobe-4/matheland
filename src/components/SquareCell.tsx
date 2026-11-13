export type SquareTone = 'light' | 'blue'

interface SquareCellProps {
  numbers: number[]
  answer: number | null
  tone: SquareTone
  active: boolean
  flash: 'idle' | 'correct' | 'wrong'
  disabled: boolean
  onPick: (value: number) => void
  onSelect: () => void
}

export function SquareCell({
  numbers,
  answer,
  tone,
  active,
  flash,
  disabled,
  onPick,
  onSelect,
}: SquareCellProps) {
  const solved = answer !== null
  const state =
    solved
      ? 'k-square--solved'
      : active
        ? `k-square--active${flash !== 'idle' ? ` k-square--${flash}` : ''}`
        : ''

  return (
    <div
      className={`k-square k-square--${tone} ${state}`.trim()}
      onClick={onSelect}
    >
      {solved ? (
        <span className="k-square__answer" aria-label={`Lösung ${answer}`}>
          {answer}
        </span>
      ) : (
        <div className="k-square__grid">
          {numbers.map((n, i) => (
            <button
              key={`${i}-${n}`}
              type="button"
              className="k-square__num"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                onPick(n)
              }}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
