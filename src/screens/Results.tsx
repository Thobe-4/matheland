import { useState } from 'react'
import type { KakoomaRunResult } from '../math/types'
import { qualifiesForHighscore, submitHighscore } from '../storage/highscores'

interface ResultsProps {
  correct: number
  total: number
  bestStreak: number
  modeLabel: string
  kakoomaResult?: KakoomaRunResult | null
  onAgain: () => void
  onHome: () => void
  onHighscores: () => void
}

export function Results({
  correct,
  total,
  bestStreak,
  modeLabel,
  kakoomaResult,
  onAgain,
  onHome,
  onHighscores,
}: ResultsProps) {
  const ratio = total === 0 ? 0 : correct / total
  const stars = ratio >= 0.9 ? 3 : ratio >= 0.7 ? 2 : ratio >= 0.4 ? 1 : 0
  const canEnter =
    !!kakoomaResult && qualifiesForHighscore(kakoomaResult.score)

  const [name, setName] = useState('')
  const [saved, setSaved] = useState(false)

  const title =
    stars === 3
      ? 'Wahnsinn!'
      : stars === 2
        ? 'Stark gerechnet!'
        : stars === 1
          ? 'Guter Start!'
          : 'Weiter üben!'

  const save = () => {
    if (!kakoomaResult || saved) return
    submitHighscore({
      name,
      score: kakoomaResult.score,
      kind: kakoomaResult.board.kind,
      level: kakoomaResult.board.level,
      fieldCount: kakoomaResult.board.fieldCount,
      timeMs: kakoomaResult.timeMs,
      mistakes: kakoomaResult.mistakes,
    })
    setSaved(true)
  }

  return (
    <section className="screen results">
      <div className="results__panel">
        <p className="brand brand--sm">MatheLand</p>
        <p className="results__mode">{modeLabel}</p>
        <h1 className="section-title">{title}</h1>
        <div className="stars" aria-label={`${stars} von 3 Sternen`}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={i < stars ? 'star star--on' : 'star'}
              style={{ animationDelay: `${i * 120}ms` }}
            >
              ★
            </span>
          ))}
        </div>

        {kakoomaResult ? (
          <>
            <p className="results__score">{kakoomaResult.score} Punkte</p>
            <p className="results__meta">
              {kakoomaResult.board.fieldCount} Felder ·{' '}
              {Math.floor(kakoomaResult.timeMs / 1000)}s · {kakoomaResult.mistakes} Fehler
              {kakoomaResult.perfect ? ' · Perfekt!' : ''}
            </p>
          </>
        ) : (
          <>
            <p className="results__score">
              {correct} von {total} richtig
            </p>
            <p className="results__meta">Beste Serie in dieser Runde: {bestStreak}</p>
          </>
        )}

        {canEnter && !saved && (
          <div className="highscore__enter">
            <label className="highscore__label" htmlFor="hs-name">
              Highscore! Dein Name:
            </label>
            <div className="highscore__form">
              <input
                id="hs-name"
                className="highscore__input"
                maxLength={16}
                value={name}
                placeholder="Name"
                onChange={(e) => setName(e.target.value)}
              />
              <button type="button" className="btn btn--primary" onClick={save}>
                Speichern
              </button>
            </div>
          </div>
        )}
        {saved && <p className="problem__hint">In der Highscore-Liste gespeichert!</p>}

        <div className="results__actions">
          <button type="button" className="btn btn--primary" onClick={onAgain}>
            Nochmal
          </button>
          {kakoomaResult && (
            <button type="button" className="btn btn--secondary" onClick={onHighscores}>
              Highscore
            </button>
          )}
          <button type="button" className="btn btn--secondary" onClick={onHome}>
            Zur Startseite
          </button>
        </div>
      </div>
    </section>
  )
}
