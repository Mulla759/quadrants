import { ArrowRight, Check } from "lucide-react"
import { Button } from "../ui/Button"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"
import { navigate } from "../../router"
import { ProductWindow } from "./ProductWindow"

const BULLETS = ["Free", "No account", "Works offline", "Installs as an app"]

function scrollToMap() {
  document.getElementById("the-map")?.scrollIntoView({ behavior: "smooth" })
}

export function Hero() {
  return (
    <section className="w-full bg-bg">
      <Container className="flex flex-col gap-[80px] pt-[112px] pb-[128px]">
        <div className="flex w-full flex-col gap-[32px]">
          <div className="flex w-fit items-center gap-[10px]">
            <span className="h-[6px] w-[6px] shrink-0 rounded-full bg-[#5B7CBA]" />
            <MonoLabel>A CALM, TEXT-FIRST TO-DO APP</MonoLabel>
          </div>
          <div className="flex w-fit flex-col">
            <div className="whitespace-nowrap text-[84px]/[87px] font-semibold tracking-[-3.6px] text-ink">
              Everything has a place.
            </div>
            <div className="whitespace-nowrap text-[84px]/[87px] font-semibold tracking-[-3.6px] text-muted">
              Today has three.
            </div>
          </div>
          <p className="w-[600px] text-[19px]/[29px] font-normal text-muted">
            Quadrant sorts every task onto one urgency × importance map, then asks you to pick three
            for today. Keyboard-fast, fully offline, and it never leaves your browser.
          </p>
          <div className="flex w-fit flex-col gap-[18px] pt-[8px]">
            <div className="flex w-fit flex-row items-center gap-[12px]">
              <Button size="lg" onClick={() => navigate("/app")}>
                Open Quadrant
                <ArrowRight size={16} />
              </Button>
              <Button variant="secondary" size="lg" className="px-[18px]" onClick={scrollToMap}>
                See how it works
              </Button>
            </div>
            <div className="flex w-fit flex-row items-center gap-[16px]">
              {BULLETS.map((label) => (
                <div key={label} className="flex w-fit flex-row items-center gap-[6px]">
                  <Check size={13} className="shrink-0 text-faint" />
                  <span className="whitespace-nowrap text-[13px] text-muted">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ProductWindow />
      </Container>
    </section>
  )
}
