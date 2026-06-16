import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore'

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// Check if all required Firebase env vars are present
export function isFirebaseConfigured() {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID &&
    import.meta.env.VITE_FIREBASE_APP_ID &&
    import.meta.env.VITE_FIREBASE_API_KEY !== 'your_api_key_here'
  )
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Wrap any promise with a timeout
function withTimeout(promise, ms = 10000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Check your Firebase configuration and internet connection.')), ms)
  )
  return Promise.race([promise, timeout])
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
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please create a .env file with your Firebase credentials. See .env.example for the required variables.')
  }

  const trimmed = name.trim()
  if (!trimmed) throw new Error('Name is required')

  const q = query(
    collection(db, 'players'),
    where('nameLower', '==', trimmed.toLowerCase())
  )
  const snap = await withTimeout(getDocs(q))

  if (!snap.empty) {
    const existing = snap.docs[0]
    return { id: existing.id, ...existing.data(), isNew: false }
  }

  const id = uuidv4()
  const player = {
    name: trimmed,
    nameLower: trimmed.toLowerCase(),
    createdAt: new Date().toISOString(),
  }
  await withTimeout(setDoc(doc(db, 'players', id), player))
  return { id, ...player, isNew: true }
}

export async function getPlayer(id) {
  if (!isFirebaseConfigured()) return null
  try {
    const snap = await withTimeout(getDoc(doc(db, 'players', id)))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  } catch {
    return null
  }
}

// Matches

export function subscribeToMatches(callback) {
  const q = query(collection(db, 'matches'), orderBy('kickoff', 'asc'))
  return onSnapshot(q, (snap) => {
    const matches = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(matches)
  }, () => callback([]))
}

export async function getMatches() {
  const q = query(collection(db, 'matches'), orderBy('kickoff', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function updateMatchResult(matchId, homeScore, awayScore) {
  const matchRef = doc(db, 'matches', matchId)
  await updateDoc(matchRef, {
    homeScore: Number(homeScore),
    awayScore: Number(awayScore),
    finished: true,
  })

  const q = query(collection(db, 'predictions'), where('matchId', '==', matchId))
  const snap = await getDocs(q)
  if (snap.empty) return

  const batch = writeBatch(db)
  snap.docs.forEach((predDoc) => {
    const pred = predDoc.data()
    const points = calculatePoints(
      pred.homePrediction,
      pred.awayPrediction,
      Number(homeScore),
      Number(awayScore)
    )
    batch.update(predDoc.ref, { points })
  })
  await batch.commit()
}

// Predictions

export async function savePrediction(playerId, matchId, homePrediction, awayPrediction) {
  const matchSnap = await getDoc(doc(db, 'matches', matchId))
  if (!matchSnap.exists()) throw new Error('Match not found')
  const match = matchSnap.data()

  if (new Date(match.kickoff) < new Date()) {
    throw new Error('Predictions are locked after kickoff')
  }

  const predId = `${playerId}_${matchId}`
  const predRef = doc(db, 'predictions', predId)
  const existing = await getDoc(predRef)

  const data = {
    playerId,
    matchId,
    homePrediction: Number(homePrediction),
    awayPrediction: Number(awayPrediction),
    points: 0,
    savedAt: new Date().toISOString(),
  }

  if (existing.exists()) {
    await updateDoc(predRef, {
      homePrediction: data.homePrediction,
      awayPrediction: data.awayPrediction,
      savedAt: data.savedAt,
    })
  } else {
    await setDoc(predRef, data)
  }

  return data
}

export function subscribeToPredictions(playerId, callback) {
  const q = query(collection(db, 'predictions'), where('playerId', '==', playerId))
  return onSnapshot(q, (snap) => {
    const preds = {}
    snap.docs.forEach((d) => {
      const pred = d.data()
      preds[pred.matchId] = { id: d.id, ...pred }
    })
    callback(preds)
  }, () => callback({}))
}

export async function getPredictionsForMatch(matchId) {
  const q = query(collection(db, 'predictions'), where('matchId', '==', matchId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Leaderboard

export function subscribeToLeaderboard(callback) {
  return onSnapshot(collection(db, 'predictions'), async (snap) => {
    const allPredictions = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const playersSnap = await getDocs(collection(db, 'players'))
    const players = playersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    const leaderboard = players.map((player) => {
      const playerPreds = allPredictions.filter((p) => p.playerId === player.id)
      const totalPoints = playerPreds.reduce((sum, p) => sum + (p.points || 0), 0)
      const exactScores = playerPreds.filter((p) => p.points === 3).length
      return {
        ...player,
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
  }, () => callback([]))
}

// Admin: Seed Matches

export async function seedMatches(matchesData) {
  const existing = await getDocs(collection(db, 'matches'))
  if (!existing.empty) {
    throw new Error(`Matches already seeded (${existing.size} matches exist). Clear Firestore first.`)
  }

  const BATCH_SIZE = 400
  for (let i = 0; i < matchesData.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    const chunk = matchesData.slice(i, i + BATCH_SIZE)
    chunk.forEach((match) => {
      const ref = doc(collection(db, 'matches'))
      batch.set(ref, {
        ...match,
        homeScore: null,
        awayScore: null,
        finished: false,
      })
    })
    await batch.commit()
  }
  return matchesData.length
}
