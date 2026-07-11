import { useState } from 'react'
import { Quiz } from './components/Quiz'
import { ResultsPage } from './components/ResultsPage'
import type { UserScores } from './lib/match'

type Stage = 'intro' | 'quiz' | 'results'

function App() {
  const [stage, setStage] = useState<Stage>('intro')
  const [userScores, setUserScores] = useState<UserScores | null>(null)
  const [freeText, setFreeText] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [britishOnly, setBritishOnly] = useState(false)

  return (
    <div className="min-h-screen">
      <header className="max-w-2xl mx-auto px-6 pt-10 flex items-center justify-between">
        <span className="font-display text-sm tracking-widest uppercase">Kindred</span>
        {stage !== 'intro' && (
          <button
            onClick={() => setStage('intro')}
            className="text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            Home
          </button>
        )}
      </header>

      {stage === 'intro' && (
        <div className="max-w-xl mx-auto px-6 py-24 fade-in">
          <p className="text-xs tracking-widest uppercase text-[var(--muted)] mb-6">A club-finder</p>
          <h1 className="font-display text-5xl leading-[1.1] mb-6">
            Find the club that feels like you.
          </h1>
          <p className="text-[var(--muted)] text-lg leading-relaxed mb-10">
            Enjoyed the World Cup and want somewhere to put your loyalty? Answer a short set of
            questions about history, playing style, fan culture, and what a club should stand for —
            we'll match you against 33 clubs across Europe's top five leagues.
          </p>
          <button
            onClick={() => setStage('quiz')}
            className="px-8 py-4 bg-[var(--ink)] text-[var(--paper)] rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity"
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
        </div>
      )}

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

      <footer className="max-w-2xl mx-auto px-6 py-16 text-xs text-[var(--muted)]">
        Built for the joy of picking sides. Data is a curated, qualitative model — not a betting or
        performance product.
      </footer>
    </div>
  )
}

export default App
