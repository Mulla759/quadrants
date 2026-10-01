import { RotateCcw } from "lucide-react"
import { CATEGORY_COLORS } from "@quadrant/core"
import { useTaskActions } from "../../lib/actions"
import { useWorkspace } from "../../lib/workspace"

export function ArchiveView() {
  const { store, map } = useWorkspace()
  const { restoreTask } = useTaskActions()

  const archived = (store?.listTasks({ includeArchived: true }) ?? [])
    .filter((task) => task.archivedAt)
    .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0))

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-8">
      <div className="flex w-full max-w-[560px] flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-[20px] font-semibold text-ink">Archive</h1>
          <p className="text-[11px] text-faint">Completed tasks archive automatically after 7 days</p>
        </header>

        <div className="flex flex-col gap-[2px]">
          {archived.map((task) => {
            const category = map.categories.find((candidate) => candidate.id === task.categoryId)
            const when = task.archivedAt
              ? new Date(task.archivedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : ""
            return (
              <div
                key={task.id}
                className="group/row flex h-[30px] items-center gap-2 rounded-[4px] px-2 hover:bg-hover"
              >
                {category ? (
                  <span
                    className="h-[6px] w-[6px] shrink-0 rounded-full"
                    style={{ background: CATEGORY_COLORS[category.color - 1] }}
                    aria-hidden
                  />
                ) : null}
                <span className="min-w-0 flex-1 truncate text-[14px] text-faint">{task.title}</span>
                <span className="shrink-0 text-[11px] text-faint">Archived {when}</span>
                <button
                  type="button"
                  onClick={() => restoreTask(task.id)}
                  aria-label="Restore task"
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-faint opacity-0 outline-none hover:text-muted focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover/row:opacity-100"
                >
                  <RotateCcw className="h-[14px] w-[14px]" />
                </button>
              </div>
            )
          })}
        </div>

        {archived.length === 0 ? (
          <p className="text-[13px] text-muted">Nothing archived yet.</p>
        ) : null}
      </div>
    </div>
  )
}
