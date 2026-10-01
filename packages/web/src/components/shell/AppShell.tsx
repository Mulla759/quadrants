import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { MapView } from "../map/MapView"
import { TodayView } from "../today/TodayView"
import { InboxView } from "../inbox/InboxView"
import { ArchiveView } from "../archive/ArchiveView"
import { Logo } from "../ui/Logo"
import { Sidebar } from "./Sidebar"
import { StatusBar } from "./StatusBar"
import { TopBar } from "./TopBar"

export function AppShell() {
  const { status, error } = useWorkspace()
  const { view, sidebarOpen, setSidebarOpen } = useUI()

  if (status === "loading") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-bg text-ink">
        <Logo className="h-8 w-8 rounded-[6px]" />
        <p className="text-[13px] text-muted">Opening your workspace…</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-ink">
        <Logo className="h-8 w-8 rounded-[6px]" />
        <p className="text-[14px] font-medium">We couldn’t open your workspace.</p>
        <p className="max-w-[360px] text-[13px] text-muted">
          {error?.message ?? "Local storage may be unavailable in this browser context."}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-1 rounded-[4px] border border-line bg-surface px-3 py-1.5 text-[13px] text-ink outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden bg-bg text-ink">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      {sidebarOpen ? (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-[#0F0F0F33] lg:hidden"
          />
          <div className="fixed left-0 top-0 z-40 h-full lg:hidden">
            <Sidebar />
          </div>
        </>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {view === "map" ? <MapView /> : null}
          {view === "inbox" ? <InboxView /> : null}
          {view === "today" ? <TodayView /> : null}
          {view === "archive" ? <ArchiveView /> : null}
        </main>
        <StatusBar />
      </div>
    </div>
  )
}
