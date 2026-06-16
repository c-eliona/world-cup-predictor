import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrCreatePlayer, getAllPlayers, isSupabaseConfigured } from '../services/supabase'
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
          <li>Create a <code className="bg-black/40 px-1 rounded">.env</code> file in the project root</li>
        </ol>
        <pre className="bg-black/50 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto">{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_ADMIN_PASSWORD=choose_a_password`}</pre>
      </div>
    </div>
  )
}

export default function Home() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [players, setPlayers] = useState([])
  const [loadingPlayers, setLoadingPlayers] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { player, login } = usePlayer()
  const navigate = useNavigate()

  if (!isSupabaseConfigured()) return <SetupBanner />

  useEffect(() => {
    getAllPlayers().then(p => {
      setPlayers(p)
      setLoadingPlayers(false)
    })
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    if (!selectedId) return
    setError('')
    setLoading(true)
    try {
      const found = players.find(p => p.id === selectedId)
      if (!found) throw new Error('Player not found')
      login({ id: found.id, name: found.name, nameLower: found.name.toLowerCase(), createdAt: new Date().toISOString() })
      navigate('/predictions')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setLoading(true)
    try {
      const p = await getOrCreatePlayer(name)
      if (!p.isNew) {
        setError(`"${p.name}" is already registered. Switch to Log In to continue.`)
        setLoading(false)
        return
      }
      login(p)
      navigate('/predictions')
    } catch (err) {
      setError(err.message)
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white">World Cup 2026</h1>
          <p className="text-emerald-400 font-semibold text-lg mt-1">Predictor</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-xl overflow-hidden border border-gray-800 mb-6">
          <button
            onClick={() => { setMode('login'); setError('') }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              mode === 'login' ? 'bg-emerald-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              mode === 'register' ? 'bg-emerald-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Log In — pick from list */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select your name
              </label>
              {loadingPlayers ? (
                <div className="text-gray-500 text-sm animate-pulse py-2">Loading players...</div>
              ) : players.length === 0 ? (
                <div className="text-gray-500 text-sm py-2">
                  No players yet. Be the first — switch to <strong className="text-white">Register</strong>.
                </div>
              ) : (
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="w-full bg-gray-800 border-2 border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white text-base outline-none transition-colors"
                >
                  <option value="">— Choose your name —</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedId}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Loading...' : 'Continue →'}
            </button>
          </form>
        )}

        {/* Register — free text */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Enter your name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
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
              {loading ? 'Registering...' : 'Register & Play →'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-600 text-xs mt-6">
          {mode === 'login'
            ? 'First time? Switch to Register above.'
            : 'Already registered? Switch to Log In above.'}
        </p>
      </div>
    </div>
  )
}
