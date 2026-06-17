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
  return !!(
    url && key &&
    url.startsWith('https://') &&
    !url.includes('your-project') &&
    !url.includes('placeholder') &&
    (key.startsWith('eyJ') || key.startsWith('sb_'))
  )
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

function toPlayer(row) {
  return { id: row.id, name: row.name, nameLower: row.name_lower, createdAt: row.created_at }
}

function toMatch(row) {
  return {
    id: row.id, homeTeam: row.home_team, awayTeam: row.away_team,
    kickoff: row.kickoff, round: row.round, group: row.group,
    homeScore: row.home_score, awayScore: row.away_score, finished: row.finished,
  }
}

function toPrediction(row) {
  return {
    id: row.id, playerId: row.player_id, matchId: row.match_id,
    homePrediction: row.home_prediction, awayPrediction: row.away_prediction,
    points: row.points, savedAt: row.saved_at,
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

  const { data: existing, error: findErr } = await supabase
    .from('players').select('*').eq('name_lower', trimmed.toLowerCase()).maybeSingle()
  if (findErr) throw new Error(findErr.message)
  if (existing) return { ...toPlayer(existing), isNew: false }

  const id = uuidv4()
  const { data: created, error: createErr } = await supabase
    .from('players').insert({ id, name: trimmed, name_lower: trimmed.toLowerCase() }).select().single()
  if (createErr) throw new Error(createErr.message)
  return { ...toPlayer(created), isNew: true }
}

export async function getPlayer(id) {
  if (!isSupabaseConfigured()) return null
  try {
    const { data } = await supabase.from('players').select('*').eq('id', id).maybeSingle()
    return data ? toPlayer(data) : null
  } catch { return null }
}

export async function getAllPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('id, name')
    .order('name', { ascending: true })
  if (error) return []
  return data
}

// Matches

