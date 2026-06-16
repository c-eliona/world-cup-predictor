import { Link, useLocation } from 'react-router-dom'
import { usePlayer } from '../context/PlayerContext'

export default function Navbar() {
  const { player, logout } = usePlayer()
  const location = useLocation()

  const isActive = (path) =>
    location.pathname === path
      ? 'text-emerald-400 border-b-2 border-emerald-400'
      : 'text-gray-400 hover:text-white'

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 font-bold text-white text-lg">
          <span>🏆</span>
          <span className="hidden sm:inline">WC 2026</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          {player && (
            <>
              <Link to="/predictions" className={`text-sm font-medium pb-1 ${isActive('/predictions')}`}>
                Predict
              </Link>
            </>
          )}
          <Link to="/leaderboard" className={`text-sm font-medium pb-1 ${isActive('/leaderboard')}`}>
            Leaderboard
          </Link>
          <Link to="/admin" className={`text-sm font-medium pb-1 ${isActive('/admin')}`}>
            Admin
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {player ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-emerald-400 font-medium hidden sm:inline">
                👤 {player.name}
              </span>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                Leave
              </button>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Not playing</span>
          )}
        </div>
      </div>
    </nav>
  )
}
