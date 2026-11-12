import { LEVEL_LABELS, OPERATION_LABELS } from '../math/generate'
import type { Level, Operation } from '../math/types'

interface SetupProps {
  operation: Operation
  level: Level
  count: number
  onOperation: (op: Operation) => void
  onLevel: (level: Level) => void
  onCount: (count: number) => void
  onBack: () => void
  onStart: () => void
}

const ops: Operation[] = ['add', 'sub', 'mul', 'div', 'mix']
const levels: Level[] = [1, 2, 3, 4]
const counts = [5, 10, 15]

export function Setup({
  operation,
  level,
  count,
  onOperation,
  onLevel,
  onCount,
  onBack,
  onStart,
}: SetupProps) {
  return (
    <section className="screen setup">
      <header className="topbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Zurück
        </button>
        <p className="brand brand--sm">MatheLand</p>
        <span className="topbar__spacer" />
      </header>

      <div className="setup__body">
        <h1 className="section-title">Deine Runde</h1>
        <p className="section-lede">Wähle Rechenart, Klasse und wie viele Aufgaben.</p>

        <div className="setup__block">
          <h2 className="setup__label">Rechenart</h2>
          <div className="chip-row" role="radiogroup" aria-label="Rechenart">
            {ops.map((op) => (
              <button
                key={op}
                type="button"
                role="radio"
                aria-checked={operation === op}
                className={operation === op ? 'chip chip--active' : 'chip'}
                onClick={() => onOperation(op)}
              >
                {OPERATION_LABELS[op]}
              </button>
            ))}
          </div>
        </div>

        <div className="setup__block">
          <h2 className="setup__label">Klasse</h2>
          <div className="level-grid" role="radiogroup" aria-label="Klasse">
            {levels.map((lv) => (
              <button
                key={lv}
                type="button"
                role="radio"
                aria-checked={level === lv}
                className={level === lv ? 'level level--active' : 'level'}
                onClick={() => onLevel(lv)}
              >
                <span className="level__title">{LEVEL_LABELS[lv].title}</span>
                <span className="level__hint">{LEVEL_LABELS[lv].hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setup__block">
          <h2 className="setup__label">Aufgaben</h2>
          <div className="chip-row" role="radiogroup" aria-label="Anzahl">
            {counts.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={count === n}
                className={count === n ? 'chip chip--active' : 'chip'}
                onClick={() => onCount(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn btn--primary setup__go" onClick={onStart}>
          Übung starten
        </button>
      </div>
    </section>
  )
}
