export type Operation = 'add' | 'sub' | 'mul' | 'div' | 'mix'

export type Level = 1 | 2 | 3 | 4

export type KakoomaKind = 'add' | 'mul'

export type Screen =
  | 'home'
  | 'setup'
  | 'practice'
  | 'kakooma-setup'
  | 'kakooma'
  | 'results'
  | 'highscores'

export interface Problem {
  a: number
  b: number
  operation: Exclude<Operation, 'mix'>
  answer: number
  prompt: string
}

export interface AnswerRecord {
  problem: Problem
  given: number
  correct: boolean
  ms: number
}

export interface KakoomaCell {
  numbers: number[]
  answer: number
  pair: [number, number]
}

export interface KakoomaBoard {
  kind: KakoomaKind
  level: Level
  fieldCount: 4 | 5 | 6 | 9
  cells: KakoomaCell[]
  finalAnswer: number
  finalPair: [number, number]
}

export interface KakoomaRunResult {
  board: KakoomaBoard
  timeMs: number
  mistakes: number
  score: number
  perfect: boolean
}

export interface HighscoreEntry {
  id: string
  name: string
  score: number
  kind: KakoomaKind
  level: Level
  fieldCount: number
  timeMs: number
  mistakes: number
  date: string
}

export interface ProgressStats {
  totalSolved: number
  totalCorrect: number
  bestStreak: number
  kakoomaSolved: number
  kakoomaCorrect: number
  byOperation: Record<Exclude<Operation, 'mix'>, { solved: number; correct: number }>
  lastPlayed: string | null
}
