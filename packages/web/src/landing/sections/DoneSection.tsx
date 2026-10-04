import { useEffect, useRef } from "react"
import { Circle, CircleCheck } from "lucide-react"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"
import { cn } from "../../lib/utils"
import { drawScribble, SCRIBBLE_HEIGHT } from "../../lib/scribble"

function DoneScribble({ width, className }: { width: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) drawScribble(ref.current, width, 1)
  }, [width])
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

function KeyBox({ children }: { children: string }) {
  return (
    <div className="flex h-[24px] w-fit shrink-0 items-center justify-center rounded-[4px] border border-line bg-surface px-[8px]">
      <div className="whitespace-nowrap font-mono text-[12px] text-muted">{children}</div>
    </div>
  )
}

export function DoneSection() {
  return (
    <section className="w-full bg-bg">
      <Container className="flex flex-row items-center gap-[112px] py-[144px]">
        <div className="flex min-w-0 flex-1 flex-col gap-[28px]">
          <div className="flex w-full flex-col border-t border-line">
            {ROWS.map((row) => (
              <div
                key={row.title}
                className="relative flex h-[75.5px] w-full shrink-0 flex-row items-center gap-[18px] border-b border-line px-[8px]"
              >
                {row.done ? (
                  <CircleCheck size={22} className="relative z-[1] shrink-0 text-faint" />
                ) : (
                  <Circle size={22} className="shrink-0 text-muted" />
                )}
                <div
                  className={cn(
                    "whitespace-nowrap text-[30px] font-medium tracking-[-0.8px]",
                    row.done ? "relative z-[1] text-faint" : "text-ink",
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
                {row.done && row.scribbleWidth !== undefined && (
                  <DoneScribble
                    width={row.scribbleWidth}
                    className="absolute left-[40px] top-[28px] z-[2]"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex w-fit shrink-0 flex-row items-center gap-[14px] rounded-[8px] border border-line bg-surface p-[10px_12px_10px_14px] shadow-[0px_6px_20px_#0000000F]">
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

        <div className="flex w-[400px] shrink-0 flex-col gap-[28px]">
          <MonoLabel>03 — DONE</MonoLabel>
          <h2 className="whitespace-nowrap text-[52px]/[55px] font-semibold tracking-[-1.8px] text-ink">
            Cross it out.
          </h2>
          <p className="w-full text-[17px]/[27px] text-muted">
            Finishing a task draws a quick, hand-made scribble straight through it — the best part of
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
