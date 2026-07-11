import { useState } from 'react'
import { Quiz } from './components/Quiz'
import { ResultsPage } from './components/ResultsPage'
import { ReverseAnalysis } from './components/ReverseAnalysis'
import { SharedResult } from './components/SharedResult'
import type { UserScores } from './lib/match'
import { decodeShareState } from './lib/shareState'

type Stage = 'intro' | 'quiz' | 'results' | 'reverse' | 'shared'

function initialSharedState() {
  const raw = new URLSearchParams(window.location.search).get('r')
  return raw ? decodeShareState(raw) : null
}

function App() {
  const [sharedState] = useState(initialSharedState)
  const [stage, setStage] = useState<Stage>(sharedState ? 'shared' : 'intro')
  const [userScores, setUserScores] = useState<UserScores | null>(null)
  const [freeText, setFreeText] = useState<string[]>([])
  const [players, setPlayers] = useState<string[]>([])
  const [britishOnly, setBritishOnly] = useState(false)

  const goToQuiz = () => {
    window.history.replaceState({}, '', window.location.pathname)
    setStage('quiz')
  }

  return (
    <div className="min-h-screen safe-top safe-bottom">
      <header className="max-w-2xl mx-auto safe-x pt-6 sm:pt-10 flex items-center justify-between">
        <span className="font-display text-sm tracking-widest uppercase">Kindred</span>
        {stage !== 'intro' && (
          <button
            onClick={() => {
              window.history.replaceState({}, '', window.location.pathname)
              setStage('intro')
            }}
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            Home
          </button>
        )}
      </header>

      {stage === 'intro' && (
        <div className="max-w-xl mx-auto safe-x px-4 sm:px-6 py-12 sm:py-24 fade-in">
          <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-6">A club-finder</p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] mb-6">
            Find the club that feels like you.
          </h1>
          <p className="text-[var(--muted)] text-base sm:text-lg leading-relaxed mb-10">
            Enjoyed the World Cup and want somewhere to put your loyalty? Answer a short set of
            questions about history, playing style, fan culture, and what a club should stand for —
            we'll match you against 33 clubs across Europe's top five leagues.
          </p>
          <button
            onClick={() => setStage('quiz')}
            className="w-full sm:w-auto min-h-11 px-8 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity"
          >
            Start the quiz →
          </button>
          <p className="text-xs text-[var(--muted)] mt-6">Takes about two minutes.</p>

          <label className="flex items-center gap-2 mt-8 text-sm text-[var(--muted)] cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={britishOnly}
              onChange={(e) => setBritishOnly(e.target.checked)}
              className="accent-[var(--ink)]"
            />
            Only match me against British (Premier League) clubs
          </label>

          <p className="text-sm text-[var(--muted)] mt-10">
            Already have a club?{' '}
            <button
              onClick={() => setStage('reverse')}
              className="underline underline-offset-4 hover:text-[var(--ink)] transition-colors"
            >
              Find out why →
            </button>
          </p>
        </div>
      )}

      {stage === 'shared' && sharedState && (
        <SharedResult
          clubId={sharedState.clubId}
          score={sharedState.score}
          userScores={sharedState.userScores}
          onStartQuiz={goToQuiz}
        />
      )}

      {stage === 'reverse' && <ReverseAnalysis onBack={() => setStage('intro')} />}

      {stage === 'quiz' && (
        <Quiz
          onComplete={(scores, text, likedPlayers) => {
            setUserScores(scores)
            setFreeText(text)
            setPlayers(likedPlayers)
            setStage('results')
          }}
        />
      )}

      {stage === 'results' && userScores && (
        <ResultsPage
          userScores={userScores}
          freeText={freeText}
          players={players}
          initialLeague={britishOnly ? 'Premier League' : 'All'}
          onRestart={() => setStage('intro')}
        />
      )}

      <footer className="max-w-2xl mx-auto safe-x px-4 sm:px-6 py-12 sm:py-16 text-xs text-[var(--muted)]">
        Built for the joy of picking sides. Data is a curated, qualitative model — not a betting or
        performance product.
      </footer>
    </div>
  )
}

export default App
