import { useEffect, useState } from "react"
import { Circle, CircleCheck, Plus, RefreshCw } from "lucide-react"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"
import { Scribble } from "../ui/Scribble"
import { useInView } from "../ui/useInView"
import { cn } from "../../lib/utils"
import { prefersReducedMotion } from "../../lib/scribble"

const HEADLINE_LINE_1 = "Three things today."
const HEADLINE_LINE_2 = "Three just for you."
const HEADLINE_FULL = `${HEADLINE_LINE_1}\n${HEADLINE_LINE_2}`

// Timeline constants, measured from the moment the section enters the viewport.
const TYPE_MS = 38
const CARET_HOLD_MS = 900
const PARAGRAPH_DELAY_MS = 250
const STATS_START_MS = 450
const STATS_STAGGER_MS = 80
const CARD_DELAY_MS = 300
const PICKS_START_MS = 600
const PICKS_STAGGER_MS = 40
const ADD_PICK_DELAY_MS = 900
const SCRIBBLE_DELAY_MS = 350
const SCRIBBLE_DURATION_MS = 550

const STATS: { value: string; label: string; refresh?: boolean }[] = [
  { value: "3 / 3", label: "Top three: urgent and important, picked by you" },
  { value: "+ 3", label: "Side quests keep the rest of your life in the day" },
  { value: "", label: "Unfinished picks carry over until they’re done", refresh: true },
]

type Pick = {
  title: string
  index?: string
  done?: boolean
  dot?: string
  meta?: string
  scribbleWidth?: number
}

const TOP_THREE: Pick[] = [
  { title: "Finish landing page", index: "1", dot: "#5B7CBA", meta: "Website · Today" },
  { title: "Send project proposal", index: "2", dot: "#9A5C8F", meta: "Career · from Tue" },
  { title: "Clear out old downloads", index: "3", done: true, meta: "Done", scribbleWidth: 170 },
]

const SIDE_QUESTS: Pick[] = [
  { title: "Try the new coffee place", dot: "#B98A2F", meta: "Scouts · Sat" },
  { title: "Call grandma", dot: "#C05F45", meta: "Private · Sun" },
]

function TypeCaret({ dimmed }: { dimmed: boolean }) {
  return (
    <span
      className={cn(
        "ml-[2px] inline-block align-[-5px] transition-opacity duration-300 ease-out motion-reduce:transition-none",
        dimmed && "opacity-0",
      )}
    >
      <span className="caret-blink-slow block h-[44px] w-[2px] bg-ink" />
    </span>
  )
}

function PickRow({
  index,
  title,
  done,
  dot,
  meta,
  scribbleWidth,
  entered,
  delay,
}: Pick & { entered: boolean; delay: number }) {
  return (
    <div
      className={cn(
        "relative flex h-[30px] w-full shrink-0 flex-row items-center gap-[8px] rounded-[4px] px-[8px] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {index && (
        <div
          className={cn(
            "whitespace-nowrap font-mono text-[11px] text-faint",
            done && "relative z-[1]",
          )}
        >
          {index}
        </div>
      )}
      {done ? (
        <CircleCheck size={15} className="relative z-[1] shrink-0 text-faint" />
      ) : (
        <Circle size={15} className="shrink-0 text-muted" />
      )}
      <div
        className={cn(
          "min-w-0 flex-1 truncate text-[14px]",
          done ? "relative z-[1] text-faint" : "text-ink",
        )}
      >
        {title}
      </div>
      {dot && (
        <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ backgroundColor: dot }} />
      )}
      {meta && (
        <div className={cn("whitespace-nowrap text-[11px] text-muted", done && "relative z-[2]")}>
          {meta}
        </div>
      )}
      {done && scribbleWidth !== undefined && (
        <Scribble
          width={scribbleWidth}
          delayMs={SCRIBBLE_DELAY_MS}
          durationMs={SCRIBBLE_DURATION_MS}
          className="absolute left-[27px] top-[5px] z-[1]"
        />
      )}
    </div>
  )
}

function AddPick({ entered, reduce }: { entered: boolean; reduce: boolean }) {
  return (
    <div
      className={cn(
        "flex h-[30px] w-full shrink-0 flex-row items-center gap-[8px] px-[8px] transition-opacity duration-500 ease-out motion-reduce:transition-none",
        entered ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDelay: `${ADD_PICK_DELAY_MS}ms` }}
    >
      <Plus
        size={15}
        className={cn(
          "shrink-0 text-faint transition-transform duration-300 ease-out motion-reduce:transition-none",
          entered ? "scale-100" : "scale-[0.8]",
        )}
        style={{ transitionDelay: `${ADD_PICK_DELAY_MS}ms` }}
      />
      <div className="whitespace-nowrap text-[14px] text-faint">
        Add pick
        {!reduce && <span className="caret-blink-slow ml-[3px] inline-block h-[13px] w-[1.5px] bg-faint" />}
      </div>
    </div>
  )
}

function GroupHeader({
  title,
  count,
  subtitle,
  entered,
  delay,
}: {
  title: string
  count: string
  subtitle: string
  entered: boolean
  delay: number
}) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-col gap-[2px] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex w-fit shrink-0 flex-row items-center gap-[8px]">
        <div className="whitespace-nowrap text-[13px] font-medium text-ink">{title}</div>
        <div className="whitespace-nowrap font-mono text-[11px] text-faint">{count}</div>
      </div>
      <div className="whitespace-nowrap text-[11px] text-faint">{subtitle}</div>
    </div>
  )
}

