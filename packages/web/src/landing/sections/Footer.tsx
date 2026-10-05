import { Grid2x2 } from "lucide-react"
import { navigate } from "../../router"
import { CategoryDot } from "../ui/CategoryDot"
import { Container } from "../ui/Container"

type FooterLink = { label: string; href?: string }

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="flex flex-col items-start gap-[12px]">
      <span className="font-mono text-[11px] tracking-[1px] text-faint">{title}</span>
      {links.map((link) =>
        link.href ? (
          <a
            key={link.label}
            href={link.href}
            className="text-[14px] text-muted transition-colors hover:text-ink"
          >
            {link.label}
          </a>
        ) : (
          <button
            key={link.label}
            type="button"
            onClick={() => navigate("/app")}
            className="text-left text-[14px] text-muted transition-colors hover:text-ink"
          >
            {link.label}
          </button>
        ),
      )}
    </div>
  )
}

const STATUS: { key: string; label: string }[] = [
  { key: "N", label: "new task" },
  { key: "⌘K", label: "commands" },
  { key: "/", label: "search" },
  { key: "1–4", label: "move" },
  { key: "Space", label: "complete" },
]

export function Footer() {
  return (
    <footer className="w-full -mt-[0.5px] border-t border-line bg-sidebar">
      <Container className="flex flex-row items-start justify-between pt-[56px] pb-[52px]">
        <div className="flex flex-col items-start gap-[14px]">
          <div className="flex flex-row items-center gap-[10px]">
            <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] bg-ink">
              <Grid2x2 className="h-[13px] w-[13px] text-bg" strokeWidth={2} />
            </span>
            <span className="text-[16px] font-semibold tracking-[-0.2px] text-ink">Quadrant</span>
          </div>
          <span className="text-[14px] text-muted">A calm, text-first to-do app.</span>
        </div>

        <div className="flex flex-row items-start gap-[56px]">
          <FooterColumn
            title="PRODUCT"
            links={[
              { label: "How it works", href: "#the-map" },
              { label: "Today", href: "#today" },
              { label: "Categories", href: "#categories" },
              { label: "Shortcuts", href: "#shortcuts" },
            ]}
          />
          <FooterColumn
            title="YOUR DATA"
            links={[
              { label: "Privacy", href: "#local-first" },
              { label: "Export & import" },
              { label: "Install as an app" },
            ]}
          />
          <FooterColumn
            title="PROJECT"
            links={[
              { label: "Origin", href: "#origin" },
              { label: "Roadmap", href: "#roadmap" },
              { label: "Open Quadrant" },
            ]}
          />
        </div>
      </Container>

      <div className="border-t border-line -mt-[0.5px]">
        <Container className="flex h-[43.5px] flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-[18px]">
            {STATUS.map((item) => (
              <div key={item.label} className="flex flex-row items-center gap-[6px]">
                <span className="font-mono text-[11px] text-muted">{item.key}</span>
                <span className="text-[12px] text-faint">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-row items-center gap-[8px]">
            <span className="text-[12px] text-faint">© 2026 Quadrant</span>
            <span className="text-[12px] text-faint">·</span>
            <CategoryDot color="#6E9163" />
            <span className="text-[12px] text-muted">Saved on this device</span>
          </div>
        </Container>
      </div>
    </footer>
  )
}
