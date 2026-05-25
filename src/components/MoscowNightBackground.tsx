import NightSkyStars from './NightSkyStars'

type MoscowNightBackgroundProps = {
  chapter2Active?: boolean
}

function MoscowNightBackground({ chapter2Active = false }: MoscowNightBackgroundProps) {
  return (
    <div className="moscow-night" aria-hidden="true">
      <div className={`moscow-night__sky ${chapter2Active ? 'moscow-night__sky--fade' : ''}`} />
      <div className={`moscow-night__clouds ${chapter2Active ? 'moscow-night__clouds--fade' : ''}`} />
      <div className={`moscow-night__stars ${chapter2Active ? 'moscow-night__stars--fade' : ''}`}>
        <NightSkyStars />
      </div>
      <div className={`moscow-night__moon ${chapter2Active ? 'moscow-night__moon--fade' : ''}`}>
        <svg className="moscow-night__moon-svg" viewBox="0 0 80 80" aria-hidden="true">
          <defs>
            <radialGradient id="laika-crescent-moon" cx="22%" cy="30%" r="78%">
              <stop offset="0%" stopColor="#fafaff" />
              <stop offset="45%" stopColor="#e8e8f0" />
              <stop offset="100%" stopColor="#c8cad4" />
            </radialGradient>
          </defs>
          <path
            fill="url(#laika-crescent-moon)"
            d="M 40 6
               A 34 34 0 1 1 40 74
               A 27 34 0 1 0 40 6
               Z"
          />
          <ellipse cx="26" cy="28" rx="3.5" ry="2.8" fill="#d4d4de" opacity="0.28" />
          <ellipse cx="30" cy="48" rx="2.5" ry="2" fill="#ccccd6" opacity="0.22" />
        </svg>
      </div>
      <div
        className={`moscow-night__chapter2 ${chapter2Active ? 'moscow-night__chapter2--visible' : ''}`}
      />
    </div>
  )
}

export default MoscowNightBackground
