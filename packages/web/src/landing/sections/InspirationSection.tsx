import { ArrowUpRight } from "lucide-react"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"

const PROFILE = "https://www.tiktok.com/@invinciblevenus_"
const VIDEO =
  "https://www.tiktok.com/@invinciblevenus_/video/7641595518291954977?q=invinciblevenus_%20whiteboard%20system&t=1791181900603"

const PRINCIPLES = [
  {
    index: "01",
    title: "Urgency × importance",
    body: "Every to-do lands in one of four boxes: do first, schedule it, batch it, or drop it. A broken sink and a scout trip three weeks out are not the same kind of urgent.",
  },
  {
    index: "02",
    title: "Life categories in color",
    body: "Scouting, uni/work, private life, side quests. Each gets its own pen color, and finished tasks are crossed out or deleted to keep the list quiet.",
  },
  {
    index: "03",
    title: "A daily top three",
    body: "Three priorities boxed at the top, plus three side quests for rest and play. Unfinished picks stay in the box until they’re done.",
  },
]

export function InspirationSection() {
  return (
    <section id="origin" className="w-full scroll-mt-[72px] bg-bg">
      <Container className="flex flex-col items-start gap-[56px] border-t border-line pt-[136px] pb-[128px]">
        <div className="flex w-full flex-row items-end justify-between">
          <div className="flex flex-col items-start gap-[20px]">
            <MonoLabel>07 · THE ORIGIN</MonoLabel>
            <h2 className="text-[52px] leading-[55px] font-semibold tracking-[-1.8px] text-ink">
              It started on a whiteboard.
            </h2>
          </div>
          <p className="w-[440px] shrink-0 text-[17px] leading-[27px] text-muted">
            Quadrant is a digital tribute to a paper system by Isabel (Agent 28), shared in a
            walkthrough on TikTok. The idea is hers; this screen is my way of keeping it close.
          </p>
        </div>

        <div className="flex w-full flex-row items-stretch gap-[48px] border-t border-line pt-[40px]">
          <div className="flex w-[300px] shrink-0 flex-col items-start gap-[16px] border-r border-line pr-[48px]">
            <img
              src="/isabel.jpg"
              alt="Isabel, also known as Agent 28"
              loading="lazy"
              className="h-[76px] w-[76px] rounded-full object-cover"
            />
            <div className="flex flex-col items-start gap-[5px]">
              <span className="text-[20px] font-semibold tracking-[-0.4px] text-ink">Isabel</span>
              <span className="font-mono text-[11px] tracking-[1px] text-muted">
                AGENT 28 · @INVINCIBLEVENUS_
              </span>
            </div>
            <p className="text-[14px] leading-[22px] text-muted">
              She wrote the paper system this app is built on.
            </p>
            <div className="flex flex-col items-start gap-[10px] pt-[4px]">
              <a
                href={VIDEO}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-[8px] text-[14px] font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
              >
                Watch the walkthrough
                <ArrowUpRight size={15} />
              </a>
              <a
                href={PROFILE}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-[8px] text-[14px] font-medium text-muted transition-colors hover:text-ink"
              >
                @invinciblevenus_
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>

          <div className="flex flex-1 flex-row items-start gap-[32px]">
            {PRINCIPLES.map((item) => (
              <div key={item.index} className="flex flex-1 flex-col items-start gap-[12px]">
                <span className="font-mono text-[12px] tracking-[1px] text-faint">{item.index}</span>
                <span className="text-[18px] font-semibold tracking-[-0.3px] text-ink">
                  {item.title}
                </span>
                <p className="text-[15px] leading-[23px] text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-row items-center justify-between gap-[40px] border-t border-line pt-[36px]">
          <p className="w-[720px] text-[15px] leading-[24px] text-muted">
            The system genuinely changed how I run my life. A pile of guilt became four quiet
            decisions and three things a day. I’m an aspiring computer science major, and I wanted to
            bring that whiteboard online. All credit for the original idea goes to Isabel.
          </p>
          <a
            href={PROFILE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-[40px] shrink-0 items-center gap-[8px] rounded-[6px] border border-line bg-surface px-[16px] text-[14px] font-medium text-ink transition-colors hover:bg-hover"
          >
            Follow @invinciblevenus_
            <ArrowUpRight size={15} />
          </a>
        </div>
      </Container>
    </section>
  )
}
