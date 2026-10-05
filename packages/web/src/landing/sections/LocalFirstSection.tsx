import type { ReactNode } from "react"
import { Download, EyeOff, UserRoundX, WifiOff } from "lucide-react"
import { cn } from "../../lib/utils"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"

function Feature({
  icon,
  title,
  body,
  className,
}: {
  icon: ReactNode
  title: string
  body: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-1 flex-col items-start gap-[14px] pt-[32px] pb-[8px]", className)}>
      <span className="shrink-0 text-ink">{icon}</span>
      <span className="text-[18px] font-semibold tracking-[-0.3px] text-ink">{title}</span>
      <p className="w-full text-[15px] leading-[23px] text-muted">{body}</p>
    </div>
  )
}

const iconClass = "h-[20px] w-[20px] shrink-0"

export function LocalFirstSection() {
  return (
    <section id="local-first" className="w-full scroll-mt-[72px]">
      <Container className="flex flex-col items-start gap-[80px] pt-[144px] pb-[136px]">
        <div className="flex w-full flex-row items-end justify-between">
          <div className="flex flex-col items-start gap-[20px]">
            <MonoLabel>06 · LOCAL-FIRST</MonoLabel>
            <h2 className="text-[52px] leading-[55px] font-semibold tracking-[-1.8px] text-ink">
              Yours. On this device.
            </h2>
          </div>
          <p className="w-[420px] shrink-0 text-[17px] leading-[27px] text-muted">
            Quadrant runs entirely in your browser. There’s no account and no server holding your
            lists. Everything stays on your machine, and leaves only when you export it.
          </p>
        </div>

        <div className="flex w-full flex-row items-start border-t border-line">
          <Feature
            className="border-r border-line pr-[28px]"
            icon={<UserRoundX className={iconClass} strokeWidth={2} />}
            title="No account"
            body="Open it and start. Nothing to sign up for, nothing to log into."
          />
          <Feature
            className="border-r border-line px-[28px]"
            icon={<WifiOff className={iconClass} strokeWidth={2} />}
            title="Works offline"
            body="Every feature works with the network off. Install it like an app."
          />
          <Feature
            className="border-r border-line px-[28px]"
            icon={<Download className={iconClass} strokeWidth={2} />}
            title="Plain JSON export"
            body="Take a map anywhere, any time, and import it back just as easily."
          />
          <Feature
            className="px-[28px]"
            icon={<EyeOff className={iconClass} strokeWidth={2} />}
            title="No tracking"
            body="No analytics, no ads, no network calls. Just your lists."
          />
        </div>
      </Container>
    </section>
  )
}
