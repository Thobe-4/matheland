import { useMemo, useRef, useState } from 'react'
import { HexCell } from '../components/HexCell'
import { PentaCell } from '../components/PentaCell'
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
  const [mistakes, setMistakes] = useState(0)
  const [lock, setLock] = useState(false)
  const startedAt = useRef(Date.now())

  const solvedCount = solved.filter((v) => v !== null).length
  const progress =
    phase === 'final'
      ? 100
      : (solvedCount / (board.fieldCount + 1)) * 100

  const finalNumbers = useMemo(
    () => solved.map((v, i) => (v !== null ? v : board.cells[i].answer)),
    [solved, board.cells],
  )

  const pickCell = (cellIndex: number, value: number) => {
    if (lock || phase !== 'cells' || solved[cellIndex] !== null) return
    const cell = board.cells[cellIndex]
    const correct = value === cell.answer
    setActiveCell(cellIndex)
    setLock(true)

    if (!correct) {
      setMistakes((m) => m + 1)
      setFlash('wrong')
      window.setTimeout(() => {
        setFlash('idle')
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
      setLock(false)
      if (next.every((v) => v !== null)) {
        setPhase('final')
      } else {
        const nextOpen = next.findIndex((v) => v === null)
        if (nextOpen >= 0) setActiveCell(nextOpen)
      }
    }, 550)
  }

  const pickFinal = (value: number) => {
    if (lock || phase !== 'final') return
    const correct = value === board.finalAnswer
    setLock(true)

    if (!correct) {
      setMistakes((m) => m + 1)
      setFlash('wrong')
      window.setTimeout(() => {
        setFlash('idle')
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

        {phase === 'cells' && (
          <div className={gridClass}>
            {board.cells.map((cell, cellIndex) => {
              const done = solved[cellIndex]
              const isActive = cellIndex === activeCell

              if (board.fieldCount === 5) {
                return (
                  <PentaCell
                    key={cellIndex}
                    numbers={cell.numbers}
                    answer={done}
                    active={isActive}
                    flash={isActive ? flash : 'idle'}
                    disabled={lock}
                    onPick={(value) => pickCell(cellIndex, value)}
                    onSelect={() =>
                      !lock && solved[cellIndex] === null && setActiveCell(cellIndex)
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
                    flash={isActive ? flash : 'idle'}
                    disabled={lock}
                    onPick={(value) => pickCell(cellIndex, value)}
                    onSelect={() =>
                      !lock && solved[cellIndex] === null && setActiveCell(cellIndex)
                    }
                  />
                )
              }

              return (
                <div
                  key={cellIndex}
                  className={
                    done !== null
                      ? 'k-cell k-cell--solved'
                      : isActive
                        ? `k-cell k-cell--active${flash !== 'idle' ? ` k-cell--${flash}` : ''}`
                        : 'k-cell'
                  }
                >
                  {done !== null ? (
                    <span className="k-cell__answer">{done}</span>
                  ) : (
                    <div className="k-cell__bubbles">
                      {cell.numbers.map((n, i) => (
                        <button
                          key={`${cellIndex}-${i}-${n}`}
                          type="button"
                          className="bubble bubble--sm"
                          disabled={lock}
                          onClick={() => pickCell(cellIndex, n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    className="k-cell__tab"
                    onClick={() => !lock && solved[cellIndex] === null && setActiveCell(cellIndex)}
                    disabled={done !== null}
                  >
                    Feld {cellIndex + 1}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {phase === 'final' && (
          <div
            className={
              flash === 'correct'
                ? 'kakooma__board kakooma__board--correct'
                : flash === 'wrong'
                  ? 'kakooma__board kakooma__board--wrong'
                  : 'kakooma__board'
            }
          >
            {finalNumbers.map((n, i) => (
              <button
                key={`final-${i}-${n}`}
                type="button"
                className={
                  flash === 'correct' && n === board.finalAnswer
                    ? 'bubble bubble--answer'
                    : flash === 'wrong'
                      ? 'bubble'
                      : 'bubble'
                }
                disabled={lock}
                onClick={() => pickFinal(n)}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {flash === 'correct' && phase === 'cells' && (
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
