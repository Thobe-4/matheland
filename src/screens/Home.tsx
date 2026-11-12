import type { ProgressStats } from '../math/types'

interface HomeProps {
  progress: ProgressStats
  onPractice: () => void
  onKakooma: () => void
  onHighscores: () => void
}

export function Home({ progress, onPractice, onKakooma, onHighscores }: HomeProps) {
  const accuracy =
    progress.totalSolved === 0
      ? null
      : Math.round((progress.totalCorrect / progress.totalSolved) * 100)

  return (
    <section className="screen home">
      <div className="home__sky" aria-hidden="true">
        <span className="home__orb home__orb--a" />
        <span className="home__orb home__orb--b" />
        <span className="home__hill home__hill--back" />
        <span className="home__hill home__hill--front" />
      </div>

      <div className="home__content">
        <p className="brand">MatheLand</p>
        <h1 className="home__headline">Zahlen entdecken. Sicher rechnen.</h1>
        <p className="home__lede">
          Kurze Übungen und Kakooma-Rätsel – gemacht für kleine Finger auf dem iPad.
        </p>

        <div className="home__cta">
          <button type="button" className="btn btn--primary" onClick={onPractice}>
            Losrechnen
          </button>
          <button type="button" className="btn btn--secondary" onClick={onKakooma}>
            Kakooma
          </button>
          <button type="button" className="btn btn--ghost" onClick={onHighscores}>
            Highscore
          </button>
        </div>

        {progress.totalSolved > 0 && (
          <p className="home__stats" aria-live="polite">
            {progress.totalCorrect} richtig · Beste Serie {progress.bestStreak}
            {accuracy !== null ? ` · ${accuracy}%` : ''}
            {progress.kakoomaSolved > 0
              ? ` · Kakooma ${progress.kakoomaCorrect}/${progress.kakoomaSolved}`
              : ''}
          </p>
        )}
      </div>
    </section>
  )
}
