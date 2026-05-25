import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const STAR_COUNT = 2000
const ANIMATION_MS = 3000
const FADE_MS = 500
const SPREAD_X = 1400
const SPREAD_Y = 900

type HyperspaceCanvasProps = {
  onComplete: () => void
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

function HyperspaceCanvas({ onComplete }: HyperspaceCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      3000,
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
    const positions = new Float32Array(STAR_COUNT * 6)
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
    })

    const lineSegments = new THREE.LineSegments(geometry, material)
    scene.add(lineSegments)

    let speed = 5
    const startTime = performance.now()
    let animationId = 0
    let fadeStarted = false
    let fadeFinished = false

    const updateStarPositions = () => {
      const trailLength = 25 + speed * 2.2
      const brightness = Math.min(speed / 80, 1)
      material.opacity = 0.25 + brightness * 0.75

      for (let i = 0; i < STAR_COUNT; i++) {
        const star = stars[i]
        star.z += speed

        if (star.z > 1000) {
          const reset = createStar()
          star.x = reset.x
          star.y = reset.y
          star.z = reset.z
        }

        const base = i * 6
        positions[base] = star.x
        positions[base + 1] = star.y
        positions[base + 2] = star.z - trailLength
        positions[base + 3] = star.x
        positions[base + 4] = star.y
        positions[base + 5] = star.z
      }

      geometry.attributes.position.needsUpdate = true
    }

    const finishFade = () => {
      if (fadeFinished) {
        return
      }
      fadeFinished = true
      onCompleteRef.current()
    }

    const startFade = () => {
      if (fadeStarted) {
        return
      }
      fadeStarted = true
      canvas.style.transition = `opacity ${FADE_MS}ms ease`
      requestAnimationFrame(() => {
        canvas.style.opacity = '0'
      })

      window.setTimeout(finishFade, FADE_MS + 50)
    }

    const animate = (now: number) => {
      const elapsed = now - startTime

      if (!fadeStarted && elapsed >= ANIMATION_MS) {
        startFade()
      }

      if (!fadeFinished) {
        if (!fadeStarted) {
          speed = Math.min(speed + 0.5, 80)
          updateStarPositions()
        }
        renderer.render(scene, camera)
      }

      if (!fadeFinished) {
        animationId = requestAnimationFrame(animate)
      }
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
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (container.contains(canvas)) {
        container.removeChild(canvas)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: '#000000',
      }}
    />
  )
}

export default HyperspaceCanvas
