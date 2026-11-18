import { useEffect, useRef, useState } from "react"
import { Circle, CircleCheck } from "lucide-react"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"
import { Scribble } from "../ui/Scribble"
import { cn } from "../../lib/utils"
import { prefersReducedMotion } from "../../lib/scribble"

type DoneRow = {
  title: string
  done?: boolean
  dot: string
  meta: string
  scribbleWidth?: number
}

const ROWS: DoneRow[] = [
  { title: "Email recruiter back", done: true, dot: "#9A5C8F", meta: "Career · Done", scribbleWidth: 286 },
  { title: "Return library books", done: true, dot: "#4E8A7E", meta: "School · Done", scribbleWidth: 291 },
  { title: "Call grandma", dot: "#C05F45", meta: "Private · Sun" },
  { title: "Book dentist appointment", done: true, dot: "#BC5B6B", meta: "Health · Done", scribbleWidth: 365 },
  { title: "Outline research essay", dot: "#4E8A7E", meta: "School · Oct 12" },
]

// Position of each finished task in the completion sequence.
const DONE_ORDER = new Map(
  ROWS.filter((row) => row.done).map((row, index) => [row.title, index]),
)
const DONE_COUNT = DONE_ORDER.size

const ROW_STAGGER_MS = 60
const COMPLETE_START_MS = 450
const COMPLETE_STEP_MS = 420
const SCRIBBLE_DELAY_MS = 100
const SCRIBBLE_DURATION_MS = 600
const TOAST_DELAY_MS = COMPLETE_START_MS + Math.max(0, DONE_COUNT - 1) * COMPLETE_STEP_MS + 750

function useCompletionSequence(run: number, reduce: boolean) {
  const [revealed, setRevealed] = useState(0)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (run === 0) return
    if (reduce) {
      setRevealed(DONE_COUNT)
      setShowToast(true)
      return
    }
    setRevealed(0)
    setShowToast(false)
    const timers: number[] = []
    for (let i = 1; i <= DONE_COUNT; i++) {
      timers.push(
        window.setTimeout(() => setRevealed(i), COMPLETE_START_MS + (i - 1) * COMPLETE_STEP_MS),
      )
    }
    timers.push(window.setTimeout(() => setShowToast(true), TOAST_DELAY_MS))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [run, reduce])

  return { revealed, showToast }
}

// Reports every time the section enters the viewport, so the sequence can replay.
function useSectionPresence<T extends Element>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function KeyBox({ children }: { children: string }) {
  return (
    <div className="flex h-[24px] w-fit shrink-0 items-center justify-center rounded-[4px] border border-line bg-surface px-[8px]">
      <div className="whitespace-nowrap font-mono text-[12px] text-muted">{children}</div>
    </div>
  )
}

export function DoneSection() {
  const { ref, visible } = useSectionPresence<HTMLDivElement>()
  const [reduceMotion] = useState(() => prefersReducedMotion())
  const [runs, setRuns] = useState(0)
  useEffect(() => {
    if (visible) setRuns((run) => run + 1)
  }, [visible])
  const entered = reduceMotion || runs > 0
  const { revealed, showToast } = useCompletionSequence(runs, reduceMotion)

  return (
    <section className="w-full bg-bg">
      <Container className="flex flex-row flex-wrap items-center gap-[112px] py-[144px]">
        <div ref={ref} className="flex min-w-0 flex-1 flex-col gap-[28px]">
          <div className="flex w-full flex-col border-t border-line">
            {ROWS.map((row, rowIndex) => {
              const doneOrder = DONE_ORDER.get(row.title)
              const isDone = doneOrder !== undefined && revealed > doneOrder

              return (
                <div
                  key={row.title}
                  className={cn(
                    "relative flex h-[75.5px] w-full shrink-0 flex-row items-center gap-[18px] border-b border-line px-[8px] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
                    entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                  )}
                  style={{ transitionDelay: `${rowIndex * ROW_STAGGER_MS}ms` }}
                >
                  <span className="relative z-[1] flex h-[22px] w-[22px] shrink-0 items-center justify-center">
                    <Circle
                      size={22}
                      className={cn(
                        "absolute text-muted transition-opacity duration-200 motion-reduce:transition-none",
                        isDone && "opacity-0",
                      )}
                    />
                    <CircleCheck
                      size={22}
                      className={cn(
                        "absolute text-faint transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
                        isDone ? "scale-100 opacity-100" : "scale-75 opacity-0",
                      )}
                    />
                  </span>
                  <div
                    className={cn(
                      "whitespace-nowrap text-[30px] font-medium tracking-[-0.8px] transition-colors duration-300 motion-reduce:transition-none",
                      isDone ? "relative z-[1] text-faint" : "text-ink",
                    )}
                  >
                    {row.title}
                  </div>
                  <div className="flex-1" />
                  <div className="relative z-[3] flex w-fit shrink-0 flex-row items-center gap-[8px]">
                    <span
                      className="h-[7px] w-[7px] shrink-0 rounded-full"
                      style={{ backgroundColor: row.dot }}
                    />
                    <div className="whitespace-nowrap text-[14px] text-muted">{row.meta}</div>
                  </div>
                  {isDone && row.scribbleWidth !== undefined && (
                    <Scribble
                      width={row.scribbleWidth}
                      delayMs={SCRIBBLE_DELAY_MS}
                      durationMs={SCRIBBLE_DURATION_MS}
                      className="absolute left-[40px] top-[28px] z-[2]"
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div
            className={cn(
              "flex w-fit shrink-0 flex-row items-center gap-[14px] rounded-[8px] border border-line bg-surface p-[10px_12px_10px_14px] shadow-[0px_6px_20px_#0000000F] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
              showToast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
          >
            <CircleCheck size={16} className="shrink-0 text-muted" />
            <div className="whitespace-nowrap text-[14px] text-ink">
              Completed “Book dentist appointment”
            </div>
            <div className="whitespace-nowrap text-[14px] font-medium text-accent">Undo</div>
            <div className="flex h-[22px] w-fit shrink-0 items-center justify-center rounded-[4px] border border-line px-[7px]">
              <div className="whitespace-nowrap font-mono text-[12px] text-muted">⌘Z</div>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex w-[400px] shrink-0 flex-col gap-[28px] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
            entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          )}
          style={{ transitionDelay: "120ms" }}
        >
          <MonoLabel>03 · DONE</MonoLabel>
          <h2 className="whitespace-nowrap text-[52px]/[55px] font-semibold tracking-[-1.8px] text-ink">
            Cross it out.
          </h2>
          <p className="w-full text-[17px]/[27px] text-muted">
            Finishing a task draws a quick, hand-made scribble straight through it, the best part of
            paper, kept. You get five seconds to undo, and after a week done tasks quietly file
            themselves into the Archive.
          </p>
          <div className="flex w-fit shrink-0 flex-row items-center gap-[18px]">
            <div className="flex w-fit shrink-0 flex-row items-center gap-[8px]">
              <KeyBox>Space</KeyBox>
              <div className="whitespace-nowrap text-[14px] text-muted">complete</div>
            </div>
            <div className="flex w-fit shrink-0 flex-row items-center gap-[8px]">
              <KeyBox>⌘Z</KeyBox>
              <div className="whitespace-nowrap text-[14px] text-muted">undo</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
