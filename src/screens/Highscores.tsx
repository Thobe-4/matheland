import { KAKOOMA_KIND_LABELS } from '../math/kakooma'
import type { HighscoreEntry } from '../math/types'
import { HIGHSCORE_LIMIT } from '../storage/highscores'

interface HighscoresProps {
  entries: HighscoreEntry[]
  onBack: () => void
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const r = s % 60
  return m > 0 ? `${m}:${String(r).padStart(2, '0')}` : `${r}s`
}

export function Highscores({ entries, onBack }: HighscoresProps) {
  return (
    <section className="screen setup">
      <header className="topbar">
        <button type="button" className="btn btn--ghost" onClick={onBack}>
          Zurück
        </button>
        <p className="brand brand--sm">Highscore</p>
        <span className="topbar__spacer" />
      </header>

      <div className="setup__body">
        <h1 className="section-title">Top {HIGHSCORE_LIMIT}</h1>
        <p className="section-lede">Die besten Kakooma-Ergebnisse auf diesem Gerät.</p>

        {entries.length === 0 ? (
          <p className="highscore__empty">Noch keine Einträge – spiel eine Runde!</p>
        ) : (
          <ol className="highscore__list">
            {entries.map((e, i) => (
              <li key={e.id} className="highscore__row">
                <span className="highscore__rank">{i + 1}</span>
                <span className="highscore__name">{e.name}</span>
                <span className="highscore__pts">{e.score}</span>
                <span className="highscore__meta">
                  {KAKOOMA_KIND_LABELS[e.kind]} · {e.fieldCount} Felder · {formatTime(e.timeMs)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}
