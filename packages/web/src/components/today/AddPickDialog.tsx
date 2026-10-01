import { useEffect, useState } from "react"
import { CATEGORY_COLORS, QUADRANTS, type Category, type Task } from "@quadrant/core"
import { Modal } from "../ui/Modal"

export type PickSection = "focus" | "sideQuests"

interface AddPickDialogProps {
  open: boolean
  section: PickSection
  candidates: Task[]
  categories: Category[]
  onOpenChange: (open: boolean) => void
  onPick: (taskId: string) => void
}

export function AddPickDialog({
  open,
  section,
  candidates,
  categories,
  onOpenChange,
  onPick,
}: AddPickDialogProps) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (open) setQuery("")
  }, [open])

  const filtered = candidates.filter((task) => task.title.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add a pick">
      <div className="flex flex-col">
        <div className="border-b border-line px-3 py-2">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Add to ${section === "focus" ? "Top three" : "Side quests"}…`}
            aria-label="Search tasks"
            className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
          />
        </div>
        <div className="max-h-[320px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-[13px] text-muted">
              No tasks available. Add tasks on your map first.
            </p>
          ) : (
            filtered.map((task) => {
              const category = categories.find((candidate) => candidate.id === task.categoryId)
              const quadrant = typeof task.quadrant === "number" ? QUADRANTS.find((q) => q.id === task.quadrant) : undefined
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onPick(task.id)}
                  className="flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2 text-left outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {category ? (
                    <span
                      className="h-[6px] w-[6px] shrink-0 rounded-full"
                      style={{ background: CATEGORY_COLORS[category.color - 1] }}
                      aria-hidden
                    />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{task.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-faint">{quadrant?.number ?? "—"}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </Modal>
  )
}
