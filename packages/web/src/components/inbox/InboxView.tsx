import { useState } from "react"
import { useTaskActions } from "../../lib/actions"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { InlineTaskInput, type InlineTaskValue } from "../map/InlineTaskInput"
import { TaskRowBase } from "../map/TaskRow"

export function InboxView() {
  const { store, map } = useWorkspace()
  const { selectedTaskId, selectTask, openDetail } = useUI()
  const { toggleComplete, addTask } = useTaskActions()
  const [adding, setAdding] = useState(false)

  const tasks = map.tasks.filter((task) => task.quadrant === "inbox")

  const handleSave = (value: InlineTaskValue) => {
    addTask({
      title: value.title,
      quadrant: "inbox",
      categoryId: value.categoryId,
      dueDate: value.dueDate,
    })
    setAdding(false)
  }

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-8">
      <div className="flex w-full max-w-[560px] flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-[20px] font-semibold text-ink">Inbox</h1>
          <p className="text-[11px] text-faint">Unplaced tasks · drag or move them onto the map</p>
        </header>

        <div className="flex flex-col gap-[2px]">
          {tasks.map((task) => (
            <TaskRowBase
              key={task.id}
              task={task}
              category={map.categories.find((category) => category.id === task.categoryId)}
              selected={selectedTaskId === task.id}
              onSelect={() => selectTask(task.id)}
              onToggle={() => toggleComplete(task.id)}
              onOpenDetail={() => openDetail(task.id)}
            />
          ))}

          {adding ? (
            <InlineTaskInput categories={map.categories} onSave={handleSave} onCancel={() => setAdding(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2 text-[14px] text-faint outline-none hover:bg-hover hover:text-muted focus-visible:ring-2 focus-visible:ring-accent"
            >
              New task
            </button>
          )}
        </div>

        {tasks.length === 0 && !adding && store ? (
          <p className="text-[13px] text-muted">Inbox zero. Nothing unplaced.</p>
        ) : null}
      </div>
    </div>
  )
}
