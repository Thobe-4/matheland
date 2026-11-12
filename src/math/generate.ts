import type { Level, Operation, Problem } from './types'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickOp(level: Level): Exclude<Operation, 'mix'> {
  const pool: Exclude<Operation, 'mix'>[] =
    level === 1
      ? ['add', 'sub']
      : level === 2
        ? ['add', 'sub', 'mul']
        : ['add', 'sub', 'mul', 'div']
  return pool[randInt(0, pool.length - 1)]
}

function symbol(op: Exclude<Operation, 'mix'>): string {
  switch (op) {
    case 'add':
      return '+'
    case 'sub':
      return '−'
    case 'mul':
      return '×'
    case 'div':
      return '÷'
  }
}

function ranges(level: Level) {
  switch (level) {
    case 1:
      return { addMax: 10, subMax: 10, mulMax: 5, divMax: 5 }
    case 2:
      return { addMax: 20, subMax: 20, mulMax: 5, divMax: 5 }
    case 3:
      return { addMax: 50, subMax: 50, mulMax: 10, divMax: 10 }
    case 4:
      return { addMax: 100, subMax: 100, mulMax: 12, divMax: 12 }
  }
}

export function generateProblem(operation: Operation, level: Level): Problem {
  const op = operation === 'mix' ? pickOp(level) : operation
  const r = ranges(level)

  if (op === 'add') {
    const answer = randInt(2, r.addMax)
    const a = randInt(1, answer - 1)
    const b = answer - a
    return { a, b, operation: op, answer, prompt: `${a} ${symbol(op)} ${b}` }
  }

  if (op === 'sub') {
    const a = randInt(2, r.subMax)
    const b = randInt(1, a)
    return { a, b, operation: op, answer: a - b, prompt: `${a} ${symbol(op)} ${b}` }
  }

  if (op === 'mul') {
    const a = randInt(1, r.mulMax)
    const b = randInt(1, r.mulMax)
    return { a, b, operation: op, answer: a * b, prompt: `${a} ${symbol(op)} ${b}` }
  }

  const b = randInt(1, r.divMax)
  const quotient = randInt(1, r.divMax)
  const a = b * quotient
  return { a, b, operation: op, answer: quotient, prompt: `${a} ${symbol(op)} ${b}` }
}

export function generateRound(
  operation: Operation,
  level: Level,
  count: number,
): Problem[] {
  return Array.from({ length: count }, () => generateProblem(operation, level))
}

export const OPERATION_LABELS: Record<Operation, string> = {
  add: 'Plus',
  sub: 'Minus',
  mul: 'Mal',
  div: 'Geteilt',
  mix: 'Gemischt',
}

export const LEVEL_LABELS: Record<Level, { title: string; hint: string }> = {
  1: { title: 'Klasse 1', hint: 'Zahlen bis 10' },
  2: { title: 'Klasse 2', hint: 'Bis 20 & kleines Einmaleins' },
  3: { title: 'Klasse 3', hint: 'Bis 50 & Einmaleins' },
  4: { title: 'Klasse 4', hint: 'Bis 100 & großes Einmaleins' },
}
