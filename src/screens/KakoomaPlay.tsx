import { useRef, useState } from 'react'
import { HexCell } from '../components/HexCell'
import { PentaCell } from '../components/PentaCell'
import { SquareCell } from '../components/SquareCell'
import {
  KAKOOMA_FINAL_HINTS,
  KAKOOMA_HINTS,
  scoreKakoomaRun,
} from '../math/kakooma'
import type { KakoomaBoard, KakoomaRunResult } from '../math/types'

interface KakoomaPlayProps {
  board: KakoomaBoard
  onFinish: (result: KakoomaRunResult) => void
  onQuit: () => void
}

type Phase = 'cells' | 'final'
type Flash = 'idle' | 'correct' | 'wrong'

export function KakoomaPlay({ board, onFinish, onQuit }: KakoomaPlayProps) {
  const [solved, setSolved] = useState<(number | null)[]>(() => board.cells.map(() => null))
  const [activeCell, setActiveCell] = useState(0)
  const [phase, setPhase] = useState<Phase>('cells')
  const [flash, setFlash] = useState<Flash>('idle')
  const [flashCell, setFlashCell] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [lock, setLock] = useState(false)
  const startedAt = useRef(Date.now())

  const solvedCount = solved.filter((v) => v !== null).length
  const progress =
    phase === 'final'
      ? 92
      : (solvedCount / (board.fieldCount + 1)) * 100

  const pickCell = (cellIndex: number, value: number) => {
    if (lock || phase !== 'cells' || solved[cellIndex] !== null) return
    const cell = board.cells[cellIndex]
    const correct = value === cell.answer
    setActiveCell(cellIndex)
    setFlashCell(cellIndex)
    setLock(true)

    if (!correct) {
      setMistakes((m) => m + 1)
      setFlash('wrong')
      window.setTimeout(() => {
        setFlash('idle')
        setFlashCell(null)
        setLock(false)
      }, 700)
      return
    }

    setFlash('correct')
    const next = [...solved]
    next[cellIndex] = cell.answer
    setSolved(next)

    window.setTimeout(() => {
      setFlash('idle')
      setFlashCell(null)
      setLock(false)
      if (next.every((v) => v !== null)) {
        setPhase('final')
        setActiveCell(-1)
      } else {
        const nextOpen = next.findIndex((v) => v === null)
        if (nextOpen >= 0) setActiveCell(nextOpen)
      }
    }, 550)
  }

  const pickFinal = (cellIndex: number, value: number) => {
    if (lock || phase !== 'final') return
    const correct = value === board.finalAnswer
    setFlashCell(cellIndex)
    setLock(true)

    if (!correct) {
      setMistakes((m) => m + 1)
      setFlash('wrong')
      window.setTimeout(() => {
        setFlash('idle')
        setFlashCell(null)
        setLock(false)
      }, 800)
      return
    }

    setFlash('correct')
    const timeMs = Date.now() - startedAt.current
    const score = scoreKakoomaRun(board.fieldCount, timeMs, mistakes)
    window.setTimeout(() => {
      onFinish({
        board,
        timeMs,
        mistakes,
        score,
        perfect: mistakes === 0,
      })
    }, 650)
  }

  const op = board.kind === 'add' ? '+' : '×'
  const gridClass =
    board.fieldCount === 9
      ? 'kakooma-grid kakooma-grid--9'
      : board.fieldCount === 6
        ? 'kakooma-grid kakooma-grid--6'
        : board.fieldCount === 5
          ? 'kakooma-grid kakooma-grid--5'
          : 'kakooma-grid kakooma-grid--4'

  const cellFlash = (cellIndex: number): Flash =>
    flashCell === cellIndex ? flash : 'idle'

  return (
    <section className="screen kakooma">
      <header className="topbar">
        <button type="button" className="btn btn--ghost" onClick={onQuit}>
          Ende
        </button>
        <p className="brand brand--sm">Kakooma</p>
        <p className="practice__streak">
          {phase === 'final' ? 'Finale' : `${solvedCount}/${board.fieldCount}`}
        </p>
      </header>

      <div className="practice__meter" aria-hidden="true">
        <div className="practice__meter-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="kakooma__stage">
        <p className="kakooma__hint">
          {phase === 'final' ? KAKOOMA_FINAL_HINTS[board.kind] : KAKOOMA_HINTS[board.kind]}
        </p>

        <div className={gridClass}>
          {board.cells.map((cell, cellIndex) => {
            const done = solved[cellIndex]
            const isActive = phase === 'cells' && cellIndex === activeCell
            const flashHere = cellFlash(cellIndex)
            const answerClick =
              phase === 'final' && done !== null
                ? (value: number) => pickFinal(cellIndex, value)
                : undefined

            if (board.fieldCount === 5) {
              return (
                <PentaCell
                  key={cellIndex}
                  numbers={cell.numbers}
                  answer={done}
                  active={isActive}
                  flash={flashHere}
                  disabled={lock}
                  onAnswerClick={answerClick}
                  onPick={(value) => pickCell(cellIndex, value)}
                  onSelect={() =>
                    !lock && phase === 'cells' && solved[cellIndex] === null && setActiveCell(cellIndex)
                  }
                />
              )
            }

            if (board.fieldCount === 6) {
              return (
                <HexCell
                  key={cellIndex}
                  numbers={cell.numbers}
                  answer={done}
                  tone={cellIndex % 2 === 0 ? 'light' : 'blue'}
                  active={isActive}
                  flash={flashHere}
                  disabled={lock}
                  onAnswerClick={answerClick}
                  onPick={(value) => pickCell(cellIndex, value)}
                  onSelect={() =>
                    !lock && phase === 'cells' && solved[cellIndex] === null && setActiveCell(cellIndex)
                  }
                />
              )
            }

            if (board.fieldCount === 9 || board.fieldCount === 4) {
              const cols = board.fieldCount === 9 ? 3 : 2
              const row = Math.floor(cellIndex / cols)
              const col = cellIndex % cols
              const tone = (row + col) % 2 === 0 ? 'blue' : 'light'
              return (
                <SquareCell
                  key={cellIndex}
                  numbers={cell.numbers}
                  answer={done}
                  cols={cols}
                  tone={tone}
                  active={isActive}
                  flash={flashHere}
                  disabled={lock}
                  onAnswerClick={answerClick}
                  onPick={(value) => pickCell(cellIndex, value)}
                  onSelect={() =>
                    !lock && phase === 'cells' && solved[cellIndex] === null && setActiveCell(cellIndex)
                  }
                />
              )
            }

            return null
          })}
        </div>

        {flash === 'correct' && phase === 'cells' && activeCell >= 0 && (
          <p className="problem__hint">
            Super! {board.cells[activeCell].pair[0]} {op} {board.cells[activeCell].pair[1]} ={' '}
            {board.cells[activeCell].answer}
          </p>
        )}
        {flash === 'correct' && phase === 'final' && (
          <p className="problem__hint">
            Finale gelöst! {board.finalPair[0]} {op} {board.finalPair[1]} = {board.finalAnswer}
          </p>
        )}
        {flash === 'wrong' && <p className="problem__hint">Nicht ganz – nochmal tippen!</p>}
      </div>
    </section>
  )
}
