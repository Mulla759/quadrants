import { useEffect, useState, type ReactNode } from "react"
import {
  Archive,
  ArrowDown,
  ArrowUp,
  Circle,
  CircleCheck,
  Command,
  Ellipsis,
  Grid2x2,
  GripVertical,
  Hash,
  Inbox,
  LayoutGrid,
  Moon,
  PanelLeft,
  Plus,
  Search,
  Settings,
  Sun,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Scribble } from "../ui/Scribble"
import { useInView } from "../ui/useInView"

function SidebarRow({
  icon,
  label,
  trailing,
  active,
  accent,
}: {
  icon: ReactNode
  label: string
  trailing?: string
  active?: boolean
  accent?: boolean
}) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 items-center justify-between gap-[10px] rounded-[4px] p-[6px_8px]",
        active && "bg-[#E9E9E6]",
      )}
    >
      <div className="flex w-fit shrink-0 items-center gap-[10px]">
        {icon}
        <div
          className={cn(
            "whitespace-nowrap text-[14px]",
            active ? "font-medium text-ink" : accent ? "font-medium text-ink" : "text-[#3F3F46]",
          )}
        >
          {label}
        </div>
      </div>
      {trailing && <div className="whitespace-nowrap text-[11px] text-faint">{trailing}</div>}
    </div>
  )
}

type QuadTaskProps = {
  title: string
  done?: boolean
  selected?: "hover" | "select"
  accentCircle?: boolean
  grip?: boolean
  dot?: string
  meta?: string
  ellipsis?: boolean
  scribbleWidth?: number
}

function QuadTask({
  title,
  done,
  selected,
  accentCircle,
  grip,
  dot,
  meta,
  ellipsis,
  scribbleWidth,
}: QuadTaskProps) {
  return (
    <div
      className={cn(
        "relative flex h-[30px] w-full shrink-0 items-center gap-[8px] rounded-[4px] px-[8px]",
        grip && "pl-[2px]",
        selected === "hover" && "bg-hover",
        selected === "select" && "bg-selected",
      )}
    >
      {grip && <GripVertical size={14} className="shrink-0 text-faint" />}
      {done ? (
        <CircleCheck size={15} className="relative z-[1] shrink-0 text-faint" />
      ) : (
        <Circle size={15} className={cn("shrink-0", accentCircle ? "text-accent" : "text-muted")} />
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
      {meta && <div className="shrink-0 whitespace-nowrap text-[11px] text-muted">{meta}</div>}
      {ellipsis && <Ellipsis size={16} className="shrink-0 text-muted" />}
      {done && scribbleWidth !== undefined && (
        <Scribble width={scribbleWidth} className="absolute left-[27px] top-[5px] z-[2]" />
      )}
    </div>
  )
}

function AddTask() {
  return (
    <div className="flex h-[30px] w-full shrink-0 items-center gap-[8px] px-[8px]">
      <Plus size={15} className="shrink-0 text-faint" />
      <div className="whitespace-nowrap text-[14px] text-faint">New task</div>
    </div>
  )
}

const DEMO_TITLE = "Clear out old downloads"
const DEMO_SCRIBBLE_WIDTH = 174

type DemoPhase = "typing" | "pause" | "saved" | "done"

function InlineTaskDemo() {
  const [phase, setPhase] = useState<DemoPhase>("typing")
  const [chars, setChars] = useState(0)
  const { ref, inView } = useInView<HTMLDivElement>()

  useEffect(() => {
    if (!inView || phase !== "typing") return
    if (chars >= DEMO_TITLE.length) {
      const timer = setTimeout(() => setPhase("pause"), 280)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setChars((count) => count + 1), 58)
    return () => clearTimeout(timer)
  }, [inView, phase, chars])

  useEffect(() => {
    if (!inView) return
    if (phase === "pause") {
      const timer = setTimeout(() => setPhase("saved"), 900)
      return () => clearTimeout(timer)
    }
    if (phase === "saved") {
      const timer = setTimeout(() => setPhase("done"), 950)
      return () => clearTimeout(timer)
    }
    if (phase === "done") {
      const timer = setTimeout(() => {
        setChars(0)
        setPhase("typing")
      }, 2300)
      return () => clearTimeout(timer)
    }
  }, [inView, phase])

  const inline = phase === "typing" || phase === "pause"
  const done = phase === "done"

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-[30px] w-full shrink-0 flex-row items-center gap-[8px] rounded-[4px] px-[8px]",
        inline && "border border-accent bg-surface",
      )}
    >
      {done ? (
        <CircleCheck size={15} className="relative z-[1] shrink-0 text-faint" />
      ) : (
        <Circle size={15} className="shrink-0 text-muted" />
      )}
      <div
        className={cn(
          "min-w-0 flex-1 truncate text-left text-[14px]",
          done ? "relative z-[1] text-faint" : "text-ink",
        )}
      >
        {inline ? DEMO_TITLE.slice(0, chars) : DEMO_TITLE}
      </div>
      {inline ? <div className="caret h-[16px] w-[2px] shrink-0 bg-accent" /> : null}
      {inline ? (
        <div className="shrink-0 whitespace-nowrap font-mono text-[11px] text-faint">
          enter save · esc cancel
        </div>
      ) : done ? (
        <div className="shrink-0 whitespace-nowrap text-[11px] text-muted">Done</div>
      ) : null}
      {done ? (
        <Scribble width={DEMO_SCRIBBLE_WIDTH} className="absolute left-[31px] top-[5px] z-[2]" />
      ) : null}
    </div>
  )
}

