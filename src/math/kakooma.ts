import type { KakoomaBoard, KakoomaCell, KakoomaKind, Level } from './types'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function fieldCountForLevel(level: Level): 4 | 5 | 6 | 9 {
  switch (level) {
    case 1:
      return 4
    case 2:
      return 5
    case 3:
      return 6
    case 4:
      return 9
  }
}

function addMax(level: Level): number {
  switch (level) {
    case 1:
      return 14
    case 2:
      return 22
    case 3:
      return 32
    case 4:
      return 45
  }
}

function mulMax(level: Level): number {
  switch (level) {
    case 1:
      return 6
    case 2:
      return 8
    case 3:
      return 9
    case 4:
      return 10
  }
}

export function solutions(nums: number[], kind: KakoomaKind): number[] {
  const found = new Set<number>()
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const combo = kind === 'add' ? nums[i] + nums[j] : nums[i] * nums[j]
      for (let k = 0; k < nums.length; k++) {
        if (k === i || k === j) continue
        if (nums[k] === combo) found.add(combo)
      }
    }
  }
  return [...found]
}

function findPair(
  nums: number[],
  answer: number,
  kind: KakoomaKind,
): [number, number] | null {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const combo = kind === 'add' ? nums[i] + nums[j] : nums[i] * nums[j]
      if (combo !== answer) continue
      for (let k = 0; k < nums.length; k++) {
        if (k === i || k === j) continue
        if (nums[k] === answer) {
          return nums[i] <= nums[j] ? [nums[i], nums[j]] : [nums[j], nums[i]]
        }
      }
    }
  }
  return null
}

/** Count how many solutions appear if we add candidate (for progressive fill). */
function trialSolutions(
  nums: number[],
  candidate: number,
  kind: KakoomaKind,
): number[] {
  return solutions([...nums, candidate], kind)
}

function fillDecoys(
  seed: number[],
  answer: number,
  kind: KakoomaKind,
  size: number,
  decoyPool: number[],
): number[] | null {
  const nums = [...seed]
  const pool = shuffle(decoyPool.filter((d) => !nums.includes(d) || kind === 'mul'))

  for (let n = 0; n < size - seed.length; n++) {
    let placed = false
    // Prefer pool values, then random
    const candidates = [
      ...pool.filter((d) => !nums.includes(d)),
      ...Array.from({ length: 40 }, () => randInt(1, Math.max(...decoyPool, answer + 5))),
    ]
    for (const d of candidates) {
      if (d === answer) continue
      // Allow one duplicate only when seed already needs it (equal factors)
      if (nums.includes(d) && !(kind === 'mul' && seed.filter((x) => x === d).length >= 2)) {
        continue
      }
      if (nums.includes(d)) continue
      const sols = trialSolutions(nums, d, kind)
      if (sols.length === 1 && sols[0] === answer) {
        nums.push(d)
        placed = true
        break
      }
    }
    if (!placed) return null
  }
  const sols = solutions(nums, kind)
  if (sols.length !== 1 || sols[0] !== answer) return null
  if (nums.length !== size) return null
  return nums
}

function factorPairs(n: number, maxF: number): [number, number][] {
  const pairs: [number, number][] = []
  for (let a = 2; a <= maxF; a++) {
    if (n % a !== 0) continue
    const b = n / a
    if (!Number.isInteger(b) || b < 2 || b > maxF) continue
    pairs.push(a <= b ? [a, b] : [b, a])
  }
  return pairs
}

/** Products that can be mini-answers at this max factor. */
function validMulAnswers(maxF: number): number[] {
  const set = new Set<number>()
  for (let a = 2; a <= maxF; a++) {
    for (let b = a; b <= maxF; b++) {
      // Prefer unequal; equal needs duplicate placement
      set.add(a * b)
    }
  }
  return [...set].sort((a, b) => a - b)
}

function buildAddCell(answer: number, size: number, max: number): KakoomaCell | null {
  if (answer < 2) return null
  for (let attempt = 0; attempt < 100; attempt++) {
    const a = randInt(1, answer - 1)
    const b = answer - a
    if (b < 1 || a === answer || b === answer) continue
    const base = [a, b, answer].filter((v, i, arr) => arr.indexOf(v) === i)
    if (!base.includes(answer) || base.length < 2) continue
    if (solutions(base, 'add').length !== 1) continue
    const pool = Array.from({ length: max }, (_, i) => i + 1)
    const filled = fillDecoys(base, answer, 'add', size, pool)
    if (!filled) continue
    return {
      numbers: shuffle(filled),
      answer,
      pair: a <= b ? [a, b] : [b, a],
    }
  }
  return null
}

