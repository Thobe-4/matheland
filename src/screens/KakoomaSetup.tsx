import { LEVEL_LABELS } from '../math/generate'
import { fieldCountForLevel, KAKOOMA_HINTS, KAKOOMA_KIND_LABELS } from '../math/kakooma'
import type { KakoomaKind, Level } from '../math/types'

interface KakoomaSetupProps {
  kind: KakoomaKind
  level: Level
  onKind: (kind: KakoomaKind) => void
  onLevel: (level: Level) => void
  onBack: () => void
  onStart: () => void
  onHighscores: () => void
}

const kinds: KakoomaKind[] = ['add', 'mul']
const levels: Level[] = [1, 2, 3, 4]

export function KakoomaSetup({
  kind,
  level,
  onKind,
  onLevel,
  onBack,
  onStart,
  onHighscores,
}: KakoomaSetupProps) {
  const fields = fieldCountForLevel(level)

  return (
    <section className="screen setup">
      <header className="topbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Zurück
        </button>
        <p className="brand brand--sm">MatheLand</p>
        <button type="button" className="btn btn--ghost topbar__right" onClick={onHighscores}>
          Highscore
        </button>
      </header>

      <div className="setup__body">
        <h1 className="section-title">Kakooma</h1>
        <p className="section-lede">
          {KAKOOMA_HINTS[kind]} Danach kommt ein Final-Rätsel aus allen Lösungen.
        </p>

        <div className="setup__block">
          <h2 className="setup__label">Art</h2>
          <div className="chip-row" role="radiogroup" aria-label="Kakooma-Art">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                className={kind === k ? 'chip chip--active' : 'chip'}
                onClick={() => onKind(k)}
              >
                {KAKOOMA_KIND_LABELS[k]}
              </button>
            ))}
          </div>
        </div>

        <div className="setup__block">
          <h2 className="setup__label">Schwierigkeit</h2>
          <div className="level-grid" role="radiogroup" aria-label="Schwierigkeit">
            {levels.map((lv) => {
              const n = fieldCountForLevel(lv)
              return (
                <button
                  key={lv}
                  type="button"
                  role="radio"
                  aria-checked={level === lv}
                  className={level === lv ? 'level level--active' : 'level'}
                  onClick={() => onLevel(lv)}
                >
                  <span className="level__title">{LEVEL_LABELS[lv].title}</span>
                  <span className="level__hint">{n} Felder à {n} Zahlen</span>
                </button>
              )
            })}
          </div>
        </div>

        <p className="setup__summary">
          Dieses Rätsel: <strong>{fields} Felder</strong> + 1 Finale
        </p>

        <button type="button" className="btn btn--primary setup__go" onClick={onStart}>
          Kakooma starten
        </button>
      </div>
    </section>
  )
}
