import { useState, useEffect } from 'react'
import { subscribeToLeaderboard, subscribeToMatches, supabase } from '../services/supabase'
import { usePlayer } from '../context/PlayerContext'
import { FLAG } from '../data/matches'

function rankEmoji(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}.`
}

export default function Leaderboard() {
  const { player } = usePlayer()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [playerPreds, setPlayerPreds] = useState([])
  const [matches, setMatches] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    const unsub = subscribeToLeaderboard((data) => {
      setLeaderboard(data)
      setLoading(false)
    })
    const unsubMatches = subscribeToMatches(setMatches)
    return () => { unsub(); unsubMatches() }
  }, [])

  async function openPlayerDetail(p) {
    setSelectedPlayer(p)
    setLoadingDetail(true)
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('player_id', p.id)

      if (error || !data) { setPlayerPreds([]); return }

      const matchMap = {}
      matches.forEach(m => { matchMap[m.id] = m })

      const enriched = data
        .filter(pred => matchMap[pred.match_id]?.finished)
        .map(pred => ({
          id: pred.id,
          matchId: pred.match_id,
          homePrediction: pred.home_prediction,
          awayPrediction: pred.away_prediction,
          points: pred.points,
          match: matchMap[pred.match_id],
        }))
        .sort((a, b) => new Date(a.match?.kickoff) - new Date(b.match?.kickoff))

      setPlayerPreds(enriched)
    } catch (e) {
      console.error(e)
      setPlayerPreds([])
    } finally {
      setLoadingDetail(false)
    }
  }

  function closeDetail() {
    setSelectedPlayer(null)
    setPlayerPreds([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 animate-pulse">Loading leaderboard...</div>
      </div>
    )
  }

  if (selectedPlayer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button onClick={closeDetail} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
          ← Back to Leaderboard
        </button>
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedPlayer.name}</h2>
              <p className="text-gray-500 text-sm mt-0.5">
                {selectedPlayer.totalPoints} pts · {selectedPlayer.exactScores} exact · {selectedPlayer.predictionsCount} predictions
              </p>
            </div>
            <div className="text-4xl font-black text-emerald-400">{selectedPlayer.totalPoints}</div>
          </div>
        </div>

        {loadingDetail ? (
          <div className="text-gray-500 text-center py-8 animate-pulse">Loading predictions...</div>
        ) : playerPreds.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No scored predictions yet.</div>
        ) : (
          <div className="space-y-3">
            {playerPreds.map((pred) => {
              const m = pred.match
              if (!m) return null
              const homeFlag = FLAG[m.homeTeam] || '🏳️'
              const awayFlag = FLAG[m.awayTeam] || '🏳️'
              return (
                <div key={pred.id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">{m.round}</span>
                    {pred.points === 3 && <span className="text-xs text-emerald-400 font-bold">+3 ⭐ Exact!</span>}
                    {pred.points === 1 && <span className="text-xs text-amber-400 font-bold">+1 Correct result</span>}
                    {pred.points === 0 && <span className="text-xs text-gray-500 font-bold">+0</span>}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">{homeFlag} {m.homeTeam}</span>
                    <div className="text-center">
                      <div className="text-white font-bold">{m.homeScore}–{m.awayScore}</div>
                      <div className="text-gray-500 text-xs">Your: {pred.homePrediction}–{pred.awayPrediction}</div>
                    </div>
                    <span className="font-medium text-white">{m.awayTeam} {awayFlag}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">🏆 Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">{leaderboard.length} players · Live scoring</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🏃</div>
          <p className="text-gray-400">No players yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, idx) => {
            const rank = idx + 1
            const isMe = player?.id === entry.id
            return (
              <button
                key={entry.id}
                onClick={() => openPlayerDetail(entry)}
                className={`w-full card text-left flex items-center gap-4 hover:border-gray-600 transition-colors ${
                  isMe ? 'border-emerald-700 bg-emerald-950/30' : ''
                }`}
              >
                <div className="w-10 text-center flex-shrink-0">
                  <span className="text-lg font-bold">{rankEmoji(rank)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold truncate ${isMe ? 'text-emerald-400' : 'text-white'}`}>
                      {entry.name}
                    </span>
                    {isMe && <span className="text-xs text-emerald-600 font-medium flex-shrink-0">you</span>}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    {entry.exactScores} exact · {entry.predictionsCount} predictions
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-black text-white">{entry.totalPoints}</div>
                  <div className="text-xs text-gray-600">pts</div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <p className="text-center text-gray-700 text-xs mt-8">
        Tiebreakers: exact scores → earliest registration
      </p>
    </div>
  )
}
