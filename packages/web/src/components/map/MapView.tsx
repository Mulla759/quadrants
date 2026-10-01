import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { useCallback, useMemo, useState } from "react"
import { QUADRANTS, type QuadrantId, type Task, type TaskLocation } from "@quadrant/core"
import { useTaskActions } from "../../lib/actions"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { Quadrant, type DropTarget } from "./Quadrant"
import { TaskRowStatic } from "./TaskRow"
import type { InlineTaskValue } from "./InlineTaskInput"

const VISUAL_ORDER: QuadrantId[] = [3, 1, 4, 2]

const isTaskCollision = (collision: { id: string | number }) => String(collision.id).startsWith("task:")

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args)
  const taskHits = pointer.filter(isTaskCollision)
  if (taskHits.length > 0) return taskHits
  if (pointer.length > 0) return pointer
  const closest = closestCenter(args)
  const closestTasks = closest.filter(isTaskCollision)
  return closestTasks.length > 0 ? closestTasks : closest
}

function AxisLabel({ children }: { children: string }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[1px] text-faint">{children}</span>
  )
}

export function MapView() {
  const { store, map } = useWorkspace()
  const {
    selectedTaskId,
    selectTask,
    setFocusedQuadrant,
    mobileQuadrant,
    setMobileQuadrant,
    creatingQuadrant,
    startCreate,
    cancelCreate,
    editingTaskId,
    stopEdit,
    openDetail,
  } = useUI()
  const { addTask, toggleComplete, updateTask, moveTask } = useTaskActions()

  const [activeId, setActiveId] = useState<string | null>(null)
  const [drop, setDrop] = useState<DropTarget | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const byQuadrant = useMemo(() => {
    const groups: Record<QuadrantId, Task[]> = { 1: [], 2: [], 3: [], 4: [] }
    for (const task of map.tasks) {
      if (typeof task.quadrant === "number") groups[task.quadrant].push(task)
    }
    return groups
  }, [map.tasks])

  const activeTask = activeId ? map.tasks.find((task) => task.id === activeId) : undefined

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveId(String(event.active.id))
    },
    [],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!store || !over) {
        setDrop(null)
        return
      }
      const activeTaskId = String(active.id)
      const overId = String(over.id)
      if (overId.startsWith("quadrant:")) {
        setDrop({ quadrant: overId.slice("quadrant:".length) as TaskLocation, beforeTaskId: null })
        return
      }
      const overTaskId = overId.slice("task:".length)
      if (overTaskId === activeTaskId) {
        setDrop(null)
        return
      }
      const overTask = store.getTask(overTaskId)
      if (!overTask) return
      const list = store
        .listTasks({ quadrant: overTask.quadrant, includeCompleted: true, includeArchived: true })
        .filter((task) => task.id !== activeTaskId)
      const index = list.findIndex((task) => task.id === overTaskId)
      const translated = active.rect.current.translated
      const draggedCenter = translated ? translated.top + translated.height / 2 : 0
      const overCenter = over.rect.top + over.rect.height / 2
      const insertIndex = draggedCenter < overCenter ? index : index + 1
      const beforeTaskId = list[insertIndex]?.id ?? null
      setDrop({ quadrant: overTask.quadrant, beforeTaskId })
    },
    [store],
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      const resolved = drop
      setDrop(null)
      if (!store || !over) return
      const activeTaskId = String(active.id)
      const overId = String(over.id)
      if (overId === activeTaskId) return
      let quadrant: TaskLocation | null = null
      let beforeTaskId: string | null = null
      if (overId.startsWith("quadrant:")) {
        quadrant = overId.slice("quadrant:".length) as TaskLocation
      } else if (resolved) {
        quadrant = resolved.quadrant
        beforeTaskId = resolved.beforeTaskId
      }
      if (quadrant) moveTask(activeTaskId, quadrant, beforeTaskId)
    },
    [store, drop, moveTask],
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setDrop(null)
  }, [])

  const renderQuadrant = (quadrantId: QuadrantId) => {
    const meta = QUADRANTS.find((quadrant) => quadrant.id === quadrantId)
    if (!meta) return null
    return (
      <Quadrant
        key={meta.id}
        id={meta.id}
        number={meta.number}
        name={meta.name}
        description={meta.description}
        tasks={byQuadrant[meta.id]}
        categories={map.categories}
        selectedTaskId={selectedTaskId}
        editingTaskId={editingTaskId}
        creating={creatingQuadrant === meta.id}
        drop={drop}
        onSelect={(id) => {
          selectTask(id)
          setFocusedQuadrant(meta.id)
        }}
        onToggle={toggleComplete}
        onOpenDetail={openDetail}
        onStartCreate={() => startCreate(meta.id)}
        onCancelCreate={cancelCreate}
        onSaveCreate={(value: InlineTaskValue) => {
          addTask({
            title: value.title,
            quadrant: meta.id,
            categoryId: value.categoryId,
            dueDate: value.dueDate,
          })
          cancelCreate()
        }}
        onSaveEdit={(taskId, value: InlineTaskValue) => {
          updateTask(taskId, { title: value.title, dueDate: value.dueDate, categoryId: value.categoryId })
          stopEdit()
        }}
        onCancelEdit={stopEdit}
      />
    )
  }

  const matrix = (
    <div className="relative grid min-h-0 flex-1 grid-cols-2 grid-rows-2 overflow-hidden">
      <span className="pointer-events-none absolute left-1/2 top-0 z-10 h-full w-px -translate-x-1/2 bg-axis" />
      <span className="pointer-events-none absolute left-0 top-1/2 z-10 h-px w-full -translate-y-1/2 bg-axis" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bg ring-1 ring-axis" />
      {VISUAL_ORDER.map(renderQuadrant)}
    </div>
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="hidden min-h-0 flex-1 flex-col gap-2 px-8 py-4 md:flex">
        <div className="flex justify-center">
          <AxisLabel>↑ More important</AxisLabel>
        </div>
        <div className="flex min-h-0 flex-1 gap-2">
          <div className="flex w-[14px] items-center justify-center">
            <span className="rotate-180 font-mono text-[10px] uppercase tracking-[1px] text-faint [writing-mode:vertical-rl]">
              Less urgent
            </span>
          </div>
          {matrix}
          <div className="flex w-[14px] items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-[1px] text-faint [writing-mode:vertical-rl]">
              More urgent
            </span>
          </div>
        </div>
        <div className="flex justify-center">
          <AxisLabel>↓ Less important</AxisLabel>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 md:hidden">
        <div className="grid grid-cols-2 gap-1">
          {VISUAL_ORDER.map((quadrantId) => {
            const meta = QUADRANTS.find((quadrant) => quadrant.id === quadrantId)
            if (!meta) return null
            const active = mobileQuadrant === quadrantId
            return (
              <button
                key={quadrantId}
                type="button"
                onClick={() => setMobileQuadrant(quadrantId)}
                className={
                  "flex h-[30px] items-center justify-between rounded-[4px] border px-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-accent " +
                  (active ? "border-accent bg-[#3E63DD08] text-ink" : "border-line text-muted")
                }
              >
                <span className="truncate">
                  <span className="font-mono text-[10px] text-faint">{meta.number}</span> {meta.name}
                </span>
                <span className="font-mono text-[10px] text-faint">{byQuadrant[quadrantId].length}</span>
              </button>
            )
          })}
        </div>
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[4px] border border-line">
          {renderQuadrant(mobileQuadrant)}
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskRowStatic
            task={activeTask}
            category={map.categories.find((category) => category.id === activeTask.categoryId)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
