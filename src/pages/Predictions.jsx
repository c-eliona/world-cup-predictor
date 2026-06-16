import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeToMatches, subscribeToPredictions, savePrediction } from '../services/supabase'
import { usePlayer } from '../context/PlayerContext'
import { FLAG } from '../data/matches'

function isLocked(kickoff) {
  return new Date(kickoff) < new Date()
}

const TZ = 'America/New_York'

function formatKickoff(kickoff) {
  return new Date(kickoff).toLocaleString('en-GB', {
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  })
}

function matchDay(kickoff) {
  // Returns a label like "Thu 18 Jun" in Europe/Budapest time
  return new Date(kickoff).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ,
  })
}

function matchDayKey(kickoff) {
  // Returns a sortable key like "2026-06-18" based on Europe/Budapest date
  return new Date(kickoff).toLocaleDateString('en-CA', { timeZone: TZ })
  // en-CA produces YYYY-MM-DD format
}

function pointsBadge(points) {
  if (points === 3) return <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 rounded px-1.5 py-0.5">+3 ⭐</span>
  if (points === 1) return <span className="text-xs font-bold text-amber-400 bg-amber-950 border border-amber-800 rounded px-1.5 py-0.5">+1</span>
  if (points === 0) return <span className="text-xs font-bold text-gray-500 bg-gray-800 rounded px-1.5 py-0.5">+0</span>
  return null
}

function MatchCard({ match, prediction, onSave }) {
  const locked = isLocked(match.kickoff)
  const [home, setHome] = useState(prediction?.homePrediction ?? '')
  const [away, setAway] = useState(prediction?.awayPrediction ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (prediction) {
      setHome(prediction.homePrediction)
      setAway(prediction.awayPrediction)
    }
  }, [prediction?.homePrediction, prediction?.awayPrediction])

  const isDirty =
    prediction == null
      ? home !== '' || away !== ''
      : home !== prediction.homePrediction || away !== prediction.awayPrediction

  async function handleSave() {
    if (home === '' || away === '') { setError('Enter both scores'); return }
    setError('')
    setSaving(true)
    try {
      await onSave(match.id, Number(home), Number(away))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const homeFlag = FLAG[match.homeTeam] || '🏳️'
  const awayFlag = FLAG[match.awayTeam] || '🏳️'

  return (
    <div className={`card mb-3 ${locked ? 'opacity-80' : ''}`}>
      {/* Time + round label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{formatKickoff(match.kickoff)}</span>
          <span className="text-xs text-gray-600">·</span>
          <span className="text-xs text-gray-600">{match.round}</span>
        </div>
        {locked && !match.finished && <span className="text-xs text-amber-500 font-medium">🔒 Locked</span>}
        {match.finished && (
          <span className="text-xs text-emerald-500 font-medium">✅ {match.homeScore}–{match.awayScore}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-right">
          <div className="text-base font-semibold text-white leading-tight">{homeFlag} {match.homeTeam}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <input
            type="number" min="0" max="20" value={home}
            onChange={(e) => setHome(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
            disabled={locked}
            className="input-score" placeholder="–"
          />
          <span className="text-gray-500 font-bold text-lg">:</span>
          <input
            type="number" min="0" max="20" value={away}
            onChange={(e) => setAway(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
            disabled={locked}
            className="input-score" placeholder="–"
          />
        </div>
        <div className="flex-1 text-left">
          <div className="text-base font-semibold text-white leading-tight">{match.awayTeam} {awayFlag}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          {match.finished && prediction != null && pointsBadge(prediction.points)}
          {!match.finished && prediction != null && !isDirty && (
            <span className="text-xs text-gray-500">Prediction saved</span>
          )}
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
        {!locked && (
          <button
            onClick={handleSave}
            disabled={saving || (!isDirty && prediction != null)}
            className="btn-primary text-sm py-1.5 px-3"
          >
            {saving ? '...' : saved ? '✓ Saved' : 'Save'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function Predictions() {
  const { player } = usePlayer()
  const navigate = useNavigate()
  const [matches, setMatches] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(null)

  useEffect(() => {
    if (!player) { navigate('/'); return }
    const unsubMatches = subscribeToMatches((data) => {
      setMatches(data)
      setLoading(false)
    })
    const unsubPreds = subscribeToPredictions(player.id, setPredictions)
    return () => { unsubMatches(); unsubPreds() }
  }, [player])

  // Group matches by calendar day (local date)
  const grouped = matches.reduce((acc, m) => {
    const key = matchDayKey(m.kickoff)
    if (!acc[key]) acc[key] = []
    acc[key].push(m)
    return acc
  }, {})

  const days = Object.keys(grouped).sort()

  // Auto-select first day with upcoming matches
  useEffect(() => {
    if (days.length > 0 && !activeDay) {
      const upcoming = days.find(d => grouped[d].some(m => !isLocked(m.kickoff)))
      setActiveDay(upcoming || days[0])
    }
  }, [days.length])

  if (!player) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 text-lg animate-pulse">Loading matches...</div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white mb-2">No matches yet</h2>
        <p className="text-gray-500">The admin hasn't seeded the matches yet.</p>
      </div>
    )
  }

  const currentMatches = grouped[activeDay] || []
  const unlockedCount = currentMatches.filter(m => !isLocked(m.kickoff)).length
  const savedCount = currentMatches.filter(m => predictions[m.id] != null).length

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Predictions</h1>
        <p className="text-gray-500 text-sm mt-1">👤 {player.name}</p>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
        {days.map((dayKey) => {
          const dayMatches = grouped[dayKey]
          const hasUpcoming = dayMatches.some(m => !isLocked(m.kickoff))
          const isActive = dayKey === activeDay
          const label = matchDay(dayMatches[0].kickoff)
          return (
            <button
              key={dayKey}
              onClick={() => setActiveDay(dayKey)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : hasUpcoming
                  ? 'bg-gray-800 border-emerald-800 text-emerald-400 hover:border-emerald-500'
                  : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Day summary */}
      <div className="text-sm text-gray-500 mb-4">
        {savedCount}/{currentMatches.length} predicted
        {unlockedCount > 0 && ` · ${unlockedCount} open`}
      </div>

      {/* Match cards */}
      {currentMatches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          prediction={predictions[match.id] || null}
          onSave={(matchId, h, a) => savePrediction(player.id, matchId, h, a)}
        />
      ))}
    </div>
  )
}
