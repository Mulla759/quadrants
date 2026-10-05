import { cn } from "../../lib/utils"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"

function RoadmapColumn({
  stage,
  title,
  body,
  active,
}: {
  stage: string
  title: string
  body: string
  active?: boolean
}) {
  return (
    <div className="flex flex-1 flex-col items-start gap-[16px]">
      <div className="flex w-full flex-row items-center gap-[10px]">
        <span
          className={cn(
            "h-[10px] w-[10px] shrink-0 rounded-full",
            active ? "bg-ink" : "bg-sidebar ring-[1.5px] ring-inset ring-[#A1A1AA]",
          )}
        />
        <span className={cn("h-[1px] flex-1", active ? "bg-ink" : "bg-line")} />
      </div>
      <div className="flex w-fit flex-row items-center gap-[10px] pt-[6px]">
        <span
          className={cn(
            "font-mono text-[12px] tracking-[1px]",
            active ? "text-ink" : "text-muted",
          )}
        >
          {stage}
        </span>
        <span className="text-[18px] font-semibold tracking-[-0.3px] text-ink">{title}</span>
      </div>
      <p className="w-full text-[15px] leading-[23px] text-muted">{body}</p>
    </div>
  )
}

export function RoadmapSection() {
  return (
    <section id="roadmap" className="w-full scroll-mt-[72px] bg-sidebar">
      <Container className="flex flex-col items-start gap-[56px] py-[112px]">
        <div className="flex w-full flex-row items-end justify-between">
          <div className="flex flex-col items-start gap-[16px]">
            <MonoLabel>WHERE IT’S GOING</MonoLabel>
            <h2 className="text-[36px] font-semibold tracking-[-1.1px] text-ink">
              Small now. On purpose.
            </h2>
          </div>
          <p className="text-[15px] text-muted">Everything above works today. No waitlist.</p>
        </div>

        <div className="flex w-full flex-row items-start gap-[32px]">
          <RoadmapColumn
            active
            stage="NOW"
            title="MVP"
            body="The whole paper system: the map, Today, categories, scribbles, ⌘K, offline PWA."
          />
          <RoadmapColumn
            stage="NEXT"
            title="Shared maps"
            body="Share a map by link and see who else is in it, live."
          />
          <RoadmapColumn
            stage="LATER"
            title="Sync & mobile"
            body="Optional login for backup and sync, native mobile apps, home-screen widgets."
          />
        </div>
      </Container>
    </section>
  )
}
