import { useEffect, useRef, useState } from 'react'
import { NumberPad } from '../components/NumberPad'
import type { AnswerRecord, Problem } from '../math/types'

interface PracticeProps {
  problems: Problem[]
  onFinish: (records: AnswerRecord[], bestStreak: number) => void
  onQuit: () => void
}

type Feedback = 'idle' | 'correct' | 'wrong'

export function Practice({ problems, onFinish, onQuit }: PracticeProps) {
  const [index, setIndex] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const startedAt = useRef(Date.now())
  const advancing = useRef(false)

  const problem = problems[index]
  const progress = ((index + (feedback === 'idle' ? 0 : 1)) / problems.length) * 100

  useEffect(() => {
    startedAt.current = Date.now()
  }, [index])

  const submit = () => {
    if (!problem || input.length === 0 || advancing.current || feedback !== 'idle') return
    const given = Number(input)
    const correct = given === problem.answer
    const record: AnswerRecord = {
      problem,
      given,
      correct,
      ms: Date.now() - startedAt.current,
    }
    const nextRecords = [...records, record]
    const nextStreak = correct ? streak + 1 : 0
    const nextBest = Math.max(bestStreak, nextStreak)

    setRecords(nextRecords)
    setStreak(nextStreak)
    setBestStreak(nextBest)
    setFeedback(correct ? 'correct' : 'wrong')
    advancing.current = true

    window.setTimeout(() => {
      if (index + 1 >= problems.length) {
        onFinish(nextRecords, nextBest)
        return
      }
      setIndex((i) => i + 1)
      setInput('')
      setFeedback('idle')
      advancing.current = false
    }, correct ? 650 : 900)
  }

  if (!problem) return null

  return (
    <section className="screen practice">
      <header className="topbar">
        <button type="button" className="btn btn--ghost" onClick={onQuit}>
          Ende
        </button>
        <p className="brand brand--sm">MatheLand</p>
        <p className="practice__streak" aria-live="polite">
          Serie {streak}
        </p>
      </header>

      <div className="practice__meter" aria-hidden="true">
        <div className="practice__meter-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="practice__stage">
        <p className="practice__count">
          Aufgabe {index + 1} von {problems.length}
        </p>
        <div
          className={
            feedback === 'correct'
              ? 'problem problem--correct'
              : feedback === 'wrong'
                ? 'problem problem--wrong'
                : 'problem'
          }
        >
          <p className="problem__prompt">{problem.prompt}</p>
          <p className="problem__answer" aria-live="polite">
            {input || ' '}
          </p>
          {feedback === 'wrong' && (
            <p className="problem__hint">Richtig wäre {problem.answer}</p>
          )}
          {feedback === 'correct' && <p className="problem__hint">Super!</p>}
        </div>
      </div>

      <NumberPad
        value={input}
        onChange={setInput}
        onSubmit={submit}
        disabled={feedback !== 'idle'}
      />
    </section>
  )
}
