import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StarField from '../components/StarField'
import { getFirstName } from '../services/authService'
import { hasSeenIntro } from '../utils/introStorage'
import { hasLaikaMissionStarted } from '../utils/missionStorage'
import '../styles/dashboard-page.css'

const LAIKA_IMAGE_URL =
  'https://www.fai.org/sites/default/files/styles/article_detail_xxlarge/public/sport/image/laika-in-sputnik-2-1957-foto.jpg?itok=6b5ELEZo'

const STAR_SPEED_START = 80
const STAR_SPEED_END = 1.5
const STAR_DECEL_MS = 3000
const CONTENT_EMERGE_DELAY_MS = 500
const CONTENT_EMERGE_DURATION_MS = 2500

function getInitials(firstName: string | null): string {
  if (!firstName?.trim()) {
    return '?'
  }

  const parts = firstName.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return firstName.trim().slice(0, 2).toUpperCase()
}

type MissionBriefingModalProps = {
  onClose: () => void
}

function MissionBriefingModal({ onClose }: MissionBriefingModalProps) {
  const hasStarted = hasLaikaMissionStarted()

  return (
    <div
      className="dashboard-modal-backdrop"
      role="presentation"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose()
        }
      }}
    >
      <div
        className="dashboard-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mission-briefing-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="mission-briefing-title" className="dashboard-modal__title">
          Mission: Laika
        </h2>
        <p className="dashboard-modal__description">
          1957. A stray dog from the streets of Moscow is about to become the first living creature
          to orbit Earth. Her name is Laika. This is her story — and your first mission.
        </p>
        <div className="dashboard-modal__divider" />
        <p className="dashboard-modal__section-label">What you will practice:</p>
        <ul className="dashboard-modal__list">
          <li>Arrays</li>
          <li>Functions</li>
          <li>Loops</li>
        </ul>
        <p className="dashboard-modal__time">Estimated time: 20-30 minutes</p>
        <button type="button" className="dashboard-modal__launch">
          {hasStarted ? 'Continue Mission' : 'Launch Mission'}
        </button>
      </div>
    </div>
  )
}

function DashboardPage() {
  const navigate = useNavigate()
  const firstName = getFirstName()
  const initials = useMemo(() => getInitials(firstName), [firstName])

  const [starSpeed, setStarSpeed] = useState(STAR_SPEED_START)
  const [briefingOpen, setBriefingOpen] = useState(false)

  useEffect(() => {
    if (!hasSeenIntro()) {
      navigate('/intro', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const startTime = performance.now()
    let animationId = 0

    const decelerateStars = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / STAR_DECEL_MS, 1)
      const eased = 1 - (1 - progress) ** 3
      setStarSpeed(STAR_SPEED_START + (STAR_SPEED_END - STAR_SPEED_START) * eased)

      if (progress < 1) {
        animationId = requestAnimationFrame(decelerateStars)
      }
    }

    animationId = requestAnimationFrame(decelerateStars)

    return () => cancelAnimationFrame(animationId)
  }, [])

  if (!hasSeenIntro()) {
    return null
  }

  return (
    <div className="dashboard-page">
      <StarField speed={starSpeed} warping={false} zIndex={0} />

      <div
        className="dashboard-page__content"
        style={{
          animationDelay: `${CONTENT_EMERGE_DELAY_MS}ms`,
          animationDuration: `${CONTENT_EMERGE_DURATION_MS}ms`,
        }}
      >
        <header className="dashboard-header">
          <h1 className="dashboard-title">A Space Story</h1>
          <button type="button" className="dashboard-profile" aria-label="User profile">
            {initials}
          </button>
        </header>

        <main className="dashboard-main">
          <div className="dashboard-grid">
            <button
              type="button"
              className="dashboard-card dashboard-card--laika"
              onClick={() => setBriefingOpen(true)}
            >
              <div
                className="dashboard-card__image"
                style={{ backgroundImage: `url("${LAIKA_IMAGE_URL}")` }}
              />
              <div className="dashboard-card__gradient" aria-hidden="true" />
              <div className="dashboard-card__text">
                <h3 className="dashboard-card__title">Laika</h3>
                <p className="dashboard-card__subtitle">Practicing: Arrays, Functions, Loops</p>
              </div>
            </button>

            {Array.from({ length: 5 }, (_, index) => (
              <div key={`locked-${index + 2}`} className="dashboard-card dashboard-card--locked" aria-hidden="true">
                <span className="dashboard-card__mystery">?</span>
              </div>
            ))}
          </div>
        </main>
      </div>

      {briefingOpen ? <MissionBriefingModal onClose={() => setBriefingOpen(false)} /> : null}
    </div>
  )
}

export default DashboardPage
