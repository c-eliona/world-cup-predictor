import { useState, useEffect } from 'react'
import { subscribeToMatches, updateMatchResult, resetMatchResult, updateMatchTeams, syncMatchTeams, seedMatches } from '../services/supabase'
import { matches as matchData, FLAG } from '../data/matches'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'AdrianoSeksi'

function formatKickoff(kickoff) {
  return new Date(kickoff).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function isLocked(kickoff) {
  return new Date(kickoff) < new Date()
}

function AdminMatchRow({ match, onUpdate, onUpdateTeams }) {
  const [home, setHome] = useState(match.homeScore ?? '')
  const [away, setAway] = useState(match.awayScore ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)

  // Team editing for TBD knockout matches
  const [teamMode, setTeamMode] = useState(false)
  const [homeTeamEdit, setHomeTeamEdit] = useState(match.homeTeam)
  const [awayTeamEdit, setAwayTeamEdit] = useState(match.awayTeam)
  const [savingTeams, setSavingTeams] = useState(false)

  useEffect(() => {
    setHome(match.homeScore ?? '')
    setAway(match.awayScore ?? '')
    setHomeTeamEdit(match.homeTeam)
    setAwayTeamEdit(match.awayTeam)
  }, [match.homeScore, match.awayScore, match.homeTeam, match.awayTeam])

  async function handleSave() {
    if (home === '' || away === '') { setError('Both scores required'); return }
    setError('')
    setSaving(true)
    try {
      await onUpdate(match.id, Number(home), Number(away))
      setSaved(true)
      setEditMode(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveTeams() {
    if (!homeTeamEdit.trim() || !awayTeamEdit.trim()) return
    setSavingTeams(true)
    try {
      await onUpdateTeams(match.id, homeTeamEdit.trim(), awayTeamEdit.trim())
      setTeamMode(false)
    } catch (e) {
      setError(e.message)
    } finally {
      setSavingTeams(false)
    }
  }

  const locked = isLocked(match.kickoff)
  const isTbd = match.homeTeam === 'TBD' || match.awayTeam === 'TBD'
  const homeFlag = FLAG[match.homeTeam] || '🏳️'
  const awayFlag = FLAG[match.awayTeam] || '🏳️'

  return (
    <div className={`card mb-2 ${match.finished ? 'border-emerald-900' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 mb-1">{formatKickoff(match.kickoff)}</div>
          {teamMode ? (
            <div className="flex items-center gap-2 my-1">
              <input
                value={homeTeamEdit}
                onChange={e => setHomeTeamEdit(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm w-28"
                placeholder="Home team"
              />
              <span className="text-gray-500 text-xs">vs</span>
              <input
                value={awayTeamEdit}
                onChange={e => setAwayTeamEdit(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm w-28"
                placeholder="Away team"
              />
              <button onClick={handleSaveTeams} disabled={savingTeams} className="btn-primary text-xs py-1 px-2">
                {savingTeams ? '...' : 'Save'}
              </button>
              <button onClick={() => setTeamMode(false)} className="btn-secondary text-xs py-1 px-2">✕</button>
            </div>
          ) : (
            <div className="font-medium text-white text-sm">
              {homeFlag} {match.homeTeam} vs {match.awayTeam} {awayFlag}
            </div>
          )}
          {match.finished && (
            <div className="text-xs text-emerald-400 mt-0.5 font-medium">
              ✅ Final: {match.homeScore}–{match.awayScore}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Set teams button for TBD matches */}
          {isTbd && !teamMode && (
            <button
              onClick={() => setTeamMode(true)}
              className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 rounded px-2 py-1"
            >
              Set Teams
            </button>
          )}

          {/* Score input — available for all matches regardless of kickoff */}
          {!isTbd && (editMode || !match.finished) ? (
            <div className="flex items-center gap-2">
              <input
                type="number" min="0" max="20" value={home}
                onChange={e => setHome(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                className="input-score w-12 h-10 text-base" placeholder="H"
              />
              <span className="text-gray-500 font-bold">:</span>
              <input
                type="number" min="0" max="20" value={away}
                onChange={e => setAway(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                className="input-score w-12 h-10 text-base" placeholder="A"
              />
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-1.5 px-3">
                {saving ? '...' : 'Save'}
              </button>
              {match.finished && (
                <button onClick={() => setEditMode(false)} className="btn-secondary text-sm py-1.5 px-2">✕</button>
              )}
            </div>
          ) : !isTbd && match.finished ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditMode(true)} className="text-xs text-gray-500 hover:text-white border border-gray-700 rounded px-2 py-1">
                Edit
              </button>
              <button
                onClick={async () => {
                  if (!confirm('Remove this result? All prediction points will be reset to 0.')) return
                  try { await resetMatchResult(match.id) } catch (e) { setError(e.message) }
                }}
                className="text-xs text-red-500 hover:text-red-400 border border-red-900 rounded px-2 py-1"
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      {saved && <p className="text-emerald-400 text-xs mt-2">✓ Result saved & points recalculated</p>}
    </div>
  )
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeRound, setActiveRound] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const [seedMsg, setSeedMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')
  const [filterFinished, setFilterFinished] = useState('all')

  function handleLogin(e) {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true)
      sessionStorage.setItem('wcp_admin', '1')
    } else {
      setPwError('Incorrect password')
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('wcp_admin') === '1') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    const unsub = subscribeToMatches((data) => {
      setMatches(data)
      setLoading(false)
    })
    return unsub
  }, [authed])

  function groupByRound(ms) {
    return ms.reduce((acc, m) => {
      if (!acc[m.round]) acc[m.round] = []
      acc[m.round].push(m)
      return acc
    }, {})
  }

  useEffect(() => {
    if (matches.length > 0 && !activeRound) {
      const grouped = groupByRound(matches)
      const rounds = Object.keys(grouped)
      const first = rounds.find(r => grouped[r].some(m => isLocked(m.kickoff))) || rounds[0]
      setActiveRound(first)
    }
  }, [matches.length])

  async function handleSync() {
    setSyncing(true)
    setSyncMsg('')
    try {
      const count = await syncMatchTeams(matchData)
      setSyncMsg(count > 0 ? `✅ Updated ${count} match${count > 1 ? 'es' : ''} from code` : '✅ Already in sync — no changes needed')
    } catch (e) {
      setSyncMsg(`❌ ${e.message}`)
    } finally {
      setSyncing(false)
    }
  }

  async function handleSeed() {
    if (!confirm(`Seed ${matchData.length} matches into Supabase? This should only be done once.`)) return
    setSeeding(true)
    setSeedMsg('')
    try {
      const count = await seedMatches(matchData)
      setSeedMsg(`✅ Seeded ${count} matches successfully!`)
    } catch (e) {
      setSeedMsg(`❌ ${e.message}`)
    } finally {
      setSeeding(false)
    }
  }

  if (!authed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Enter the admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="card space-y-4">
            <input
              type="password" value={pw}
              onChange={e => { setPw(e.target.value); setPwError('') }}
              placeholder="Password" autoFocus
              className="w-full bg-gray-800 border-2 border-gray-700 focus:border-emerald-500 rounded-lg px-4 py-3 text-white outline-none transition-colors"
            />
            {pwError && <p className="text-red-400 text-sm">{pwError}</p>}
            <button type="submit" className="btn-primary w-full py-3">Enter Admin →</button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 animate-pulse">Loading...</div>
      </div>
    )
  }

  const grouped = groupByRound(matches)
  const rounds = Object.keys(grouped)
  const currentMatches = grouped[activeRound] || []
  const filtered = currentMatches.filter(m => {
    if (filterFinished === 'pending') return isLocked(m.kickoff) && !m.finished
    if (filterFinished === 'done') return m.finished
    return true
  })
  const pendingCount = matches.filter(m => isLocked(m.kickoff) && !m.finished && m.homeTeam !== 'TBD').length
  const tbdCount = matches.filter(m => m.homeTeam === 'TBD' || m.awayTeam === 'TBD').length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">🔐 Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">{matches.length} matches total</p>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('wcp_admin'); setAuthed(false) }}
          className="text-xs text-gray-600 hover:text-red-400"
        >
          Logout
        </button>
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-950 border border-amber-800 rounded-xl p-3 mb-3 text-sm text-amber-400">
          ⚠️ {pendingCount} match{pendingCount > 1 ? 'es' : ''} need a result
        </div>
      )}
      {tbdCount > 0 && (
        <div className="bg-blue-950 border border-blue-800 rounded-xl p-3 mb-3 text-sm text-blue-400">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span>🏳️ {tbdCount} knockout match{tbdCount > 1 ? 'es' : ''} need teams — set via UI below or update <code className="bg-black/30 px-1 rounded">matches.js</code> and sync</span>
            <button onClick={handleSync} disabled={syncing} className="btn-secondary text-xs py-1 px-3 flex-shrink-0">
              {syncing ? 'Syncing...' : '🔄 Sinkronizo automatikisht (Kontakto Elionen)'}
            </button>
          </div>
          {syncMsg && <p className="text-xs mt-2 text-emerald-400">{syncMsg}</p>}
        </div>
      )}

      {matches.length === 0 && (
        <div className="card mb-6 text-center">
          <p className="text-gray-400 mb-2">No matches in Supabase yet.</p>
          <p className="text-gray-500 text-xs mb-4">Seeds all {matchData.length} official WC2026 matches.</p>
          <button onClick={handleSeed} disabled={seeding} className="btn-primary">
            {seeding ? 'Seeding...' : '🌱 Seed All Matches'}
          </button>
          {seedMsg && <p className="text-sm mt-3 text-gray-400">{seedMsg}</p>}
        </div>
      )}

      {matches.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-600">Matches loaded from Supabase</span>
            {seedMsg && <span className="text-xs text-emerald-400">{seedMsg}</span>}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
            {rounds.map(r => {
              const hasPending = grouped[r].some(m => isLocked(m.kickoff) && !m.finished && m.homeTeam !== 'TBD')
              const hasTbd = grouped[r].some(m => m.homeTeam === 'TBD' || m.awayTeam === 'TBD')
              return (
                <button
                  key={r}
                  onClick={() => setActiveRound(r)}
                  className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    r === activeRound
                      ? 'bg-emerald-700 border-emerald-600 text-white'
                      : hasPending
                      ? 'bg-amber-950 border-amber-800 text-amber-400'
                      : hasTbd
                      ? 'bg-blue-950 border-blue-800 text-blue-400'
                      : 'bg-gray-800 border-gray-700 text-gray-500'
                  }`}
                >
                  {r} {hasPending ? '●' : hasTbd ? '○' : ''}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 mb-4">
            {['all', 'pending', 'done'].map(f => (
              <button
                key={f}
                onClick={() => setFilterFinished(f)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors capitalize ${
                  filterFinished === f
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-800 text-gray-500 hover:border-gray-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No matches in this filter.</p>
          ) : (
            filtered.map(m => (
              <AdminMatchRow key={m.id} match={m} onUpdate={updateMatchResult} onUpdateTeams={updateMatchTeams} />
            ))
          )}
        </>
      )}
    </div>
  )
}
