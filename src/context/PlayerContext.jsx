import { createContext, useContext, useState, useEffect } from 'react'
import { getPlayer } from '../services/supabase'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('wcp_player')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        getPlayer(parsed.id)
          .then((p) => {
            if (p) setPlayer(p)
            else localStorage.removeItem('wcp_player')
          })
          .catch(() => localStorage.removeItem('wcp_player'))
          .finally(() => setLoading(false))
      } catch {
        localStorage.removeItem('wcp_player')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  function login(playerData) {
    setPlayer(playerData)
    localStorage.setItem('wcp_player', JSON.stringify(playerData))
  }

  function logout() {
    setPlayer(null)
    localStorage.removeItem('wcp_player')
  }

  return (
    <PlayerContext.Provider value={{ player, loading, login, logout }}>
      {children}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  return useContext(PlayerContext)
}