export function subscribeToMatches(callback) {
  async function fetchAll() {
    const { data, error } = await supabase.from('matches').select('*').order('kickoff', { ascending: true })
    if (!error && data) callback(data.map(toMatch))
    else callback([])
  }
  fetchAll()
  const channel = supabase.channel('matches-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchAll)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export async function updateMatchResult(matchId, homeScore, awayScore) {
  const { error } = await supabase.from('matches')
    .update({ home_score: Number(homeScore), away_score: Number(awayScore), finished: true })
    .eq('id', matchId)
  if (error) throw new Error(error.message)

  const { data: preds, error: predErr } = await supabase.from('predictions').select('*').eq('match_id', matchId)
  if (predErr || !preds || preds.length === 0) return

  for (const pred of preds) {
    const points = calculatePoints(pred.home_prediction, pred.away_prediction, Number(homeScore), Number(awayScore))
    await supabase.from('predictions').update({ points }).eq('id', pred.id)
  }
}

// Reset a match result (removes score, sets finished=false, resets all prediction points to 0)
export async function resetMatchResult(matchId) {
  const { error } = await supabase.from('matches')
    .update({ home_score: null, away_score: null, finished: false })
    .eq('id', matchId)
  if (error) throw new Error(error.message)

  // Reset all prediction points for this match back to 0
  const { data: preds } = await supabase.from('predictions').select('id').eq('match_id', matchId)
  if (preds && preds.length > 0) {
    for (const pred of preds) {
      await supabase.from('predictions').update({ points: 0 }).eq('id', pred.id)
    }
  }
}

// Update team names for a single TBD match (preserves all predictions)
export async function updateMatchTeams(matchId, homeTeam, awayTeam) {
  const { error } = await supabase.from('matches')
    .update({ home_team: homeTeam, away_team: awayTeam })
    .eq('id', matchId)
  if (error) throw new Error(error.message)
}

// Sync team names from matches.js into Supabase (matches by kickoff timestamp)
// Only updates rows where teams differ — never deletes predictions
export async function syncMatchTeams(matchesData) {
  const { data: dbMatches, error } = await supabase.from('matches').select('id, home_team, away_team, kickoff')
  if (error) throw new Error(error.message)

  // Build a lookup: kickoff ISO string → db row
  const dbByKickoff = {}
  dbMatches.forEach(m => { dbByKickoff[new Date(m.kickoff).toISOString()] = m })

  let updated = 0
  for (const codeMatch of matchesData) {
    const key = new Date(codeMatch.kickoff).toISOString()
    const db = dbByKickoff[key]
    if (!db) continue // not yet seeded, skip

    const homeChanged = codeMatch.homeTeam !== 'TBD' && db.home_team !== codeMatch.homeTeam
    const awayChanged = codeMatch.awayTeam !== 'TBD' && db.away_team !== codeMatch.awayTeam

    if (homeChanged || awayChanged) {
      const patch = {}
      if (homeChanged) patch.home_team = codeMatch.homeTeam
      if (awayChanged) patch.away_team = codeMatch.awayTeam
      const { error: upErr } = await supabase.from('matches').update(patch).eq('id', db.id)
      if (upErr) throw new Error(upErr.message)
      updated++
    }
  }
  return updated
}

// Predictions

export async function savePrediction(playerId, matchId, homePrediction, awayPrediction) {
  const { data: match, error: mErr } = await supabase.from('matches').select('kickoff').eq('id', matchId).single()
  if (mErr) throw new Error(mErr.message)
  if (new Date(match.kickoff) < new Date()) throw new Error('Predictions are locked after kickoff')

  const predId = `${playerId}_${matchId}`
  const { error } = await supabase.from('predictions').upsert({
    id: predId, player_id: playerId, match_id: matchId,
    home_prediction: Number(homePrediction), away_prediction: Number(awayPrediction),
    points: 0, saved_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
}

export function subscribeToPredictions(playerId, callback) {
  async function fetchPreds() {
    const { data, error } = await supabase.from('predictions').select('*').eq('player_id', playerId)
    if (!error && data) {
      const map = {}
      data.forEach(row => { map[row.match_id] = toPrediction(row) })
      callback(map)
    } else callback({})
  }
  fetchPreds()
  const channel = supabase.channel(`preds-${playerId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions', filter: `player_id=eq.${playerId}` }, fetchPreds)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// Leaderboard

export function subscribeToLeaderboard(callback) {
  async function fetchLeaderboard() {
    const { data: players } = await supabase.from('players').select('*')
    const { data: preds } = await supabase.from('predictions').select('*')

    const leaderboard = (players || []).map(player => {
      const pp = (preds || []).filter(p => p.player_id === player.id)
      const totalPoints = pp.reduce((sum, p) => sum + (p.points || 0), 0)
      const exactScores = pp.filter(p => p.points === 3).length
      return { id: player.id, name: player.name, createdAt: player.created_at, totalPoints, exactScores, predictionsCount: pp.length }
    })

    leaderboard.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
      if (b.exactScores !== a.exactScores) return b.exactScores - a.exactScores
      return new Date(a.createdAt) - new Date(b.createdAt)
    })
    callback(leaderboard)
  }
  fetchLeaderboard()
  const channel = supabase.channel('leaderboard-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'predictions' }, fetchLeaderboard)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, fetchLeaderboard)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export async function getPredictionsForMatch(matchId) {
  const { data, error } = await supabase.from('predictions').select('*, players(name)').eq('match_id', matchId)
  if (error) return []
  return data.map(row => ({ ...toPrediction(row), playerName: row.players?.name }))
}

// Admin: Seed Matches

export async function seedMatches(matchesData) {
  const { count } = await supabase.from('matches').select('*', { count: 'exact', head: true })
  if (count && count > 0) throw new Error(`Matches already seeded (${count} exist). Clear the matches table first.`)

  const rows = matchesData.map(m => ({
    home_team: m.homeTeam, away_team: m.awayTeam, kickoff: m.kickoff,
    round: m.round, group: m.group || null, home_score: null, away_score: null, finished: false,
  }))

  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await supabase.from('matches').insert(rows.slice(i, i + 100))
    if (error) throw new Error(error.message)
  }
  return matchesData.length
}