function QuadrantHeader({
  index,
  title,
  count,
  subtitle,
  align = "start",
}: {
  index: string
  title: string
  count: string
  subtitle: string
  align?: "start" | "end"
}) {
  return (
    <div
      className={cn(
        "flex w-full shrink-0 flex-col gap-[2px]",
        align === "end" ? "items-end" : "items-start",
      )}
    >
      <div className="flex w-fit shrink-0 flex-row items-center gap-[8px]">
        <div className="whitespace-nowrap text-[11px] text-faint">{index}</div>
        <div className="whitespace-nowrap text-[13px] font-medium text-ink">{title}</div>
        <div className="whitespace-nowrap text-[11px] text-faint">{count}</div>
      </div>
      <div className="whitespace-nowrap text-[11px] text-faint">{subtitle}</div>
    </div>
  )
}

export function ProductWindow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none flex h-[760px] w-full shrink-0 select-none flex-col overflow-hidden rounded-[10px] border border-line bg-bg shadow-[0px_24px_60px_#0000000D]"
    >
      <div className="flex w-full flex-1 flex-row overflow-hidden bg-bg">
        <div className="flex h-full w-[232px] shrink-0 flex-col gap-[24px] bg-sidebar p-[12px_10px]">
          <div className="flex w-full shrink-0 flex-row items-center justify-between gap-[8px] p-[6px_8px]">
            <div className="flex w-fit shrink-0 flex-row items-center gap-[8px]">
              <div className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-ink">
                <Grid2x2 size={12} className="text-white" />
              </div>
              <div className="whitespace-nowrap text-[14px] font-semibold text-ink">Quadrant</div>
            </div>
            <PanelLeft size={16} className="shrink-0 text-muted" />
          </div>

          <div className="flex w-full shrink-0 flex-col gap-[2px]">
            <SidebarRow
              icon={<Search size={15} className="shrink-0 text-muted" />}
              label="Search"
              trailing="⌘K"
            />
            <SidebarRow
              icon={<LayoutGrid size={15} className="shrink-0 text-ink" />}
              label="Map"
              active
            />
            <SidebarRow
              icon={<Inbox size={15} className="shrink-0 text-muted" />}
              label="Inbox"
              trailing="3"
            />
            <SidebarRow
              icon={<Sun size={15} className="shrink-0 text-muted" />}
              label="Today"
              trailing="5"
            />
            <SidebarRow
              icon={<Archive size={15} className="shrink-0 text-muted" />}
              label="Archive"
            />
          </div>

          <div className="flex w-full shrink-0 flex-col gap-[2px]">
            <div className="flex w-full shrink-0 flex-row items-center justify-between p-[4px_8px]">
              <div className="whitespace-nowrap text-[12px] font-medium text-faint">Maps</div>
              <Plus size={14} className="shrink-0 text-faint" />
            </div>
            <SidebarRow
              icon={<Hash size={15} className="shrink-0 text-accent" />}
              label="Work"
              trailing="14"
              accent
            />
            <SidebarRow
              icon={<Hash size={15} className="shrink-0 text-muted" />}
              label="School"
              trailing="6"
            />
            <SidebarRow
              icon={<Hash size={15} className="shrink-0 text-muted" />}
              label="Personal"
              trailing="9"
            />
          </div>

          <div className="flex w-full flex-1 flex-row" />

          <div className="flex w-full shrink-0 flex-col gap-[2px]">
            <SidebarRow
              icon={<Settings size={15} className="shrink-0 text-muted" />}
              label="Settings"
            />
            <SidebarRow
              icon={<Moon size={15} className="shrink-0 text-muted" />}
              label="Dark mode"
              trailing="⇧⌘L"
            />
          </div>
        </div>

        <div className="flex h-full flex-1 flex-col">
          <div className="flex h-[47.5px] w-full shrink-0 flex-row items-center justify-between border-b border-line px-[24px]">
            <div className="flex w-fit shrink-0 flex-row items-center gap-[8px]">
              <div className="whitespace-nowrap text-[14px] text-muted">Maps</div>
              <div className="whitespace-nowrap text-[14px] text-faint">/</div>
              <div className="whitespace-nowrap text-[14px] font-medium text-ink">Work</div>
              <div className="whitespace-nowrap text-[11px] text-faint">14 tasks</div>
            </div>
            <div className="flex w-fit shrink-0 flex-row items-center gap-[16px]">
              <div className="flex h-[28px] w-[240px] shrink-0 flex-row items-center gap-[8px] rounded-[4px] border border-line bg-surface px-[8px]">
                <Search size={14} className="shrink-0 text-faint" />
                <div className="flex-1 text-left text-[13px] text-faint">Search tasks</div>
                <div className="shrink-0 rounded-[3px] border border-line px-[5px] py-[1px] text-[11px] text-muted">
                  /
                </div>
              </div>
              <div className="flex w-fit shrink-0 flex-row items-center gap-[6px]">
                <Command size={14} className="shrink-0 text-muted" />
                <div className="whitespace-nowrap text-[13px] text-muted">Commands</div>
              </div>
              <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[12px] bg-[#E4E4E7]">
                <div className="whitespace-nowrap text-[10px] font-semibold text-[#52525B]">AA</div>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-[8px] p-[16px_32px_12px]">
            <div className="flex w-full shrink-0 flex-row items-center justify-center gap-[6px]">
              <ArrowUp size={12} className="shrink-0 text-faint" />
              <div className="whitespace-nowrap font-mono text-[10px] tracking-[1px] text-faint">
                MORE IMPORTANT
              </div>
            </div>

            <div className="flex w-full flex-1 flex-row items-center gap-[10px]">
              <div className="flex h-full w-[14px] shrink-0 flex-col items-center justify-center">
                <div className="relative h-[77px] w-[13px] shrink-0">
                  <div className="absolute left-0 top-[77px] origin-top-left -rotate-90 whitespace-nowrap font-mono text-[10px] tracking-[1px] text-faint">
                    LESS URGENT
                  </div>
                </div>
              </div>

              <div className="relative h-[614px] w-[864px] shrink-0">
                <div className="absolute left-0 top-0 z-[0] flex h-[307px] w-[432px] flex-col gap-[16px] p-[24px]">
                  <QuadrantHeader
                    index="03"
                    title="Good to do"
                    count="3"
                    subtitle="Important, not urgent. Schedule it"
                  />
                  <div className="flex w-full shrink-0 flex-col gap-[2px]">
                    <QuadTask title="Outline research essay" dot="#4E8A7E" meta="School · Oct 12" />
                    <QuadTask title="Read chapter 4 of Thinking in Systems" />
                    <QuadTask title="Organize reading list" done meta="Done" scribbleWidth={145} />
                    <AddTask />
                  </div>
                </div>

                <div className="absolute left-[432px] top-0 z-[1] flex h-[307px] w-[432px] flex-col gap-[16px] p-[24px]">
                  <QuadrantHeader
                    index="01"
                    title="Most important"
                    count="4"
                    subtitle="Urgent and important. Do first"
                    align="end"
                  />
                  <div className="flex w-full shrink-0 flex-col gap-[2px]">
                    <QuadTask
                      title="Finish landing page"
                      selected="hover"
                      grip
                      dot="#5B7CBA"
                      meta="Website · Today"
                      ellipsis
                    />
                    <QuadTask title="Send project proposal" meta="Today" />
                    <QuadTask title="Review Q4 budget with Sam" dot="#B98A2F" meta="Finance · Wed" />
                    <QuadTask title="Fix onboarding email bug" meta="Tomorrow" />
                    <AddTask />
                  </div>
                </div>

                <div className="absolute left-0 top-[307px] z-[2] flex h-[307px] w-[432px] flex-col justify-between gap-[16px] p-[24px]">
                  <div className="flex w-full shrink-0 flex-col gap-[2px]">
                    <InlineTaskDemo />
                    <QuadTask title="Reorganize bookmarks" />
                  </div>
                  <QuadrantHeader
                    index="04"
                    title="Least important"
                    count="1"
                    subtitle="Neither. Drop it or do it later"
                    align="end"
                  />
                </div>

                <div className="absolute left-[432px] top-[307px] z-[3] flex h-[307px] w-[432px] flex-col justify-between gap-[16px] p-[24px]">
                  <div className="flex w-full shrink-0 flex-col gap-[2px]">
                    <QuadTask title="Email recruiter back" dot="#9A5C8F" meta="Career" />
                    <QuadTask
                      title="Prepare interview notes"
                      selected="select"
                      accentCircle
                      dot="#4E8A7E"
                      meta="School · Fri"
                    />
                    <QuadTask title="Renew library card" meta="Sat" />
                    <AddTask />
                  </div>
                  <QuadrantHeader
                    index="02"
                    title="Semi-important"
                    count="3"
                    subtitle="Urgent, less important. Batch or delegate"
                    align="end"
                  />
                </div>

                <div className="absolute left-[432px] top-0 z-[4] h-[614px] w-[1px] bg-[#0000001F]" />
                <div className="absolute left-0 top-[307px] z-[5] h-[1px] w-[864px] bg-[#0000001F]" />
                <div className="absolute left-[429.5px] top-[304.5px] z-[6] h-[6px] w-[6px] rounded-full bg-bg outline-1 -outline-offset-[0.5px] outline-[#00000033]" />
              </div>

              <div className="flex h-full w-[14px] shrink-0 flex-col items-center justify-center">
                <div className="relative h-[77px] w-[13px] shrink-0">
                  <div className="absolute left-[13px] top-0 origin-top-left rotate-90 whitespace-nowrap font-mono text-[10px] tracking-[1px] text-faint">
                    MORE URGENT
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-row items-center justify-center gap-[6px]">
              <ArrowDown size={12} className="shrink-0 text-faint" />
              <div className="whitespace-nowrap font-mono text-[10px] tracking-[1px] text-faint">
                LESS IMPORTANT
              </div>
            </div>
          </div>

          <div className="flex h-[27.5px] w-full shrink-0 flex-row items-center justify-between border-t border-line px-[24px]">
            <div className="flex w-fit shrink-0 flex-row items-center gap-[16px]">
              <div className="flex w-fit shrink-0 flex-row items-center gap-[5px]">
                <div className="whitespace-nowrap font-mono text-[11px] text-muted">N</div>
                <div className="whitespace-nowrap text-[11px] text-faint">new task</div>
              </div>
              <div className="flex w-fit shrink-0 flex-row items-center gap-[5px]">
                <div className="whitespace-nowrap font-mono text-[11px] text-muted">⌘K</div>
                <div className="whitespace-nowrap text-[11px] text-faint">commands</div>
              </div>
              <div className="flex w-fit shrink-0 flex-row items-center gap-[5px]">
                <div className="whitespace-nowrap font-mono text-[11px] text-muted">/</div>
                <div className="whitespace-nowrap text-[11px] text-faint">search</div>
              </div>
              <div className="flex w-fit shrink-0 flex-row items-center gap-[5px]">
                <div className="whitespace-nowrap font-mono text-[11px] text-muted">1–4</div>
                <div className="whitespace-nowrap text-[11px] text-faint">focus quadrant</div>
              </div>
              <div className="flex w-fit shrink-0 flex-row items-center gap-[5px]">
                <div className="whitespace-nowrap font-mono text-[11px] text-muted">E</div>
                <div className="whitespace-nowrap text-[11px] text-faint">edit</div>
              </div>
              <div className="flex w-fit shrink-0 flex-row items-center gap-[5px]">
                <div className="whitespace-nowrap font-mono text-[11px] text-muted">Space</div>
                <div className="whitespace-nowrap text-[11px] text-faint">complete</div>
              </div>
              <div className="flex w-fit shrink-0 flex-row items-center gap-[5px]">
                <div className="whitespace-nowrap font-mono text-[11px] text-muted">Esc</div>
                <div className="whitespace-nowrap text-[11px] text-faint">clear</div>
              </div>
            </div>
            <div className="whitespace-nowrap text-[11px] text-faint">Saved · 2 done this week</div>
          </div>
        </div>
      </div>
    </div>
  )
}
