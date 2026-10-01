import { X } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { CATEGORY_COLORS, QUADRANTS, formatDueDate, type TaskLocation } from "@quadrant/core"
import { useTaskActions } from "../../lib/actions"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"

function EditableTitle({ value, onCommit }: { value: string; onCommit: (next: string) => void }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])

  const commit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) onCommit(trimmed)
    else setDraft(value)
  }

  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          event.currentTarget.blur()
        }
      }}
      aria-label="Task title"
      className="w-full bg-transparent text-[20px] font-semibold text-ink outline-none"
    />
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] text-faint">{label}</span>
      {children}
    </label>
  )
}

const selectClass =
  "h-[28px] w-full rounded-[4px] border border-line bg-surface px-2 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent"

export function TaskDetail() {
  const { store, map } = useWorkspace()
  const { detailTaskId, closeDetail } = useUI()
  const { updateTask, deleteTask, moveTask, toggleComplete } = useTaskActions()

  const task = detailTaskId ? store?.getTask(detailTaskId) : undefined

  if (!task) return null

  const category = map.categories.find((candidate) => candidate.id === task.categoryId)
  const quadrant = typeof task.quadrant === "number" ? QUADRANTS.find((q) => q.id === task.quadrant) : undefined
  const context = [quadrant?.name ?? "Inbox", category?.name, task.dueDate ? formatDueDate(task.dueDate) : undefined]
    .filter(Boolean)
    .join(" · ")

  return (
    <aside className="fixed bottom-[28px] right-0 top-[48px] z-20 flex w-[320px] max-w-full flex-col gap-4 overflow-y-auto border-l border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[1px] text-faint">Task</span>
        <button
          type="button"
          aria-label="Close task detail"
          onClick={closeDetail}
          className="flex h-6 w-6 items-center justify-center rounded-[4px] text-faint outline-none hover:bg-hover hover:text-muted focus-visible:ring-2 focus-visible:ring-accent"
        >
          <X className="h-[15px] w-[15px]" />
        </button>
      </div>

      <EditableTitle value={task.title} onCommit={(next) => updateTask(task.id, { title: next })} />

      <div className="flex items-center gap-2 text-[11px] text-faint">
        {category ? (
          <span
            className="h-[6px] w-[6px] rounded-full"
            style={{ background: CATEGORY_COLORS[category.color - 1] }}
            aria-hidden
          />
        ) : null}
        <span>{task.completedAt ? `Done · ${context}` : context}</span>
      </div>

      <div className="h-px bg-line" />

      <Field label="Quadrant">
        <select
          className={selectClass}
          value={String(task.quadrant)}
          onChange={(event) => moveTask(task.id, event.target.value as TaskLocation, null)}
        >
          {QUADRANTS.map((q) => (
            <option key={q.id} value={String(q.id)}>
              {q.number} {q.name}
            </option>
          ))}
          <option value="inbox">Inbox</option>
        </select>
      </Field>

      <Field label="Category">
        <select
          className={selectClass}
          value={task.categoryId ?? ""}
          onChange={(event) => updateTask(task.id, { categoryId: event.target.value || undefined })}
        >
          <option value="">No category</option>
          {map.categories.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {candidate.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Due date">
        <input
          type="date"
          className={selectClass}
          value={task.dueDate ?? ""}
          onChange={(event) => updateTask(task.id, { dueDate: event.target.value || undefined })}
        />
      </Field>

      <Field label="Notes">
        <textarea
          value={task.notes ?? ""}
          onChange={(event) => updateTask(task.id, { notes: event.target.value || undefined })}
          rows={5}
          placeholder="Add notes…"
          className="w-full resize-none rounded-[4px] border border-line bg-surface p-2 text-[13px] text-ink outline-none placeholder:text-faint focus-visible:ring-2 focus-visible:ring-accent"
        />
      </Field>

      <div className="h-px bg-line" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => toggleComplete(task.id)}
          className="rounded-[4px] border border-line px-2.5 py-1 text-[13px] text-ink outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          {task.completedAt ? "Restore" : "Complete"}
        </button>
        <button
          type="button"
          onClick={() => deleteTask(task.id)}
          className="rounded-[4px] border border-line px-2.5 py-1 text-[13px] text-ink outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent"
        >
          Delete
        </button>
      </div>

      <div className="mt-auto flex flex-col gap-1 pt-2 text-[11px] text-faint">
        <span>Space complete · 1–4 move quadrant</span>
        <span>E rename · ⌫ delete task</span>
      </div>
    </aside>
  )
}
