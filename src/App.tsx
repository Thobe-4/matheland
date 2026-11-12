import { useMemo, useState } from 'react'
import { generateRound } from './math/generate'
import { generateKakoomaBoard } from './math/kakooma'
import type {
  AnswerRecord,
  KakoomaKind,
  KakoomaRunResult,
  Level,
  Operation,
  Screen,
} from './math/types'
import { Home } from './screens/Home'
import { Highscores } from './screens/Highscores'
import { KakoomaPlay } from './screens/KakoomaPlay'
import { KakoomaSetup } from './screens/KakoomaSetup'
import { Practice } from './screens/Practice'
import { Results } from './screens/Results'
import { Setup } from './screens/Setup'
import { loadHighscores } from './storage/highscores'
import {
  applyKakoomaRun,
  applyRound,
  loadProgress,
} from './storage/progress'
import './App.css'

type ResultMode = 'practice' | 'kakooma'

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [operation, setOperation] = useState<Operation>('mix')
  const [level, setLevel] = useState<Level>(2)
  const [count, setCount] = useState(10)
  const [kakoomaKind, setKakoomaKind] = useState<KakoomaKind>('add')
  const [kakoomaLevel, setKakoomaLevel] = useState<Level>(2)
  const [seed, setSeed] = useState(0)
  const [kSeed, setKSeed] = useState(0)
  const [resultMode, setResultMode] = useState<ResultMode>('practice')
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [roundStreak, setRoundStreak] = useState(0)
  const [kakoomaResult, setKakoomaResult] = useState<KakoomaRunResult | null>(null)
  const [progress, setProgress] = useState(() => loadProgress())
  const [highscores, setHighscores] = useState(() => loadHighscores())

  const problems = useMemo(
    () => generateRound(operation, level, count),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operation, level, count, seed],
  )

  const kakoomaBoard = useMemo(
    () => generateKakoomaBoard(kakoomaKind, kakoomaLevel),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kakoomaKind, kakoomaLevel, kSeed],
  )

  const finishPractice = (records: AnswerRecord[], best: number) => {
    setCorrectCount(records.filter((r) => r.correct).length)
    setTotalCount(records.length)
    setRoundStreak(best)
    setKakoomaResult(null)
    setResultMode('practice')
    setProgress(applyRound(progress, records, best))
    setScreen('results')
  }

  const finishKakooma = (result: KakoomaRunResult) => {
    setCorrectCount(result.perfect ? 1 : 0)
    setTotalCount(1)
    setRoundStreak(result.perfect ? 1 : 0)
    setKakoomaResult(result)
    setResultMode('kakooma')
    setProgress(applyKakoomaRun(progress, result))
    setScreen('results')
  }

  const startPractice = () => {
    setSeed((s) => s + 1)
    setScreen('practice')
  }

  const startKakooma = () => {
    setKSeed((s) => s + 1)
    setScreen('kakooma')
  }

  const openHighscores = () => {
    setHighscores(loadHighscores())
    setScreen('highscores')
  }

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <Home
          progress={progress}
          onPractice={() => setScreen('setup')}
          onKakooma={() => setScreen('kakooma-setup')}
          onHighscores={openHighscores}
        />
      )}
      {screen === 'setup' && (
        <Setup
          operation={operation}
          level={level}
          count={count}
          onOperation={setOperation}
          onLevel={setLevel}
          onCount={setCount}
          onBack={() => setScreen('home')}
          onStart={startPractice}
        />
      )}
      {screen === 'practice' && (
        <Practice
          key={seed}
          problems={problems}
          onFinish={finishPractice}
          onQuit={() => setScreen('setup')}
        />
      )}
      {screen === 'kakooma-setup' && (
        <KakoomaSetup
          kind={kakoomaKind}
          level={kakoomaLevel}
          onKind={setKakoomaKind}
          onLevel={setKakoomaLevel}
          onBack={() => setScreen('home')}
          onStart={startKakooma}
          onHighscores={openHighscores}
        />
      )}
      {screen === 'kakooma' && (
        <KakoomaPlay
          key={kSeed}
          board={kakoomaBoard}
          onFinish={finishKakooma}
          onQuit={() => setScreen('kakooma-setup')}
        />
      )}
      {screen === 'results' && (
        <Results
          correct={correctCount}
          total={totalCount}
          bestStreak={roundStreak}
          modeLabel={resultMode === 'kakooma' ? 'Kakooma' : 'Rechnen'}
          kakoomaResult={kakoomaResult}
          onAgain={resultMode === 'kakooma' ? startKakooma : startPractice}
          onHome={() => setScreen('home')}
          onHighscores={openHighscores}
        />
      )}
      {screen === 'highscores' && (
        <Highscores entries={highscores} onBack={() => setScreen('home')} />
      )}
    </div>
  )
}
