import { useEffect, useRef } from "react"
import { Circle, CircleCheck, Plus, RefreshCw } from "lucide-react"
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

const STATS: { value: string; label: string; refresh?: boolean }[] = [
  { value: "3 / 3", label: "Top three — urgent and important, picked by you" },
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

function PickRow({ index, title, done, dot, meta, scribbleWidth }: Pick) {
  return (
    <div className="relative flex h-[30px] w-full shrink-0 flex-row items-center gap-[8px] rounded-[4px] px-[8px]">
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
        <DoneScribble width={scribbleWidth} className="absolute left-[27px] top-[5px] z-[1]" />
      )}
    </div>
  )
}

function AddPick() {
  return (
    <div className="flex h-[30px] w-full shrink-0 flex-row items-center gap-[8px] px-[8px]">
      <Plus size={15} className="shrink-0 text-faint" />
      <div className="whitespace-nowrap text-[14px] text-faint">Add pick</div>
    </div>
  )
}

function GroupHeader({
  title,
  count,
  subtitle,
}: {
  title: string
  count: string
  subtitle: string
}) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-[2px]">
      <div className="flex w-fit shrink-0 flex-row items-center gap-[8px]">
        <div className="whitespace-nowrap text-[13px] font-medium text-ink">{title}</div>
        <div className="whitespace-nowrap font-mono text-[11px] text-faint">{count}</div>
      </div>
      <div className="whitespace-nowrap text-[11px] text-faint">{subtitle}</div>
    </div>
  )
}

export function TodaySection() {
  return (
    <section id="today" className="w-full scroll-mt-[72px] bg-sidebar">
      <Container className="flex flex-row items-center gap-[96px] py-[136px]">
        <div className="flex w-[440px] shrink-0 flex-col gap-[28px]">
          <MonoLabel>02 — TODAY</MonoLabel>
          <h2 className="w-full text-[48px]/[52px] font-semibold tracking-[-1.6px] text-ink">
            Three things today.
            <br />
            Three just for you.
          </h2>
          <p className="w-full text-[17px]/[27px] text-muted">
            Each morning, pull up to three priorities off the map — plus three side quests for rest,
            play and people. Whatever you don’t finish carries over until it’s done. No pile-up, no
            guilt.
          </p>
          <div className="flex w-full flex-col pt-[8px]">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex w-full flex-row items-center gap-[16px] border-t border-line py-[14px]"
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

        <div className="flex min-w-0 flex-1 flex-col gap-[28px] rounded-[10px] border border-line bg-surface p-[32px_32px_24px] shadow-[0px_12px_40px_#0000000A]">
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
                subtitle="Urgent + important — pick up to three"
              />
              <div className="flex w-full shrink-0 flex-col gap-[2px]">
                {TOP_THREE.map((pick) => (
                  <PickRow key={pick.title} {...pick} />
                ))}
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-[12px]">
              <GroupHeader
                title="Side quests"
                count="2 / 3"
                subtitle="Rest, play, people — keep the day balanced"
              />
              <div className="flex w-full shrink-0 flex-col gap-[2px]">
                {SIDE_QUESTS.map((pick) => (
                  <PickRow key={pick.title} {...pick} />
                ))}
                <AddPick />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
