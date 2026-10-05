import { useDroppable } from "@dnd-kit/core"
import { Plus } from "lucide-react"
import type { Category, QuadrantId, Task, TaskLocation } from "@quadrant/core"
import { cn } from "../../lib/utils"
import { InlineTaskInput, type InlineTaskValue } from "./InlineTaskInput"
import { TaskRow } from "./TaskRow"

export interface DropTarget {
  quadrant: TaskLocation
  beforeTaskId: string | null
}

interface QuadrantProps {
  id: QuadrantId
  number: string
  name: string
  description: string
  tasks: Task[]
  categories: Category[]
  selectedTaskId: string | null
  editingTaskId: string | null
  creating: boolean
  drop: DropTarget | null
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  onOpenDetail: (id: string) => void
  onStartCreate: () => void
  onCancelCreate: () => void
  onSaveCreate: (value: InlineTaskValue) => void
  onSaveEdit: (taskId: string, value: InlineTaskValue) => void
  onCancelEdit: () => void
}

export function Quadrant({
  id,
  number,
  name,
  description,
  tasks,
  categories,
  selectedTaskId,
  editingTaskId,
  creating,
  drop,
  onSelect,
  onToggle,
  onOpenDetail,
  onStartCreate,
  onCancelCreate,
  onSaveCreate,
  onSaveEdit,
  onCancelEdit,
}: QuadrantProps) {
  const { setNodeRef } = useDroppable({ id: `quadrant:${id}`, data: { type: "quadrant", quadrant: id } })
  const tinted = drop?.quadrant === id
  const showEndDrop = tinted && drop?.beforeTaskId === null

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 flex-col gap-4 overflow-hidden p-6 transition-colors",
        tinted ? "bg-[#3E63DD08]" : "bg-transparent",
      )}
      aria-label={`${number} ${name}`}
    >
      <header className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-faint">{number}</span>
          <span className="text-[13px] font-medium text-ink">{name}</span>
          <span className="font-mono text-[11px] text-faint">{tasks.length}</span>
        </div>
        <p className="text-[11px] text-faint">{description}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-y-auto" role="listbox" aria-label={`${name} tasks`}>
        {tasks.map((task) => {
          if (editingTaskId === task.id) {
            return (
              <InlineTaskInput
                key={task.id}
                categories={categories}
                initialTitle={task.title}
                initialDueDate={task.dueDate ?? ""}
                initialCategoryId={task.categoryId ?? ""}
                onSave={(value) => onSaveEdit(task.id, value)}
                onCancel={onCancelEdit}
              />
            )
          }
          return (
            <TaskRow
              key={task.id}
              task={task}
              category={categories.find((category) => category.id === task.categoryId)}
              selected={selectedTaskId === task.id}
              dropBefore={tinted && drop?.beforeTaskId === task.id}
              onSelect={() => onSelect(task.id)}
              onToggle={() => onToggle(task.id)}
              onOpenDetail={() => onOpenDetail(task.id)}
            />
          )
        })}

        {creating ? (
          <InlineTaskInput categories={categories} onSave={onSaveCreate} onCancel={onCancelCreate} />
        ) : (
          <>
            {showEndDrop ? (
              <span className="pointer-events-none relative h-[2px] bg-accent">
                <span className="absolute -top-[2px] left-0 h-[6px] w-[6px] rounded-full bg-accent" />
              </span>
            ) : null}
            <button
              type="button"
              onClick={onStartCreate}
              className="flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2 text-[14px] text-faint outline-none hover:bg-hover hover:text-muted focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Plus className="h-[15px] w-[15px]" />
              New task
            </button>
          </>
        )}
      </div>
    </section>
  )
}
