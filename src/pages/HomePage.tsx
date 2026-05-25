import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAuth } from '../services/authService'
import { hasSeenIntro } from '../utils/introStorage'

function HomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!hasSeenIntro()) {
      navigate('/intro', { replace: true })
    }
  }, [navigate])

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  if (!hasSeenIntro()) {
    return null
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '1.5rem',
      }}
      aria-label="Home"
    >
      <button
        type="button"
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.9)',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Log out
      </button>
    </main>
  )
}

export default HomePage
