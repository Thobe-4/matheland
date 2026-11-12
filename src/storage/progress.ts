import type {
  AnswerRecord,
  KakoomaRunResult,
  Operation,
  ProgressStats,
} from '../math/types'

const KEY = 'matheland-progress-v2'

const emptyOps = (): ProgressStats['byOperation'] => ({
  add: { solved: 0, correct: 0 },
  sub: { solved: 0, correct: 0 },
  mul: { solved: 0, correct: 0 },
  div: { solved: 0, correct: 0 },
})

export function defaultProgress(): ProgressStats {
  return {
    totalSolved: 0,
    totalCorrect: 0,
    bestStreak: 0,
    kakoomaSolved: 0,
    kakoomaCorrect: 0,
    byOperation: emptyOps(),
    lastPlayed: null,
  }
}

export function loadProgress(): ProgressStats {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultProgress()
    return { ...defaultProgress(), ...JSON.parse(raw) }
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(stats: ProgressStats): void {
  localStorage.setItem(KEY, JSON.stringify(stats))
}

export function applyRound(
  stats: ProgressStats,
  records: AnswerRecord[],
  streak: number,
): ProgressStats {
  const next = structuredClone(stats)
  for (const r of records) {
    const op = r.problem.operation as Exclude<Operation, 'mix'>
    next.totalSolved += 1
    next.byOperation[op].solved += 1
    if (r.correct) {
      next.totalCorrect += 1
      next.byOperation[op].correct += 1
    }
  }
  next.bestStreak = Math.max(next.bestStreak, streak)
  next.lastPlayed = new Date().toISOString()
  saveProgress(next)
  return next
}

export function applyKakoomaRun(
  stats: ProgressStats,
  result: KakoomaRunResult,
): ProgressStats {
  const next = structuredClone(stats)
  const cells = result.board.fieldCount + 1
  next.kakoomaSolved += cells
  next.totalSolved += cells
  const correctCells = cells - result.mistakes
  next.kakoomaCorrect += Math.max(0, correctCells)
  next.totalCorrect += Math.max(0, correctCells)
  if (result.perfect) {
    next.bestStreak = Math.max(next.bestStreak, cells)
  }
  next.lastPlayed = new Date().toISOString()
  saveProgress(next)
  return next
}
