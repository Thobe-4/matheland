import type { HighscoreEntry, KakoomaKind, Level } from '../math/types'

const KEY = 'matheland-kakooma-highscores-v1'
export const HIGHSCORE_LIMIT = 15

export function loadHighscores(): HighscoreEntry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HighscoreEntry[]
    return Array.isArray(parsed)
      ? parsed.sort((a, b) => b.score - a.score).slice(0, HIGHSCORE_LIMIT)
      : []
  } catch {
    return []
  }
}

function saveHighscores(entries: HighscoreEntry[]): void {
  localStorage.setItem(
    KEY,
    JSON.stringify(entries.sort((a, b) => b.score - a.score).slice(0, HIGHSCORE_LIMIT)),
  )
}

export function qualifiesForHighscore(score: number): boolean {
  const list = loadHighscores()
  if (list.length < HIGHSCORE_LIMIT) return true
  return score > list[list.length - 1].score
}

export function submitHighscore(input: {
  name: string
  score: number
  kind: KakoomaKind
  level: Level
  fieldCount: number
  timeMs: number
  mistakes: number
}): HighscoreEntry[] {
  const name = input.name.trim().slice(0, 16) || 'Spieler'
  const entry: HighscoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    score: input.score,
    kind: input.kind,
    level: input.level,
    fieldCount: input.fieldCount,
    timeMs: input.timeMs,
    mistakes: input.mistakes,
    date: new Date().toISOString(),
  }
  const next = [...loadHighscores(), entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, HIGHSCORE_LIMIT)
  saveHighscores(next)
  return next
}
