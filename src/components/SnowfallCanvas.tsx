import { useEffect, useRef } from 'react'

type Snowflake = {
  x: number
  y: number
  radius: number
  speed: number
  sway: number
  swayPhase: number
  opacity: number
  glyph: string
}

const FLAKE_COUNT = 18

function createFlake(width: number, height: number): Snowflake {
  const useAsterisk = Math.random() > 0.65
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: 0.8 + Math.random() * 1.2,
    speed: 0.25 + Math.random() * 0.45,
    sway: 0.15 + Math.random() * 0.35,
    swayPhase: Math.random() * Math.PI * 2,
    opacity: 0.45 + Math.random() * 0.2,
    glyph: useAsterisk ? '*' : '•',
  }
}

type SnowfallCanvasProps = {
  className?: string
}

function SnowfallCanvas({ className }: SnowfallCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flakesRef = useRef<Snowflake[]>([])
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.floor(rect.width * dpr)
      canvas.height = Math.floor(rect.height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      if (flakesRef.current.length === 0) {
        flakesRef.current = Array.from({ length: FLAKE_COUNT }, () => createFlake(rect.width, rect.height))
      }
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)

    const draw = (time: number) => {
      const rect = canvas.getBoundingClientRect()
      context.clearRect(0, 0, rect.width, rect.height)
      context.fillStyle = '#ffffff'
      context.textAlign = 'center'
      context.textBaseline = 'middle'

      for (const flake of flakesRef.current) {
        flake.y += flake.speed
        flake.x += Math.sin(time * 0.001 + flake.swayPhase) * flake.sway

        if (flake.y > rect.height + 8) {
          flake.y = -8
          flake.x = Math.random() * rect.width
        }

        if (flake.x < -8) {
          flake.x = rect.width + 8
        } else if (flake.x > rect.width + 8) {
          flake.x = -8
        }

        context.globalAlpha = flake.opacity
        if (flake.glyph === '*') {
          context.font = `${flake.radius * 5}px Cinzel, serif`
          context.fillText('*', flake.x, flake.y)
        } else {
          context.beginPath()
          context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2)
          context.fill()
        }
      }

      context.globalAlpha = 1
      frameRef.current = requestAnimationFrame(draw)
    }

    frameRef.current = requestAnimationFrame(draw)

    return () => {
      resizeObserver.disconnect()
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}

export default SnowfallCanvas
