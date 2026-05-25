import type { CSSProperties } from 'react'

type Star = {
  left: string
  top: string
  size: string
  opacity: number
  scale: number
  glow: number
  duration: string
  delay: string
}

const createStars = (count: number) => {
  const stars: Star[] = []
  let seed = 23

  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }

  const createStar = (left: number, top: number, edgeStar = false) => {
    const sizeRoll = random()
    const size = edgeStar
      ? 1.7 + sizeRoll * 0.7
      : sizeRoll < 0.72
        ? 0.75 + sizeRoll * 0.4
        : sizeRoll < 0.93
          ? 1.2 + sizeRoll * 0.5
          : 1.85 + sizeRoll * 0.9

    stars.push({
      left: `${left.toFixed(2)}%`,
      top: `${top.toFixed(2)}%`,
      size: `${size.toFixed(2)}px`,
      opacity: Number(
        (edgeStar ? 0.62 + random() * 0.24 : size > 1.8 ? 0.7 + random() * 0.18 : 0.38 + random() * 0.42).toFixed(2),
      ),
      scale: Number((size > 1.8 ? 0.9 + random() * 0.25 : 0.78 + random() * 0.3).toFixed(2)),
      glow: Number((size > 1.8 ? 0.22 + random() * 0.2 : 0.08 + random() * 0.18).toFixed(2)),
      duration: `${(4.5 + random() * 5.5).toFixed(2)}s`,
      delay: `${(-random() * 8).toFixed(2)}s`,
    })
  }

  const columns = 14
  const rows = 10
  const horizontalMargin = 1.5
  const verticalMargin = 1.5
  const availableWidth = 100 - horizontalMargin * 2
  const availableHeight = 100 - verticalMargin * 2
  const cellWidth = availableWidth / columns
  const cellHeight = availableHeight / rows

  createStar(1.2, 1.2, true)
  createStar(98.8, 1.4, true)
  createStar(1.4, 98.6, true)
  createStar(98.6, 98.8, true)
  createStar(50, 1.1, true)
  createStar(50, 98.9, true)
  createStar(1.1, 50, true)
  createStar(98.9, 50, true)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const baseLeft = horizontalMargin + (column + 0.5) * cellWidth
      const baseTop = verticalMargin + (row + 0.5) * cellHeight
      const jitterX = (random() - 0.5) * cellWidth * 0.72
      const jitterY = (random() - 0.5) * cellHeight * 0.72
      const left = Math.min(99.5, Math.max(0.5, baseLeft + jitterX))
      const top = Math.min(99.5, Math.max(0.5, baseTop + jitterY))

      createStar(left, top)

      if (stars.length >= count) {
        return stars.slice(0, count)
      }

      if (random() > 0.72) {
        const offsetLeft = Math.min(99.5, Math.max(0.5, left + (random() - 0.5) * cellWidth * 0.35))
        const offsetTop = Math.min(99.5, Math.max(0.5, top + (random() - 0.5) * cellHeight * 0.35))
        createStar(offsetLeft, offsetTop, random() > 0.9)

        if (stars.length >= count) {
          return stars.slice(0, count)
        }
      }
    }
  }

  while (stars.length < count) {
    const left = 1 + random() * 98
    const top = 1 + random() * 98
    createStar(left, top, random() > 0.94)
  }

  return stars.slice(0, count)
}

const stars = createStars(180)

function AuthStarfield() {
  return (
    <div className="auth-starfield" aria-hidden="true">
      {stars.map((star, index) => (
        <span
          key={index}
          className="auth-starfield__star"
          style={{
            '--star-opacity': star.opacity,
            '--star-scale': star.scale,
            '--star-glow': star.glow,
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDuration: star.duration,
            animationDelay: star.delay,
          } as CSSProperties & {
            '--star-opacity': number
            '--star-scale': number
            '--star-glow': number
          }}
        />
      ))}
    </div>
  )
}

export default AuthStarfield