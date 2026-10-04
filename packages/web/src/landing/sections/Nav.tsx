import { Grid2x2 } from "lucide-react"
import { navigate } from "../../router"
import { Button } from "../ui/Button"
import { Container } from "../ui/Container"

const LINKS = [
  { label: "How it works", href: "#the-map" },
  { label: "Today", href: "#today" },
  { label: "Categories", href: "#categories" },
  { label: "Shortcuts", href: "#shortcuts" },
  { label: "Privacy", href: "#local-first" },
] as const

export function Nav() {
  return (
    <nav className="sticky top-0 z-40 w-full bg-bg/90 backdrop-blur">
      <Container className="flex h-[72px] flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-[48px]">
          <div className="flex flex-row items-center gap-[10px]">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-ink">
              <Grid2x2 className="h-[13px] w-[13px] text-bg" strokeWidth={2} />
            </span>
            <span className="text-[16px] font-semibold tracking-[-0.2px] text-ink">Quadrant</span>
          </div>
          <div className="flex flex-row items-center gap-[28px]">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[14px] text-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-row items-center gap-[20px]">
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="text-[14px] text-muted transition-colors hover:text-ink"
          >
            Install app
          </button>
          <Button size="sm" onClick={() => navigate("/app")}>
            Open Quadrant
          </Button>
        </div>
      </Container>
    </nav>
  )
}
