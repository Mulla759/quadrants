import { useEffect } from "react"
import { animateScribble, SCRIBBLE_HEIGHT } from "../../lib/scribble"
import { useInView } from "./useInView"

export function Scribble({
  width,
  className,
  delayMs = 250,
  durationMs = 650,
}: {
  width: number
  className?: string
  delayMs?: number
  durationMs?: number
}) {
  const { ref, inView } = useInView<HTMLCanvasElement>()

  useEffect(() => {
    if (!ref.current || !inView) return
    return animateScribble(ref.current, width, { delayMs, durationMs })
  }, [inView, width, delayMs, durationMs, ref])

  return (
    <canvas
      ref={ref}
      height={SCRIBBLE_HEIGHT}
      className={className}
      style={{ width, height: SCRIBBLE_HEIGHT }}
      aria-hidden
    />
  )
}
