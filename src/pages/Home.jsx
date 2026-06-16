import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrCreatePlayer, isSupabaseConfigured } from '../services/supabase'
import { usePlayer } from '../context/PlayerContext'

function SetupBanner() {
  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-amber-950 border border-amber-700 rounded-2xl p-6">
        <div className="text-3xl mb-3">⚙️</div>
        <h2 className="text-lg font-bold text-amber-300 mb-2">Supabase setup required</h2>
        <p className="text-amber-200/80 text-sm mb-4">
          Create a free Supabase project and add the credentials to a <code className="bg-black/40 px-1 rounded">.env</code> file.
        </p>
        <ol className="text-amber-200/70 text-sm space-y-2 list-decimal list-inside mb-4">
          <li>Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline text-amber-300">supabase.com</a> → New project</li>
          <li>Run the SQL schema from <code className="bg-black/40 px-1 rounded">supabase/schema.sql</code> in the SQL editor</li>
          <li>Go to Project Settings → API → copy URL and anon key</li>
          <li>Create a <code className="bg-black/40 px-1 rounded">.env</code> file in the project root:</li>
        </ol>
        <pre className="bg-black/50 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto mb-4">{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

VITE_ADMIN_PASSWORD=choose_a_password`}</pre>
        <p className="text-amber-200/60 text-xs">
          After saving <code className="bg-black/40 px-1 rounded">.env</code>, restart the dev server: <code className="bg-black/40 px-1 rounded">npm run dev</code>
        </p>
      </div>
    </div>
  )
}

export default function Home() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { player, login } = usePlayer()
  const navigate = useNavigate()

  if (!isSupabaseConfigured()) return <SetupBanner />

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setLoading(true)
    try {
      const p = await getOrCreatePlayer(name)
      login(p)
      navigate('/predictions')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (player) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back,</h1>
          <p className="text-2xl text-emerald-400 font-bold mb-8">{player.name}!</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/predictions')} className="btn-primary w-full py-3 text-base">
              My Predictions
            </button>
            <button onClick={() => navigate('/leaderboard')} className="btn-secondary w-full py-3 text-base">
              🏅 Leaderboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white">World Cup 2026</h1>
          <p className="text-emerald-400 font-semibold text-lg mt-1">Predictor</p>
          <p className="text-gray-500 text-sm mt-3">
            Predict every match. Climb the leaderboard. No signup needed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">
              Enter your name to play
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John"
              maxLength={30}
              autoFocus
              className="w-full bg-gray-800 border-2 border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white text-base outline-none transition-colors placeholder-gray-600"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? 'Connecting...' : 'Continue →'}
          </button>
        </form>

        <p className="text-center text-gray-600 text-xs mt-6">
          Already played before? Enter the same name to pick up where you left off.
        </p>
      </div>
    </div>
  )
}
