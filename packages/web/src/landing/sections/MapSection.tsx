import { ArrowDown, ArrowUp, Circle, CircleCheck } from "lucide-react"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"
import { Scribble } from "../ui/Scribble"
import { cn } from "../../lib/utils"

function MapHeader({
  index,
  title,
  count,
  subtitle,
}: {
  index: string
  title: string
  count: string
  subtitle: string
}) {
  return (
    <div className="flex w-full shrink-0 flex-col gap-[10px]">
      <div className="flex w-full shrink-0 flex-row items-center gap-[12px]">
        <div className="whitespace-nowrap font-mono text-[13px] text-faint">{index}</div>
        <div className="whitespace-nowrap text-[24px] font-semibold tracking-[-0.6px] text-ink">
          {title}
        </div>
        <div className="flex-1" />
        <div className="flex h-[24px] w-fit shrink-0 items-center justify-center rounded-[4px] border border-line bg-surface px-[8px]">
          <div className="whitespace-nowrap font-mono text-[12px] text-muted">{count}</div>
        </div>
      </div>
      <div className="w-full text-[16px]/[25px] text-muted">{subtitle}</div>
    </div>
  )
}

function MapTask({
  title,
  done,
  dot,
  meta,
  scribbleWidth,
}: {
  title: string
  done?: boolean
  dot?: string
  meta?: string
  scribbleWidth?: number
}) {
  return (
    <div className="relative flex h-[36px] w-full shrink-0 flex-row items-center gap-[10px] rounded-[6px] px-[10px]">
      {done ? (
        <CircleCheck size={16} className="relative z-[1] shrink-0 text-faint" />
      ) : (
        <Circle size={16} className="shrink-0 text-muted" />
      )}
      <div
        className={cn(
          "whitespace-nowrap text-[15px]",
          done ? "relative z-[1] text-faint" : "text-ink",
        )}
      >
        {title}
      </div>
      <div className="flex-1" />
      {dot && (
        <span className="h-[6px] w-[6px] shrink-0 rounded-full" style={{ backgroundColor: dot }} />
      )}
      {meta && (
        <div
          className={cn(
            "whitespace-nowrap text-[12px] text-muted",
            done && "relative z-[3]",
          )}
        >
          {meta}
        </div>
      )}
      {done && scribbleWidth !== undefined && (
        <Scribble width={scribbleWidth} className="absolute left-[32px] top-[8px] z-[2]" />
      )}
    </div>
  )
}

export function MapSection() {
  return (
    <section id="the-map" className="w-full scroll-mt-[72px] bg-bg">
      <Container className="flex flex-col gap-[72px] border-t border-line pt-[136px] pb-[144px]">
        <div className="flex w-full flex-row items-end justify-between">
          <div className="flex w-fit shrink-0 flex-col gap-[20px]">
            <MonoLabel>01 · THE MAP</MonoLabel>
            <h2 className="whitespace-nowrap text-[52px]/[55px] font-semibold tracking-[-1.8px] text-ink">
              One map for everything
              <br />
              you have to do.
            </h2>
          </div>
          <p className="w-[420px] shrink-0 text-[17px]/[27px] text-muted">
            Every task lands on two axes: how urgent it is, and how much it matters. When life
            shifts, drag it to another quadrant, or just press 1–4.
          </p>
        </div>

        <div className="flex w-full flex-col gap-[14px]">
          <div className="flex w-full flex-row items-center justify-center gap-[6px]">
            <ArrowUp size={12} className="shrink-0 text-muted" />
            <span className="whitespace-nowrap font-mono text-[11px] tracking-[1px] text-muted">
              MORE IMPORTANT
            </span>
          </div>

          <div className="flex w-full flex-row items-center gap-[16px]">
            <div className="flex h-[560px] w-[14px] shrink-0 flex-col items-center justify-center">
              <div className="relative h-[84px] w-[15px] shrink-0">
                <div className="absolute left-0 top-[84px] origin-top-left -rotate-90 whitespace-nowrap font-mono text-[11px] tracking-[1px] text-muted">
                  LESS URGENT
                </div>
              </div>
            </div>

            <div className="relative h-[560px] w-[1148px] shrink-0">
              <div className="absolute left-0 top-0 z-[0] flex h-[280px] w-[574px] flex-col gap-[24px] p-[40px_48px]">
                <MapHeader
                  index="03"
                  title="Good to do"
                  count="3"
                  subtitle="Important, not urgent. Give it a date before it turns into a fire."
                />
                <div className="flex w-full shrink-0 flex-col gap-[2px]">
                  <MapTask title="Outline research essay" dot="#4E8A7E" meta="School · Oct 12" />
                  <MapTask title="Plan a weekly long run" dot="#BC5B6B" meta="Health · Sun" />
                </div>
              </div>

              <div className="absolute left-[574px] top-0 z-[1] flex h-[280px] w-[574px] flex-col gap-[24px] p-[40px_48px]">
                <MapHeader
                  index="01"
                  title="Most important"
                  count="1"
                  subtitle="Urgent and important. Do these first. Today starts here."
                />
                <div className="flex w-full shrink-0 flex-col gap-[2px]">
                  <MapTask title="Finish landing page" dot="#5B7CBA" meta="Website · Today" />
                  <MapTask title="Submit scholarship form" dot="#B98A2F" meta="Finance · Today" />
                </div>
              </div>

              <div className="absolute left-0 top-[280px] z-[2] flex h-[280px] w-[574px] flex-col gap-[24px] p-[40px_48px]">
                <MapHeader
                  index="04"
                  title="Least important"
                  count="4"
                  subtitle="Neither urgent nor important. Drop it, or get to it later."
                />
                <div className="flex w-full shrink-0 flex-col gap-[2px]">
                  <MapTask title="Reorganize bookmarks" meta="Someday" />
                  <MapTask title="Sort the photo library" done meta="Done" scribbleWidth={159} />
                </div>
              </div>

              <div className="absolute left-[574px] top-[280px] z-[3] flex h-[280px] w-[574px] flex-col gap-[24px] p-[40px_48px]">
                <MapHeader
                  index="02"
                  title="Semi-important"
                  count="2"
                  subtitle="Urgent, but not worth your best hours. Batch it or hand it off."
                />
                <div className="flex w-full shrink-0 flex-col gap-[2px]">
                  <MapTask title="Reply to troop leader" dot="#6E9163" meta="Scouts · Today" />
                  <MapTask title="Renew library card" dot="#64748B" meta="Admin · Sat" />
                </div>
              </div>

              <div className="absolute left-[574px] top-0 z-[4] h-[560px] w-[1px] bg-line" />
              <div className="absolute left-0 top-[280px] z-[5] h-[1px] w-[1148px] bg-line" />
              <div className="absolute left-[571px] top-[277px] z-[6] h-[7px] w-[7px] rounded-full bg-bg outline-1 -outline-offset-[0.5px] outline-[#00000033]" />
            </div>

            <div className="flex h-[560px] w-[14px] shrink-0 flex-col items-center justify-center">
              <div className="relative h-[84px] w-[15px] shrink-0">
                <div className="absolute left-[15px] top-0 origin-top-left rotate-90 whitespace-nowrap font-mono text-[11px] tracking-[1px] text-muted">
                  MORE URGENT
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-row items-center justify-center gap-[6px]">
            <ArrowDown size={12} className="shrink-0 text-muted" />
            <span className="whitespace-nowrap font-mono text-[11px] tracking-[1px] text-muted">
              LESS IMPORTANT
            </span>
          </div>
        </div>
      </Container>
    </section>
  )
}