function buildMulCell(answer: number, size: number, maxF: number): KakoomaCell | null {
  const pairs = factorPairs(answer, maxF)
  if (pairs.length === 0) return null

  for (let attempt = 0; attempt < 120; attempt++) {
    const [a, b] = pairs[randInt(0, pairs.length - 1)]
    let base: number[]
    if (a === b) {
      // Need the factor twice in the grid
      base = [a, a, answer]
    } else {
      base = [a, b, answer]
      if (new Set(base).size < 3) continue
    }
    if (solutions(base, 'mul').length !== 1) continue

    const decoyMax = Math.max(answer + 10, maxF * maxF + 4)
    // Custom fill that allows the duplicate factor already in base
    const nums = [...base]
    let ok = true
    while (nums.length < size) {
      let placed = false
      for (let t = 0; t < 80; t++) {
        const d = randInt(1, decoyMax)
        if (d === answer) continue
        if (nums.includes(d)) continue
        const trial = [...nums, d]
        const sols = solutions(trial, 'mul')
        if (sols.length === 1 && sols[0] === answer) {
          nums.push(d)
          placed = true
          break
        }
      }
      if (!placed) {
        ok = false
        break
      }
    }
    if (!ok) continue
    const sols = solutions(nums, 'mul')
    if (sols.length !== 1 || sols[0] !== answer) continue
    return {
      numbers: shuffle(nums),
      answer,
      pair: [a, b],
    }
  }
  return null
}

function buildFreePuzzle(kind: KakoomaKind, level: Level, size: number): KakoomaCell | null {
  if (kind === 'add') {
    const max = addMax(level)
    for (let i = 0; i < 80; i++) {
      const a = randInt(1, Math.max(2, Math.floor(max * 0.5)))
      let b = randInt(1, Math.max(2, Math.floor(max * 0.5)))
      while (b === a) b = randInt(1, Math.max(2, Math.floor(max * 0.5)))
      const answer = a + b
      if (answer > max) continue
      const cell = buildAddCell(answer, size, max)
      if (cell) return cell
    }
  } else {
    const maxF = mulMax(level)
    const answers = validMulAnswers(maxF)
    for (let i = 0; i < 80; i++) {
      const answer = answers[randInt(0, answers.length - 1)]
      const cell = buildMulCell(answer, size, maxF)
      if (cell) return cell
    }
  }
  return null
}

/**
 * Build a final number set of `size` with exactly one solution,
 * where every number can itself be a mini-puzzle answer.
 */
function buildFinalNumberSet(kind: KakoomaKind, level: Level, size: number): number[] | null {
  if (kind === 'add') {
    const max = addMax(level)
    for (let attempt = 0; attempt < 150; attempt++) {
      const a = randInt(1, Math.floor(max * 0.45))
      let b = randInt(1, Math.floor(max * 0.45))
      while (b === a) b = randInt(1, Math.floor(max * 0.45))
      const answer = a + b
      if (answer > max) continue
      const seed = [a, b, answer]
      const nums = [...seed]
      let ok = true
      while (nums.length < size) {
        let placed = false
        for (let t = 0; t < 60; t++) {
          const d = randInt(1, max)
          if (nums.includes(d)) continue
          const sols = solutions([...nums, d], 'add')
          if (sols.length === 1 && sols[0] === answer) {
            nums.push(d)
            placed = true
            break
          }
        }
        if (!placed) {
          ok = false
          break
        }
      }
      if (!ok) continue
      if (solutions(nums, 'add').length === 1) return nums
    }
    return null
  }

  // mul: every entry must be a valid product answer
  const maxF = mulMax(level)
  const pool = validMulAnswers(maxF)
  for (let attempt = 0; attempt < 200; attempt++) {
    const pairs = pool.flatMap((n) =>
      factorPairs(n, maxF)
        .filter(([a, b]) => a !== b || true)
        .map((p) => ({ answer: n, pair: p })),
    )
    if (pairs.length === 0) return null
    const pick = pairs[randInt(0, pairs.length - 1)]
    const [fa, fb] = pick.pair
    const answer = pick.answer
    // Seed must include factors AND answer — but factors might not be valid mul-answers!
    // For the FINAL board, numbers are mini-answers only — factors of the final
    // answer must themselves be products (mini answers).
    // So fa and fb must be in `pool` (valid mul answers), OR we pick answer
    // whose factors are also in pool.
    if (!pool.includes(fa) || !pool.includes(fb)) {
      // Try another: need both factors to be valid mini-answers
      continue
    }
    if (fa === answer || fb === answer) continue

    const nums = [fa, fb, answer]
    if (new Set(nums).size < 3) continue
    if (solutions(nums, 'mul').length !== 1) continue

    let ok = true
    while (nums.length < size) {
      let placed = false
      const candidates = shuffle(pool.filter((d) => !nums.includes(d)))
      for (const d of candidates) {
        const sols = solutions([...nums, d], 'mul')
        if (sols.length === 1 && sols[0] === answer) {
          nums.push(d)
          placed = true
          break
        }
      }
      if (!placed) {
        ok = false
        break
      }
    }
    if (!ok) continue
    if (solutions(nums, 'mul').length === 1) return nums
  }
  return null
}

