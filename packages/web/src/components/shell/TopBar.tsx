import { Menu, Search } from "lucide-react"
import { useMemo } from "react"
import { todayKey } from "@quadrant/core"
import { useUI, type ViewKey } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { cn } from "../../lib/utils"
import { Kbd } from "../ui/Kbd"

const VIEW_LABEL: Record<ViewKey, string> = {
  map: "Matrix",
  inbox: "Inbox",
  today: "Today",
  archive: "Archive",
}

export function TopBar() {
  const { map, maps, activeMapId, store } = useWorkspace()
  const { view, setPaletteOpen, setSearchOpen, setSidebarOpen } = useUI()

  const activeMap = maps.find((candidate) => candidate.id === activeMapId)
  const count = useMemo(() => {
    if (!store) return 0
    if (view === "inbox") return store.listTasks({ quadrant: "inbox" }).length
    if (view === "archive") return store.listTasks({ includeArchived: true }).filter((task) => task.archivedAt).length
    if (view === "today") {
      const plan = store.getPlan(todayKey())
      return plan.focus.length + plan.sideQuests.length
    }
    return map.tasks.length
  }, [store, view, map.tasks])

  return (
    <header className="flex h-[48px] shrink-0 items-center gap-4 border-b border-line px-4 sm:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setSidebarOpen(true)}
        className="-ml-1 flex h-7 w-7 items-center justify-center rounded-[4px] text-muted outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent lg:hidden"
      >
        <Menu className="h-[16px] w-[16px]" />
      </button>
      <div className="flex min-w-0 items-center gap-2 text-[13px]">
        <span className="text-faint">Maps</span>
        <span className="text-faint">/</span>
        <span className="truncate text-muted">{activeMap?.name ?? "Untitled map"}</span>
        <span className="text-faint">/</span>
        <span className="font-medium text-ink">{VIEW_LABEL[view]}</span>
        <span className="ml-2 font-mono text-[11px] tabular-nums text-faint">{count}</span>
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        className="flex h-[28px] w-[240px] items-center gap-2 rounded-[4px] border border-line bg-surface px-2 text-left text-[13px] text-faint outline-none hover:border-muted/40 focus-visible:ring-2 focus-visible:ring-accent"
      >
        <Search className="h-[14px] w-[14px]" />
        <span className="flex-1">Search</span>
        <Kbd>/</Kbd>
      </button>

      <button
        type="button"
        onClick={() => setPaletteOpen(true)}
        className="flex items-center gap-1.5 rounded-[4px] px-1 text-[12px] text-faint outline-none hover:text-muted focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="font-mono text-[10px]">⌘K</span>
        <span>Commands</span>
      </button>

      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full bg-ink text-[11px] font-medium text-surface",
        )}
      >
        AA
      </span>
    </header>
  )
}
