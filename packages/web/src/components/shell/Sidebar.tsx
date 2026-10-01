import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  Archive,
  ChevronsUpDown,
  Inbox,
  Map as MapIcon,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sun,
  Tags,
} from "lucide-react"
import type { ReactNode } from "react"
import { useState } from "react"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { cn } from "../../lib/utils"
import { Logo } from "../ui/Logo"

function NavRow({
  icon,
  label,
  hint,
  active,
  onClick,
}: {
  icon: ReactNode
  label: string
  hint?: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-[30px] w-full items-center gap-2.5 rounded-[4px] px-2 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent",
        active ? "bg-[#E9E9E6] text-ink dark:bg-selected" : "text-muted hover:bg-hover",
      )}
    >
      <span className={cn("[&>svg]:h-[15px] [&>svg]:w-[15px]", active ? "text-accent" : "text-faint")}>{icon}</span>
      <span className="flex-1 truncate text-left">{label}</span>
      {hint ? <span className="font-mono text-[10px] text-faint">{hint}</span> : null}
    </button>
  )
}

export function Sidebar() {
  const {
    maps,
    activeMapId,
    counts,
    setActiveMap,
    createMap,
    renameMap,
    deleteMap,
    theme,
    setTheme,
  } = useWorkspace()
  const { view, setView, setPaletteOpen, setCategoriesOpen } = useUI()
  const [menuMapId, setMenuMapId] = useState<string | null>(null)

  const handleCreateMap = async () => {
    const id = await createMap("Untitled map")
    setActiveMap(id)
    setView("map")
  }

  const handleRename = (id: string, current: string) => {
    const next = window.prompt("Rename map", current)
    if (next && next.trim()) renameMap(id, next.trim())
  }

  const handleDelete = (id: string, name: string) => {
    if (maps.length <= 1) return
    if (window.confirm(`Delete “${name}”? This cannot be undone.`)) deleteMap(id)
  }

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col gap-6 border-r border-line bg-sidebar px-[10px] py-[12px]">
      <div className="flex h-[30px] items-center gap-2 px-1">
        <Logo />
        <span className="text-[14px] font-semibold text-ink">Quadrant</span>
      </div>

      <nav className="flex flex-col gap-[2px]">
        <NavRow icon={<Search />} label="Search" hint="⌘K" onClick={() => setPaletteOpen(true)} />
        <NavRow icon={<MapIcon />} label="Map" active={view === "map"} onClick={() => setView("map")} />
        <NavRow icon={<Inbox />} label="Inbox" active={view === "inbox"} onClick={() => setView("inbox")} />
        <NavRow icon={<Sun />} label="Today" active={view === "today"} onClick={() => setView("today")} />
        <NavRow icon={<Archive />} label="Archive" active={view === "archive"} onClick={() => setView("archive")} />
      </nav>

      <div className="flex flex-col gap-[2px]">
        <div className="flex h-[26px] items-center justify-between px-2">
          <span className="text-[12px] font-medium text-faint">Maps</span>
          <button
            type="button"
            aria-label="New map"
            onClick={handleCreateMap}
            className="flex h-5 w-5 items-center justify-center rounded-[4px] text-faint outline-none hover:bg-hover hover:text-muted focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Plus className="h-[15px] w-[15px]" />
          </button>
        </div>
        {maps.map((map) => {
          const active = map.id === activeMapId && view === "map"
          return (
            <DropdownMenu.Root
              key={map.id}
              open={menuMapId === map.id}
              onOpenChange={(open) => setMenuMapId(open ? map.id : null)}
            >
              <div
                className={cn(
                  "group flex h-[30px] items-center gap-2.5 rounded-[4px] px-2 text-[13px]",
                  active ? "bg-[#E9E9E6] dark:bg-selected" : "text-muted hover:bg-hover",
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  onClick={() => {
                    setActiveMap(map.id)
                    setView("map")
                  }}
                >
                  <span className={cn("[&>svg]:h-[15px] [&>svg]:w-[15px]", active ? "text-accent" : "text-faint")}>
                    <MapIcon />
                  </span>
                  <span className="flex-1 truncate">{map.name}</span>
                </button>
                <span className="font-mono text-[10px] tabular-nums text-faint">{counts[map.id] ?? 0}</span>
                <DropdownMenu.Trigger asChild>
                  <button
                    type="button"
                    aria-label={`Options for ${map.name}`}
                    className={cn(
                      "flex h-5 w-4 items-center justify-center rounded-[3px] text-faint outline-none hover:text-muted focus-visible:ring-2 focus-visible:ring-accent",
                      menuMapId === map.id ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    <MoreHorizontal className="h-[14px] w-[14px]" />
                  </button>
                </DropdownMenu.Trigger>
              </div>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  sideOffset={4}
                  className="z-50 min-w-[160px] rounded-[4px] border border-line bg-surface p-1 text-[13px] shadow-[0_4px_12px_#0000001A]"
                >
                  <DropdownMenu.Item
                    onSelect={() => handleRename(map.id, map.name)}
                    className="flex cursor-pointer items-center gap-2 rounded-[3px] px-2 py-[6px] text-ink outline-none data-[highlighted]:bg-hover"
                  >
                    Rename map
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => handleDelete(map.id, map.name)}
                    className="flex cursor-pointer items-center gap-2 rounded-[3px] px-2 py-[6px] text-ink outline-none data-[highlighted]:bg-hover"
                  >
                    Delete map
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )
        })}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-[2px]">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex h-[30px] w-full items-center gap-2.5 rounded-[4px] px-2 text-[13px] text-muted outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Settings className="h-[15px] w-[15px] text-faint" />
              <span className="flex-1 text-left">Settings</span>
              <ChevronsUpDown className="h-[13px] w-[13px] text-faint" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              side="top"
              sideOffset={4}
              className="z-50 min-w-[180px] rounded-[4px] border border-line bg-surface p-1 text-[13px] shadow-[0_4px_12px_#0000001A]"
            >
              <DropdownMenu.Item
                onSelect={() => setCategoriesOpen(true)}
                className="flex cursor-pointer items-center gap-2 rounded-[3px] px-2 py-[6px] text-ink outline-none data-[highlighted]:bg-hover"
              >
                <Tags className="h-[14px] w-[14px] text-faint" /> Categories
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={handleCreateMap}
                className="flex cursor-pointer items-center gap-2 rounded-[3px] px-2 py-[6px] text-ink outline-none data-[highlighted]:bg-hover"
              >
                <Plus className="h-[14px] w-[14px] text-faint" /> New map
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-[30px] w-full items-center gap-2.5 rounded-[4px] px-2 text-[13px] text-muted outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          {theme === "dark" ? (
            <Sun className="h-[15px] w-[15px] text-faint" />
          ) : (
            <Moon className="h-[15px] w-[15px] text-faint" />
          )}
          <span className="flex-1 text-left">Dark mode</span>
          <span className="font-mono text-[10px] text-faint">⇧⌘L</span>
        </button>
      </div>
    </aside>
  )
}