export function TodaySection() {
  const { ref, inView } = useInView<HTMLElement>()
  const [reduceMotion] = useState(() => prefersReducedMotion())
  const [typedCount, setTypedCount] = useState(0)
  const [caretDimmed, setCaretDimmed] = useState(false)

  useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setTypedCount(HEADLINE_FULL.length)
      return
    }
    let count = 0
    const interval = window.setInterval(() => {
      count += 1
      setTypedCount(count)
      if (count >= HEADLINE_FULL.length) window.clearInterval(interval)
    }, TYPE_MS)
    const hold = window.setTimeout(
      () => setCaretDimmed(true),
      HEADLINE_FULL.length * TYPE_MS + CARET_HOLD_MS,
    )
    return () => {
      window.clearInterval(interval)
      window.clearTimeout(hold)
    }
  }, [inView, reduceMotion])

  const entered = reduceMotion || inView
  const caretOnLine1 = typedCount <= HEADLINE_LINE_1.length
  const line1Typed = HEADLINE_FULL.slice(0, Math.min(typedCount, HEADLINE_LINE_1.length))
  const line2Typed =
    typedCount > HEADLINE_LINE_1.length
      ? HEADLINE_FULL.slice(HEADLINE_LINE_1.length + 1, typedCount)
      : ""

  return (
    <section ref={ref} id="today" className="w-full scroll-mt-[72px] bg-sidebar">
      <Container className="flex flex-row flex-wrap items-center gap-[96px] py-[136px]">
        <div className="flex w-[440px] shrink-0 flex-col gap-[28px]">
          <MonoLabel>02 · TODAY</MonoLabel>
          <h2
            className="relative w-full text-[48px]/[52px] font-semibold tracking-[-1.6px] text-ink"
            aria-label={`${HEADLINE_LINE_1} ${HEADLINE_LINE_2}`}
          >
            <span className={cn(!reduceMotion && "invisible")}>
              {HEADLINE_LINE_1}
              <br />
              {HEADLINE_LINE_2}
            </span>
            {!reduceMotion && (
              <span className="absolute inset-0" aria-hidden="true">
                {line1Typed}
                {caretOnLine1 && <TypeCaret dimmed={caretDimmed} />}
                <br />
                {line2Typed}
                {!caretOnLine1 && <TypeCaret dimmed={caretDimmed} />}
              </span>
            )}
          </h2>
          <p
            className={cn(
              "w-full text-[17px]/[27px] text-muted transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
              entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
            style={{ transitionDelay: `${PARAGRAPH_DELAY_MS}ms` }}
          >
            Each morning, pull up to three priorities off the map, plus three side quests for rest,
            play and people. Whatever you don’t finish carries over until it’s done. No pile-up, no
            guilt.
          </p>
          <div className="flex w-full flex-col pt-[8px]">
            {STATS.map((stat, statIndex) => (
              <div
                key={stat.label}
                className={cn(
                  "flex w-full flex-row items-center gap-[16px] border-t border-line py-[14px] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
                  entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
                )}
                style={{ transitionDelay: `${STATS_START_MS + statIndex * STATS_STAGGER_MS}ms` }}
              >
                {stat.refresh ? (
                  <div className="flex w-[56px] shrink-0 flex-row items-center">
                    <RefreshCw size={15} className="shrink-0 text-ink" />
                  </div>
                ) : (
                  <div className="w-[56px] shrink-0 font-mono text-[13px] text-ink">
                    {stat.value}
                  </div>
                )}
                <div className="flex-1 text-[15px] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-[28px] rounded-[10px] border border-line bg-surface p-[32px_32px_24px] shadow-[0px_12px_40px_#0000000A] transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none",
            entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
          style={{ transitionDelay: `${CARD_DELAY_MS}ms` }}
        >
          <div className="flex w-full shrink-0 flex-col gap-[2px]">
            <div className="whitespace-nowrap text-[20px] font-semibold text-ink">Today</div>
            <div className="whitespace-nowrap text-[13px] text-muted">
              Wednesday, October 1 · picks stay until done
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-[24px]">
            <div className="flex w-full shrink-0 flex-col gap-[12px]">
              <GroupHeader
                title="Top three"
                count="3 / 3"
                subtitle="Urgent + important. Pick up to three"
                entered={entered}
                delay={PICKS_START_MS}
              />
              <div className="flex w-full shrink-0 flex-col gap-[2px]">
                {TOP_THREE.map((pick, pickIndex) => (
                  <PickRow
                    key={pick.title}
                    {...pick}
                    entered={entered}
                    delay={PICKS_START_MS + (1 + pickIndex) * PICKS_STAGGER_MS}
                  />
                ))}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-[12px]">
              <GroupHeader
                title="Side quests"
                count="2 / 3"
                subtitle="Rest, play, people. Keep the day balanced"
                entered={entered}
                delay={PICKS_START_MS + 4 * PICKS_STAGGER_MS}
              />
              <div className="flex w-full shrink-0 flex-col gap-[2px]">
                {SIDE_QUESTS.map((pick, pickIndex) => (
                  <PickRow
                    key={pick.title}
                    {...pick}
                    entered={entered}
                    delay={PICKS_START_MS + (5 + pickIndex) * PICKS_STAGGER_MS}
                  />
                ))}
                <AddPick entered={entered} reduce={reduceMotion} />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
