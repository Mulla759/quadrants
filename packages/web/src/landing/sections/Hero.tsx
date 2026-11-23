import { ArrowRight, MonitorDown } from "lucide-react"
import { navigate } from "../../router"
import { Button } from "../ui/Button"
import { Container } from "../ui/Container"
import { ProductWindow } from "./ProductWindow"

function GridMark() {
  return (
    <div aria-hidden className="flex flex-col items-start gap-[6px]">
      <div className="flex flex-row items-start gap-[6px]">
        <span className="h-[22px] w-[22px] rounded-[4px] bg-bg ring-[1.5px] ring-inset ring-line" />
        <span className="h-[22px] w-[22px] rounded-[4px] bg-ink" />
      </div>
      <div className="flex flex-row items-start gap-[6px]">
        <span className="h-[22px] w-[22px] rounded-[4px] bg-bg ring-[1.5px] ring-inset ring-line" />
        <span className="h-[22px] w-[22px] rounded-[4px] bg-bg ring-[1.5px] ring-inset ring-line" />
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="w-full bg-bg">
      <Container className="flex flex-col items-center gap-[96px] pt-[144px] pb-[128px]">
        <div className="flex w-full flex-col items-center gap-[32px]">
          <GridMark />
          <div className="flex w-full flex-col items-center gap-[16px]">
            <h1 className="max-w-[760px] text-center text-[44px]/[48px] font-semibold tracking-[-1.8px] text-ink sm:text-[60px]/[64px] sm:tracking-[-2.4px] lg:text-[72px]/[75px] lg:tracking-[-3px]">
              Make a map. Pick three.
            </h1>
            <p className="max-w-[520px] text-center text-[19px]/[29px] text-muted">
              Free, in your browser, with nothing to sign up for. Your first map takes a minute.
            </p>
          </div>
          <div className="flex flex-row flex-wrap items-center justify-center gap-[12px]">
            <Button size="xl" onClick={() => navigate("/app")}>
              Open Quadrant
              <ArrowRight className="h-[17px] w-[17px]" strokeWidth={2} />
            </Button>
            <Button
              variant="secondary"
              size="xl"
              className="px-[20px]!"
              onClick={() => navigate("/app")}
            >
              <MonitorDown className="h-[16px] w-[16px]" strokeWidth={2} />
              Install as an app
            </Button>
          </div>
        </div>
        <ProductWindow />
      </Container>
    </section>
  )
}
