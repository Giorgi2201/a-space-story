import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const STAR_COUNT = 2000
const SPREAD_X = 1400
const SPREAD_Y = 900
const WARP_DURATION_MS = 3000
const WARP_MAX_SPEED = 300
const BACKGROUND = 0x0a0a0f

export type StarFieldProps = {
  speed: number
  warping?: boolean
  onWarpComplete?: () => void
  zIndex?: number
  className?: string
}

type Star = {
  x: number
  y: number
  z: number
}

function createStar(): Star {
  return {
    x: (Math.random() - 0.5) * SPREAD_X * 2,
    y: (Math.random() - 0.5) * SPREAD_Y * 2,
    z: Math.random() * 2000 - 2000,
  }
}

function resetStar(star: Star): void {
  const fresh = createStar()
  star.x = fresh.x
  star.y = fresh.y
  star.z = fresh.z
}

function StarField({
  speed,
  warping = false,
  onWarpComplete,
  zIndex = 0,
  className,
}: StarFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const speedRef = useRef(speed)
  const warpingRef = useRef(warping)
  const onWarpCompleteRef = useRef(onWarpComplete)
  const warpCompleteFiredRef = useRef(false)

  speedRef.current = speed
  warpingRef.current = warping
  onWarpCompleteRef.current = onWarpComplete

  useEffect(() => {
    if (!warping) {
      warpCompleteFiredRef.current = false
    }
  }, [warping])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(BACKGROUND)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      4000,
    )
    camera.position.z = 1000

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const canvas = renderer.domElement
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    container.appendChild(canvas)

    const stars: Star[] = Array.from({ length: STAR_COUNT }, createStar)

    const pointPositions = new Float32Array(STAR_COUNT * 3)
    const pointsGeometry = new THREE.BufferGeometry()
    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3))

    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })

    const points = new THREE.Points(pointsGeometry, pointsMaterial)
    scene.add(points)

    const linePositions = new Float32Array(STAR_COUNT * 6)
    const linesGeometry = new THREE.BufferGeometry()
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))

    const linesMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
    })

    const lines = new THREE.LineSegments(linesGeometry, linesMaterial)
    lines.visible = false
    scene.add(lines)

    let currentSpeed = speedRef.current
    let warpStartTime: number | null = null
    let warpFromSpeed = currentSpeed
    let animationId = 0

    const updatePoints = () => {
      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i]
        star.z += currentSpeed

        if (star.z > 1000) {
          resetStar(star)
        }

        const i3 = i * 3
        pointPositions[i3] = star.x
        pointPositions[i3 + 1] = star.y
        pointPositions[i3 + 2] = star.z
      }

      pointsGeometry.attributes.position.needsUpdate = true
    }

    const updateLines = () => {
      const trailLength = 35 + currentSpeed * 1.6
      const brightness = Math.min(currentSpeed / WARP_MAX_SPEED, 1)
      linesMaterial.opacity = 0.35 + brightness * 0.65

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i]
        star.z += currentSpeed

        if (star.z > 1000) {
          resetStar(star)
        }

        const base = i * 6
        linePositions[base] = star.x
        linePositions[base + 1] = star.y
        linePositions[base + 2] = star.z - trailLength
        linePositions[base + 3] = star.x
        linePositions[base + 4] = star.y
        linePositions[base + 5] = star.z
      }

      linesGeometry.attributes.position.needsUpdate = true
    }

    const animate = (now: number) => {
      const isWarping = warpingRef.current

      if (isWarping) {
        if (warpStartTime === null) {
          warpStartTime = now
          warpFromSpeed = currentSpeed
          warpCompleteFiredRef.current = false
        }

        const elapsed = now - warpStartTime
        const t = Math.min(elapsed / WARP_DURATION_MS, 1)
        currentSpeed = warpFromSpeed + (WARP_MAX_SPEED - warpFromSpeed) * t

        points.visible = false
        lines.visible = true
        updateLines()

        if (t >= 1 && !warpCompleteFiredRef.current) {
          warpCompleteFiredRef.current = true
          onWarpCompleteRef.current?.()
        }
      } else {
        warpStartTime = null
        currentSpeed = speedRef.current
        points.visible = true
        lines.visible = false
        updatePoints()
      }

      renderer.render(scene, camera)
      animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      pointsGeometry.dispose()
      pointsMaterial.dispose()
      linesGeometry.dispose()
      linesMaterial.dispose()
      renderer.dispose()
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex,
        pointerEvents: 'none',
      }}
    />
  )
}

export default StarField
