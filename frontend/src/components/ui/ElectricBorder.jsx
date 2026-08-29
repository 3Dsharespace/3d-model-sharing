import { useCallback, useEffect, useRef } from 'react'
import './ElectricBorder.css'

const ElectricBorder = ({
  children,
  color = '#a98bff',
  speed = 0.6,
  chaos = 0.05,
  borderRadius = 2,
  className = '',
  style
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const timeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  const random = useCallback((x) => (Math.sin(x * 12.9898) * 43758.5453) % 1, [])

  const noise2D = useCallback((x, y) => {
    const i = Math.floor(x)
    const j = Math.floor(y)
    const fx = x - i
    const fy = y - j

    const a = random(i + j * 57)
    const b = random(i + 1 + j * 57)
    const c = random(i + (j + 1) * 57)
    const d = random(i + 1 + (j + 1) * 57)
    const ux = fx * fx * (3 - 2 * fx)
    const uy = fy * fy * (3 - 2 * fy)

    return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy) + c * (1 - ux) * uy + d * ux * uy
  }, [random])

  const octavedNoise = useCallback((x, octaves, lacunarity, gain, baseAmplitude, baseFrequency, time, seed) => {
    let y = 0
    let amplitude = baseAmplitude
    let frequency = baseFrequency

    for (let i = 0; i < octaves; i += 1) {
      y += amplitude * noise2D(frequency * x + seed * 100, time * frequency * 0.3)
      frequency *= lacunarity
      amplitude *= gain
    }

    return y
  }, [noise2D])

  const getCornerPoint = useCallback((centerX, centerY, radius, startAngle, arcLength, progress) => {
    const angle = startAngle + progress * arcLength
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    }
  }, [])

  const getRoundedRectPoint = useCallback((t, left, top, width, height, radius) => {
    const straightWidth = width - 2 * radius
    const straightHeight = height - 2 * radius
    const cornerArc = (Math.PI * radius) / 2
    const totalPerimeter = 2 * straightWidth + 2 * straightHeight + 4 * cornerArc
    const distance = t * totalPerimeter
    let accumulated = 0

    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth
      return { x: left + radius + progress * straightWidth, y: top }
    }
    accumulated += straightWidth

    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      return getCornerPoint(left + width - radius, top + radius, radius, -Math.PI / 2, Math.PI / 2, progress)
    }
    accumulated += cornerArc

    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight
      return { x: left + width, y: top + radius + progress * straightHeight }
    }
    accumulated += straightHeight

    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      return getCornerPoint(left + width - radius, top + height - radius, radius, 0, Math.PI / 2, progress)
    }
    accumulated += cornerArc

    if (distance <= accumulated + straightWidth) {
      const progress = (distance - accumulated) / straightWidth
      return { x: left + width - radius - progress * straightWidth, y: top + height }
    }
    accumulated += straightWidth

    if (distance <= accumulated + cornerArc) {
      const progress = (distance - accumulated) / cornerArc
      return getCornerPoint(left + radius, top + height - radius, radius, Math.PI / 2, Math.PI / 2, progress)
    }
    accumulated += cornerArc

    if (distance <= accumulated + straightHeight) {
      const progress = (distance - accumulated) / straightHeight
      return { x: left, y: top + height - radius - progress * straightHeight }
    }

    const progress = (distance - accumulated) / cornerArc
    return getCornerPoint(left + radius, top + radius, radius, Math.PI, Math.PI / 2, progress)
  }, [getCornerPoint])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const octaves = 6
    const lacunarity = 1.55
    const gain = 0.62
    const frequency = 7
    const displacement = 18
    const borderOffset = 22

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      const width = rect.width + borderOffset * 2
      const height = rect.height + borderOffset * 2
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      return { width, height, dpr }
    }

    let { width, height, dpr: lastDpr } = updateSize()

    const drawElectricBorder = (currentTime) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (dpr !== lastDpr) {
        const next = updateSize()
        width = next.width
        height = next.height
        lastDpr = next.dpr
      }

      const deltaTime = (currentTime - lastFrameTimeRef.current) / 1000
      timeRef.current += Math.min(deltaTime, 0.05) * speed
      lastFrameTimeRef.current = currentTime

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const left = borderOffset
      const top = borderOffset
      const borderWidth = width - 2 * borderOffset
      const borderHeight = height - 2 * borderOffset
      const radius = Math.min(borderRadius, Math.min(borderWidth, borderHeight) / 2)
      const sampleCount = Math.max(40, Math.floor((2 * (borderWidth + borderHeight)) / 3))

      ctx.beginPath()
      for (let i = 0; i <= sampleCount; i += 1) {
        const progress = i / sampleCount
        const point = getRoundedRectPoint(progress, left, top, borderWidth, borderHeight, radius)
        const xNoise = reduceMotion ? 0 : octavedNoise(progress * 8, octaves, lacunarity, gain, chaos, frequency, timeRef.current, 0)
        const yNoise = reduceMotion ? 0 : octavedNoise(progress * 8, octaves, lacunarity, gain, chaos, frequency, timeRef.current, 1)
        const x = point.x + xNoise * displacement
        const y = point.y + yNoise * displacement

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()

      animationRef.current = requestAnimationFrame(drawElectricBorder)
    }

    const resizeObserver = new ResizeObserver(() => {
      const next = updateSize()
      width = next.width
      height = next.height
      lastDpr = next.dpr
    })

    resizeObserver.observe(container)
    animationRef.current = requestAnimationFrame(drawElectricBorder)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      resizeObserver.disconnect()
    }
  }, [borderRadius, chaos, color, getRoundedRectPoint, octavedNoise, speed])

  return (
    <div
      ref={containerRef}
      className={`electric-border ${className}`}
      style={{ '--electric-border-color': color, borderRadius, ...style }}
    >
      <div className="eb-canvas-container">
        <canvas ref={canvasRef} className="eb-canvas" />
      </div>
      <div className="eb-layers">
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-background-glow" />
      </div>
      <div className="eb-content">{children}</div>
    </div>
  )
}

export default ElectricBorder