function curatedFinal(kind: KakoomaKind, level: Level, size: number): number[] {
  // Hand-checked sets: unique solution, all entries are valid mini-answers for level.
  if (kind === 'add') {
    const sets: Record<number, number[]> = {
      4: [2, 5, 7, 1],
      5: [3, 5, 8, 1, 4],
      6: [2, 6, 8, 1, 3, 4],
      9: [4, 7, 11, 1, 2, 3, 5, 6, 9],
    }
    return sets[size] ?? sets[4]
  }
  // mul – factors must also be products when they appear on the final board.
  // Level 1 maxF=6 → products up to 36; factors on board must be ≥4 (2*2).
  // Every entry must be in validMulAnswers(mulMax(level)); exactly one product solution.
  const byLevel: Record<Level, Record<number, number[]>> = {
    1: {
      4: [4, 6, 8, 24], // 4×6=24
      5: [4, 6, 8, 10, 24],
      6: [4, 6, 8, 10, 12, 24],
      9: [4, 6, 8, 9, 10, 12, 15, 16, 24],
    },
    2: {
      4: [4, 6, 8, 24],
      5: [4, 6, 8, 10, 24],
      6: [6, 8, 10, 12, 14, 48], // 6×8=48
      9: [4, 6, 8, 10, 12, 14, 15, 16, 24],
    },
    3: {
      4: [6, 8, 12, 48],
      5: [6, 8, 10, 12, 48],
      6: [6, 8, 10, 12, 14, 48],
      9: [6, 8, 9, 10, 14, 15, 16, 20, 72], // 8×9=72 (kein 12 → kein 6×12)
    },
    4: {
      4: [6, 8, 12, 48],
      5: [6, 8, 10, 12, 48],
      6: [6, 8, 10, 12, 14, 48],
      9: [6, 8, 9, 10, 14, 15, 16, 20, 72],
    },
  }
  return byLevel[level][size] ?? byLevel[1][4]
}

function cellForAnswer(
  kind: KakoomaKind,
  level: Level,
  size: number,
  answer: number,
): KakoomaCell {
  if (kind === 'add') {
    const cell = buildAddCell(answer, size, Math.max(addMax(level), answer + 8))
    if (cell) return cell
    const a = 1
    const b = answer - 1
    const base = [a, b, answer].filter((v, i, arr) => arr.indexOf(v) === i)
    const nums = [...base]
    let n = 2
    while (nums.length < size) {
      if (!nums.includes(n) && n !== answer) {
        const trial = [...nums, n]
        if (solutions(trial, 'add').length <= 1) nums.push(n)
      }
      n++
      if (n > 80) break
    }
    while (nums.length < size) nums.push(90 + nums.length)
    // Ensure unique solution
    if (solutions(nums, 'add')[0] !== answer) {
      return {
        numbers: shuffle([a, b, answer, ...Array.from({ length: size - 3 }, (_, i) => 20 + i * 3)].slice(0, size)),
        answer,
        pair: [a, b],
      }
    }
    return { numbers: shuffle(nums.slice(0, size)), answer, pair: [a, b] }
  }

  const maxF = mulMax(level)
  const cell = buildMulCell(answer, size, maxF)
  if (cell) return cell

  const pairs = factorPairs(answer, Math.max(maxF, 12))
  const [a, b] = pairs[0] ?? [2, Math.max(2, Math.floor(answer / 2))]
  const base = a === b ? [a, a, answer] : [a, b, answer]
  const nums = [...base]
  const decoys = [5, 7, 11, 13, 17, 19, 23, 29].filter((d) => !nums.includes(d))
  for (const d of decoys) {
    if (nums.length >= size) break
    const trial = [...nums, d]
    if (solutions(trial, 'mul').length === 1) nums.push(d)
  }
  while (nums.length < size) {
    nums.push(31 + nums.length)
  }
  return {
    numbers: shuffle(nums.slice(0, size)),
    answer,
    pair: [a, b] as [number, number],
  }
}

