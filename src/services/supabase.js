import { createClient } from '@supabase/supabase-js'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && url.startsWith('https://') && !url.includes('your-project'))
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Row mappers: DB snake_case -> JS camelCase
function toPlayer(row) {
  return {
    id: row.id,
    name: row.name,
    nameLower: row.name_lower,
    createdAt: row.created_at,
  }
}

function toMatch(row) {
  return {
    id: row.id,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    kickoff: row.kickoff,
    round: row.round,
    group: row.group,
    homeScore: row.home_score,
    awayScore: row.away_score,
    finished: row.finished,
  }
}

function toPrediction(row) {
  return {
    id: row.id,
    playerId: row.player_id,
    matchId: row.match_id,
    homePrediction: row.home_prediction,
    awayPrediction: row.away_prediction,
    points: row.points,
    savedAt: row.saved_at,
  }
}

// Scoring

export function calculatePoints(homePred, awayPred, homeActual, awayActual) {
  if (homePred === homeActual && awayPred === awayActual) return 3
  const predOutcome = Math.sign(homePred - awayPred)
  const actualOutcome = Math.sign(homeActual - awayActual)
  if (predOutcome === actualOutcome) return 1
  return 0
}

// Players

export async function getOrCreatePlayer(name) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please create a .env file. See .env.example.')
  }

  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name is required')

  // Find existing player
  const { data: existing, error: findErr } = await supabase
    .from('players')
    .select('*')
    .eq('name_lower', trimmed.toLowerCase())
    .maybeSingle()

  if (findErr) throw new Error(findErr.message)

  if (existing) {
    return { ...toPlayer(existing), isNew: false }
  }

  // Create new player
  const id = uuidv4()
  const { data: created, error: createErr } = await supabase
    .from('players')
    .insert({ id, name: trimmed, name_lower: trimmed.toLowerCase() })
    .select()
    .single()

  if (createErr) throw new Error(createErr.message)
  return { ...toPlayer(created), isNew: true }
}

export async function getPlayer(id) {
  if (!isSupabaseConfigured()) return null
  try {
    const { data } = await supabase.from('players').select('*').eq('id', id).maybeSingle()
    return data ? toPlayer(data) : null
  } catch {
    return null
  }
}

// Matches

export function subscribeToMatches(callback) {
  async function fetchAll() {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('kickoff', { ascending: true })
    if (!error && data) callback(data.map(toMatch))
    else if (error) callback([])
  }

  fetchAll()

  const channel = supabase
    .channel('matches-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchAll)
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export async function updateMatchResult(matchId, homeScore, awayScore) {
  const { error } = await supabase
    .from('matches')
    .update({ home_score: Number(homeScore), away_score: Number(awayScore), finished: true })
    .eq('id', matchId)

  if (error) throw new Error(error.message)

  // Recalculate points for all predictions on this match
  const { data: preds, error: predErr } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId)

  if (predErr || !preds || preds.length === 0) return

  const updates = preds.map((pred) => ({
    id: pred.id,
    points: calculatePoints(
      pred.home_prediction,
      pred.away_prediction,
      Number(homeScore),
      Number(awayScore)
    ),
  }))

  for (const upd of updates) {
    await supabase.from('predictions').update({ points: upd.points }).eq('id', upd.id)
  }
}

// Predictions

export async function savePrediction(playerId, matchId, homePrediction, awayPrediction) {
  // Check kickoff
  const { data: match, error: mErr } = await supabase
    .from('matches')
    .select('kickoff')
    .eq('id', matchId)
    .single()

  if (mErr) throw new Error(mErr.message)
  if (new Date(match.kickoff) < new Date()) {
    throw new Error('Predictions are locked after kickoff')
  }

  const predId = `${playerId}_${matchId}`

  const { error } = await supabase.from('predictions').upsert({
    id: predId,
    player_id: playerId,
    match_id: matchId,
    home_prediction: Number(homePrediction),
    away_prediction: Number(awayPrediction),
    points: 0,
    saved_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
}

export function subscribeToPredictions(playerId, callback) {
  async function fetchPreds() {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('player_id', playerId)

    if (!error && data) {
      const map = {}
      data.forEach((row) => {
        map[row.match_id] = toPrediction(row)
      })
      callback(map)
    } else {
      callback({})
    }
  }

  fetchPreds()

  const channel = supabase
    .channel(`preds-${playerId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'predictions', filter: `player_id=eq.${playerId}` },
      fetchPreds
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

// Leaderboard

export function subscribeToLeaderboard(callback) {
  async function fetchLeaderboard() {
    const { data: players, error: pErr } = await supabase.from('players').select('*')
    const { data: preds, error: prErr } = await supabase.from('predictions').select('*')

    if (pErr || prErr) { callback([]); return }

    const leaderboard = (players || []).map((player) => {
      const playerPreds = (preds || []).filter((p) => p.player_id === player.id)
      const totalPoints = playerPreds.reduce((sum, p) => sum + (p.points || 0), 0)
      const exactScores = playerPreds.filter((p) => p.points === 3).length
      return {
        id: player.id,
        name: player.name,
        createdAt: player.created_at,
        totalPoints,
        exactScores,
        predictionsCount: playerPreds.length,
      }
    })

    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores
      return new Date(a.createdAt) - new Date(b.createdAt)
    })

    callback(leaderboard)
  }

  fetchLeaderboard()

  const channel = supabase
    .channel('leaderboard-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, fetchLeaderboard)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchLeaderboard)
    .subscribe()

  return () => supabase.removeChannel(channel)
}

export async function getPredictionsForMatch(matchId) {
  const { data, error } = await supabase
    .from('predictions')
    .select('*, players(name)')
    .eq('match_id', matchId)
  if (error) return []
  return data.map((row) => ({
    ...toPrediction(row),
    playerName: row.players?.name,
  }))
}

// Admin: Seed Matches

export async function seedMatches(matchesData) {
  const { count } = await supabase.from('matches').select('*', { count: 'exact', head: true })
  if (count && count > 0) {
    throw new Error(`Matches already seeded (${count} matches exist). Clear the matches table first.`)
  }

  const rows = matchesData.map((m) => ({
    home_team: m.homeTeam,
    away_team: m.awayTeam,
    kickoff: m.kickoff,
    round: m.round,
    group: m.group || null,
    home_score: null,
    away_score: null,
    finished: false,
  }))

  // Insert in batches of 100
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from('matches').insert(rows.slice(i, i + 100))
    if (error) throw new Error(error.message)
  }

  return matchesData.length
}
