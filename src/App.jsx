import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './context/PlayerContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Predictions from './pages/Predictions'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-950">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </PlayerProvider>
  )
}