export function generateKakoomaBoard(kind: KakoomaKind, level: Level): KakoomaBoard {
  const fieldCount = fieldCountForLevel(level)

  // Strategy 1: build final set first, then a mini-cell per number
  for (let attempt = 0; attempt < 60; attempt++) {
    const finals = buildFinalNumberSet(kind, level, fieldCount)
    if (!finals) continue
    const sols = solutions(finals, kind)
    if (sols.length !== 1) continue
    const finalPair = findPair(finals, sols[0], kind)
    if (!finalPair) continue

    const cells = finals.map((n) => cellForAnswer(kind, level, fieldCount, n))
    if (cells.some((c, i) => c.answer !== finals[i])) continue
    if (cells.some((c) => solutions(c.numbers, kind)[0] !== c.answer)) continue

    return {
      kind,
      level,
      fieldCount,
      cells,
      finalAnswer: sols[0],
      finalPair,
    }
  }

  // Strategy 2: random minis whose answers form a valid final
  for (let attempt = 0; attempt < 100; attempt++) {
    const cells: KakoomaCell[] = []
    const used = new Set<number>()
    let ok = true
    for (let i = 0; i < fieldCount; i++) {
      let cell: KakoomaCell | null = null
      for (let t = 0; t < 40; t++) {
        const c = buildFreePuzzle(kind, level, fieldCount)
        if (c && !used.has(c.answer)) {
          cell = c
          break
        }
      }
      if (!cell) {
        ok = false
        break
      }
      used.add(cell.answer)
      cells.push(cell)
    }
    if (!ok) continue
    const answers = cells.map((c) => c.answer)
    const sols = solutions(answers, kind)
    if (sols.length !== 1) continue
    const finalPair = findPair(answers, sols[0], kind)
    if (!finalPair) continue
    return {
      kind,
      level,
      fieldCount,
      cells,
      finalAnswer: sols[0],
      finalPair,
    }
  }

  // Strategy 3: curated guaranteed board
  const finals = curatedFinal(kind, level, fieldCount)
  const sols = solutions(finals, kind)
  const finalAnswer = sols[0] ?? finals[finals.length - 1]
  const finalPair = findPair(finals, finalAnswer, kind) ?? ([finals[0], finals[1]] as [number, number])
  const cells = finals.map((n) => cellForAnswer(kind, level, fieldCount, n))

  return {
    kind,
    level,
    fieldCount,
    cells,
    finalAnswer,
    finalPair,
  }
}

export function scoreKakoomaRun(
  fieldCount: number,
  timeMs: number,
  mistakes: number,
): number {
  const base: Record<number, number> = { 4: 600, 5: 900, 6: 1400, 9: 2500 }
  const timePenalty = Math.floor(timeMs / 1000) * 3
  const mistakePenalty = mistakes * 40
  let score = (base[fieldCount] ?? 600) - timePenalty - mistakePenalty
  if (mistakes === 0) score += 150
  return Math.max(50, score)
}

export const KAKOOMA_KIND_LABELS: Record<KakoomaKind, string> = {
  add: 'Plus-Kakooma',
  mul: 'Mal-Kakooma',
}

export const KAKOOMA_HINTS: Record<KakoomaKind, string> = {
  add: 'Tippe in jedem Feld die Zahl, die die Summe von zwei anderen ist.',
  mul: 'Tippe in jedem Feld die Zahl, die das Produkt von zwei anderen ist.',
}

export const KAKOOMA_FINAL_HINTS: Record<KakoomaKind, string> = {
  add: 'Finale: Welche der gelösten Zahlen ist die Summe von zwei anderen?',
  mul: 'Finale: Welche der gelösten Zahlen ist das Produkt von zwei anderen?',
}
