import { useMemo } from "react"
import { useWorkspace } from "../../lib/workspace"
import { startOfWeek } from "../../lib/utils"

const HINTS: Array<{ keys: string; label: string }> = [
  { keys: "N", label: "new" },
  { keys: "E", label: "edit" },
  { keys: "Space", label: "complete" },
  { keys: "1–4", label: "move" },
  { keys: "/", label: "search" },
  { keys: "⌘K", label: "commands" },
]

export function StatusBar() {
  const { map } = useWorkspace()

  const doneThisWeek = useMemo(() => {
    const weekStart = startOfWeek()
    return map.tasks.filter((task) => task.completedAt && task.completedAt >= weekStart).length
  }, [map.tasks])

  return (
    <footer className="flex h-[28px] shrink-0 items-center gap-4 border-t border-line px-6">
      <div className="flex items-center gap-4">
        {HINTS.map((hint) => (
          <span key={hint.keys} className="flex items-center gap-[5px]">
            <span className="font-mono text-[11px] text-muted">{hint.keys}</span>
            <span className="text-[11px] text-faint">{hint.label}</span>
          </span>
        ))}
      </div>
      <div className="flex-1" />
      <span className="text-[11px] text-faint">
        {map.saved ? "Saved" : "Saving…"}
        {doneThisWeek > 0 ? ` · ${doneThisWeek} done this week` : ""}
      </span>
    </footer>
  )
}
