import type { CSSProperties } from 'react'

type Star = {
  left: string
  top: string
  size: string
  opacity: number
  duration: string
  delay: string
}

function createStars(count: number): Star[] {
  const stars: Star[] = []
  let seed = 41

  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  for (let i = 0; i < count; i += 1) {
    const left = 2 + random() * 96
    const top = 2 + random() * 76
    const sizeRoll = random()
    const size =
      sizeRoll < 0.7 ? 0.7 + random() * 0.7 : sizeRoll < 0.92 ? 1.1 + random() * 0.6 : 1.8 + random() * 0.9

    stars.push({
      left: `${left.toFixed(2)}%`,
      top: `${top.toFixed(2)}%`,
      size: `${size.toFixed(2)}px`,
      opacity: Number((0.3 + random() * 0.55).toFixed(2)),
      duration: `${(3.5 + random() * 7).toFixed(2)}s`,
      delay: `${(-random() * 12).toFixed(2)}s`,
    })
  }

  return stars
}

const stars = createStars(220)

function NightSkyStars() {
  return (
    <div className="night-sky-stars" aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          className="night-sky-stars__star"
          style={
            {
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              '--star-base-opacity': star.opacity,
              animationDuration: star.duration,
              animationDelay: star.delay,
            } as CSSProperties & { '--star-base-opacity': number }
          }
        />
      ))}
    </div>
  )
}

export default NightSkyStars
