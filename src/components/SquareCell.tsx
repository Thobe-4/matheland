export type SquareTone = 'light' | 'blue'

interface SquareCellProps {
  numbers: number[]
  answer: number | null
  /** 2 = 4er-Feld (2×2), 3 = 9er-Feld (3×3) */
  cols: 2 | 3
  tone: SquareTone
  active: boolean
  flash: 'idle' | 'correct' | 'wrong'
  disabled: boolean
  /** Wenn gesetzt: gelöste Zahl ist antipptbar (Finale) */
  onAnswerClick?: (value: number) => void
  onPick: (value: number) => void
  onSelect: () => void
}

export function SquareCell({
  numbers,
  answer,
  cols,
  tone,
  active,
  flash,
  disabled,
  onAnswerClick,
  onPick,
  onSelect,
}: SquareCellProps) {
  const solved = answer !== null
  const state =
    solved
      ? `k-square--solved${flash !== 'idle' ? ` k-square--${flash}` : ''}`
      : active
        ? `k-square--active${flash !== 'idle' ? ` k-square--${flash}` : ''}`
        : ''

  return (
    <div
      className={`k-square k-square--${tone} k-square--cols${cols} ${state}`.trim()}
      onClick={onSelect}
    >
      {solved ? (
        <button
          type="button"
          className="k-square__answer"
          aria-label={`Lösung ${answer}`}
          disabled={disabled || !onAnswerClick}
          onClick={(e) => {
            e.stopPropagation()
            if (onAnswerClick && answer !== null) onAnswerClick(answer)
          }}
        >
          {answer}
        </button>
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
