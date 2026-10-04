import type { ReactNode } from "react"
import {
  Circle,
  CircleCheck,
  Download,
  Hash,
  Moon,
  Plus,
  Search,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { Container } from "../ui/Container"
import { MonoLabel } from "../ui/MonoLabel"

function Key({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[26px] shrink-0 items-center justify-center rounded-[4px] border border-[#2C2C2E] bg-[#1C1C1B] px-[8px] font-mono text-[13px] leading-none text-[#F2F2F0]">
      {children}
    </span>
  )
}

function ShortcutRow({ keys, label }: { keys: ReactNode; label: string }) {
  return (
    <div className="flex h-[51.5px] w-[296px] shrink-0 flex-row items-center gap-[16px] border-t border-[#2C2C2E]">
      <div className="flex w-[96px] shrink-0 flex-row items-center gap-[4px]">{keys}</div>
      <span className="text-[15px] text-[#A0A0A8]">{label}</span>
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-[3px] border border-[#2C2C2E] px-[5px] py-[1px] font-mono text-[11px] leading-none text-[#A0A0A8]">
      {children}
    </span>
  )
}

function PaletteRow({
  icon,
  label,
  trailing,
  active,
}: {
  icon: ReactNode
  label: string
  trailing?: ReactNode
  active?: boolean
}) {
  return (
    <div
      className={cn(
        "flex h-[30px] w-full shrink-0 flex-row items-center gap-[8px] rounded-[4px] px-[8px]",
        active && "bg-[#232322]",
      )}
    >
      <span className="shrink-0 text-[#A0A0A8]">{icon}</span>
      <span className="text-[14px] text-[#F2F2F0]">{label}</span>
      <span className="flex-1" />
      {trailing}
    </div>
  )
}

function PaletteGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-[2px]">
      <div className="flex w-full flex-row px-[8px] py-[4px]">
        <span className="text-[12px] font-medium text-[#6E6E76]">{title}</span>
      </div>
      {children}
    </div>
  )
}

const ICON = "h-[15px] w-[15px] shrink-0"

export function KeyboardSection() {
  return (
    <section id="shortcuts" className="w-full scroll-mt-[72px] bg-[#141413]">
      <Container className="flex flex-row items-center gap-[96px] py-[144px]">
        <div className="flex flex-1 flex-col items-start gap-[28px]">
          <MonoLabel className="text-[#A0A0A8]!">05 — KEYBOARD</MonoLabel>
          <h2 className="text-[52px] leading-[55px] font-semibold tracking-[-1.8px] text-[#F2F2F0]">
            As fast as you can type.
          </h2>
          <p className="w-[520px] text-[17px] leading-[27px] text-[#A0A0A8]">
            Every action has a key, and the status bar always shows them. Press ⌘K to jump to any
            task, command or map without touching the mouse.
          </p>
          <div className="flex w-full flex-row items-start gap-[40px] pt-[16px]">
            <div className="flex flex-1 flex-col items-start">
              <ShortcutRow keys={<Key>N</Key>} label="New task" />
              <ShortcutRow keys={<Key>E</Key>} label="Edit task" />
              <ShortcutRow
                keys={
                  <>
                    <Key>1</Key>
                    <span className="font-mono text-[13px] text-[#6E6E76]">–</span>
                    <Key>4</Key>
                  </>
                }
                label="Move to quadrant"
              />
              <ShortcutRow keys={<Key>Space</Key>} label="Complete" />
            </div>
            <div className="flex flex-1 flex-col items-start">
              <ShortcutRow keys={<Key>/</Key>} label="Search" />
              <ShortcutRow
                keys={
                  <>
                    <Key>⌘</Key>
                    <Key>K</Key>
                  </>
                }
                label="Command palette"
              />
              <ShortcutRow
                keys={
                  <>
                    <Key>⇧</Key>
                    <Key>⌘</Key>
                    <Key>L</Key>
                  </>
                }
                label="Dark mode"
              />
              <ShortcutRow keys={<Key>Esc</Key>} label="Clear selection" />
            </div>
          </div>
        </div>

        <div className="flex w-fit shrink-0 flex-col items-start">
          <div className="flex w-[480px] flex-col overflow-hidden rounded-[8px] border border-[#2C2C2E] bg-[#1C1C1B] shadow-[0px_8px_24px_#00000033]">
            <div className="flex w-full flex-row items-center gap-[8px] p-[10px_12px]">
              <Search className={cn(ICON, "text-[#6E6E76]")} strokeWidth={2} />
              <span className="text-[14px] text-[#6E6E76]">Type a command or search…</span>
              <span className="flex-1" />
              <Badge>esc</Badge>
            </div>

            <div className="h-[1px] w-full shrink-0 bg-[#2C2C2E]" />

            <div className="flex w-full flex-col items-start gap-[6px] p-[6px]">
              <PaletteGroup title="Tasks">
                <PaletteRow
                  icon={<Circle className={ICON} strokeWidth={2} />}
                  label="Finish landing page"
                  active
                  trailing={
                    <span className="font-mono text-[11px] text-[#6E6E76]">01 Most important</span>
                  }
                />
                <PaletteRow
                  icon={<Circle className={ICON} strokeWidth={2} />}
                  label="Email recruiter back"
                  trailing={
                    <span className="font-mono text-[11px] text-[#6E6E76]">02 Semi-important</span>
                  }
                />
                <PaletteRow
                  icon={<Circle className={ICON} strokeWidth={2} />}
                  label="Outline research essay"
                  trailing={<span className="font-mono text-[11px] text-[#6E6E76]">03 Good to do</span>}
                />
              </PaletteGroup>

              <PaletteGroup title="Commands">
                <PaletteRow
                  icon={<Plus className={ICON} strokeWidth={2} />}
                  label="New task"
                  trailing={<Badge>N</Badge>}
                />
                <PaletteRow
                  icon={<Moon className={ICON} strokeWidth={2} />}
                  label="Toggle dark mode"
                  trailing={<Badge>⇧⌘L</Badge>}
                />
                <PaletteRow
                  icon={<CircleCheck className={ICON} strokeWidth={2} />}
                  label="Complete task"
                  trailing={<Badge>Space</Badge>}
                />
                <PaletteRow
                  icon={<Download className={ICON} strokeWidth={2} />}
                  label="Export map as JSON"
                />
              </PaletteGroup>

              <PaletteGroup title="Maps">
                <PaletteRow
                  icon={<Hash className={ICON} strokeWidth={2} />}
                  label="Work"
                  trailing={<span className="text-[11px] text-[#6E6E76]">14 tasks</span>}
                />
                <PaletteRow
                  icon={<Hash className={ICON} strokeWidth={2} />}
                  label="School"
                  trailing={<span className="text-[11px] text-[#6E6E76]">6 tasks</span>}
                />
              </PaletteGroup>
            </div>

            <div className="h-[1px] w-full shrink-0 bg-[#2C2C2E]" />

            <div className="flex w-full flex-row items-center gap-[16px] p-[8px_12px]">
              <span className="flex flex-row items-center gap-[5px]">
                <span className="font-mono text-[11px] text-[#A0A0A8]">↑↓</span>
                <span className="text-[11px] text-[#6E6E76]">navigate</span>
              </span>
              <span className="flex flex-row items-center gap-[5px]">
                <span className="font-mono text-[11px] text-[#A0A0A8]">enter</span>
                <span className="text-[11px] text-[#6E6E76]">select</span>
              </span>
              <span className="flex flex-row items-center gap-[5px]">
                <span className="font-mono text-[11px] text-[#A0A0A8]">esc</span>
                <span className="text-[11px] text-[#6E6E76]">close</span>
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
