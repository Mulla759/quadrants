import { ArrowRight, MonitorDown } from "lucide-react"
import { navigate } from "../../router"
import { Button } from "../ui/Button"
import { Container } from "../ui/Container"

export function FinalCta() {
  return (
    <section className="w-full -mt-[0.5px] border-t border-line">
      <Container className="flex flex-col items-center gap-[32px] pt-[160px] pb-[168px]">
        <div className="flex flex-col items-start gap-[6px] pb-[12px]">
          <div className="flex flex-row items-start gap-[6px]">
            <span className="h-[22px] w-[22px] rounded-[4px] bg-bg ring-[1.5px] ring-inset ring-line" />
            <span className="h-[22px] w-[22px] rounded-[4px] bg-ink" />
          </div>
          <div className="flex flex-row items-start gap-[6px]">
            <span className="h-[22px] w-[22px] rounded-[4px] bg-bg ring-[1.5px] ring-inset ring-line" />
            <span className="h-[22px] w-[22px] rounded-[4px] bg-bg ring-[1.5px] ring-inset ring-line" />
          </div>
        </div>

        <h2 className="text-center text-[72px] leading-[75px] font-semibold tracking-[-3px] text-ink">
          Make a map. Pick three.
        </h2>
        <p className="text-center text-[19px] leading-[29px] text-muted">
          Free, in your browser, with nothing to sign up for. Your first map takes a minute.
        </p>

        <div className="flex flex-row items-center gap-[12px] pt-[12px]">
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
      </Container>
    </section>
  )
}
