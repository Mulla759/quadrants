export const SCRIBBLE_HEIGHT = 20
export const SCRIBBLE_SEGMENTS = 240
export const SCRIBBLE_LOOPS = 20
export const SCRIBBLE_MARGIN = 4
export const SCRIBBLE_STROKE = "#52525B"
export const SCRIBBLE_WIDTH = 1.2
export const SCRIBBLE_ALPHA = 0.85

export interface ScribblePoint {
  x: number
  y: number
}

export function scribblePoint(s: number, width: number, loops = SCRIBBLE_LOOPS): ScribblePoint {
  const x =
    SCRIBBLE_MARGIN +
    s * (width - SCRIBBLE_MARGIN * 2) +
    (2.8 + 0.6 * Math.sin(s * 29)) * Math.cos(6.2831853 * loops * s)
  const y =
    SCRIBBLE_HEIGHT / 2 +
    0.6 * Math.sin(s * 5) +
    (4.4 + (0.8 * Math.sin(s * 17 + 0.7) + 0.5 * Math.sin(s * 43 + 1.3))) *
      Math.sin(6.2831853 * loops * s)
  return { x, y }
}

export function scribblePath(width: number, progress: number, loops = SCRIBBLE_LOOPS): ScribblePoint[] {
  const total = Math.max(2, Math.round(SCRIBBLE_SEGMENTS * progress))
  const points: ScribblePoint[] = []
  for (let i = 0; i <= total; i++) {
    points.push(scribblePoint(i / SCRIBBLE_SEGMENTS, width, loops))
  }
  return points
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

export interface ScribbleOptions {
  delayMs?: number
  durationMs?: number
  loops?: number
  onComplete?: () => void
}

export function drawScribble(
  canvas: HTMLCanvasElement,
  width: number,
  progress: number,
  loops = SCRIBBLE_LOOPS,
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const dpr = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.round(SCRIBBLE_HEIGHT * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, SCRIBBLE_HEIGHT)
  if (progress <= 0) return

  const points = scribblePath(width, progress, loops)
  if (points.length < 2) return
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y)
  ctx.strokeStyle = SCRIBBLE_STROKE
  ctx.lineWidth = SCRIBBLE_WIDTH
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.globalAlpha = SCRIBBLE_ALPHA
  ctx.stroke()
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function animateScribble(
  canvas: HTMLCanvasElement,
  width: number,
  options: ScribbleOptions = {},
): () => void {
  const reduce = prefersReducedMotion()
  if (reduce) {
    drawScribble(canvas, width, 1, options.loops)
    options.onComplete?.()
    return () => undefined
  }

  const delay = options.delayMs ?? 400
  const duration = options.durationMs ?? 600
  let raf = 0
  let start = 0
  let cancelled = false

  const frame = (time: number) => {
    if (cancelled) return
    if (!start) start = time
    const elapsed = time - start
    const linear = Math.max(0, Math.min(1, (elapsed - delay) / duration))
    drawScribble(canvas, width, easeOutCubic(linear), options.loops)
    if (elapsed < delay + duration) {
      raf = requestAnimationFrame(frame)
    } else {
      options.onComplete?.()
    }
  }
  raf = requestAnimationFrame(frame)
  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
  }
}
