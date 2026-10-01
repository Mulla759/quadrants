import { useDraggable, useDroppable } from "@dnd-kit/core"
import { Check, GripVertical, MoreHorizontal } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { CATEGORY_COLORS, formatDueDate, type Category, type Task } from "@quadrant/core"
import { cn } from "../../lib/utils"
import { animateScribble, drawScribble, SCRIBBLE_HEIGHT } from "../../lib/scribble"

function useTitleWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const measure = () => setWidth(Math.min(node.scrollWidth, node.clientWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

function Scribble({ width, animate }: { width: number; animate: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || width <= 0) return
    if (!animate) {
      drawScribble(canvas, width, 1)
      return
    }
    return animateScribble(canvas, width)
  }, [width, animate])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={{ width, height: SCRIBBLE_HEIGHT }}
    />
  )
}

export interface TaskRowBaseProps {
  task: Task
  category?: Category
  selected?: boolean
  dropBefore?: boolean
  dragging?: boolean
  handle?: ReactNode
  showEllipsis?: boolean
  onSelect?: () => void
  onToggle?: () => void
  onOpenDetail?: () => void
}

export function TaskRowBase({
  task,
  category,
  selected,
  dropBefore,
  dragging,
  handle,
  showEllipsis = true,
  onSelect,
  onToggle,
  onOpenDetail,
}: TaskRowBaseProps) {
  const completed = Boolean(task.completedAt)
  const { ref: titleRef, width: titleWidth } = useTitleWidth<HTMLSpanElement>()

  const metaParts: string[] = []
  if (completed) {
    metaParts.push("Done")
  } else {
    if (category) metaParts.push(category.name)
    if (task.dueDate) metaParts.push(formatDueDate(task.dueDate))
  }
  const meta = metaParts.join(" · ")

  return (
    <div className="relative">
      {dropBefore ? (
        <span className="pointer-events-none absolute -top-[2px] left-2 right-2 z-10 h-[2px] bg-accent">
          <span className="absolute -left-1 -top-[2px] h-[6px] w-[6px] rounded-full bg-accent" />
        </span>
      ) : null}
      <div
        role="option"
        aria-selected={selected}
        tabIndex={-1}
        data-task-id={task.id}
        onClick={onSelect}
        className={cn(
          "group/row flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2 text-left",
          selected ? "bg-selected" : "hover:bg-hover",
          dragging && "opacity-40",
        )}
      >
        {handle ?? <span className="h-[14px] w-[14px] shrink-0" aria-hidden />}
        <button
          type="button"
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          onClick={(event) => {
            event.stopPropagation()
            onToggle?.()
          }}
          className={cn(
            "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent",
            completed ? "border-muted" : "border-muted/60 hover:border-accent",
          )}
        >
          {completed ? <Check className="h-[10px] w-[10px]" strokeWidth={3} /> : null}
        </button>
        <div className="relative min-w-0 flex-1">
          <span
            ref={titleRef}
            className={cn("block truncate text-[14px]", completed ? "text-faint" : "text-ink")}
          >
            {task.title}
          </span>
          {completed ? <Scribble width={titleWidth} animate /> : null}
        </div>
        {category && !completed ? (
          <span
            className="h-[6px] w-[6px] shrink-0 rounded-full"
            style={{ background: CATEGORY_COLORS[category.color - 1] }}
            aria-hidden
          />
        ) : null}
        {meta ? <span className="shrink-0 whitespace-nowrap text-[11px] text-faint">{meta}</span> : null}
        {showEllipsis ? (
          <button
            type="button"
            aria-label="Open task detail"
            onClick={(event) => {
              event.stopPropagation()
              onOpenDetail?.()
            }}
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-faint outline-none hover:text-muted focus-visible:ring-2 focus-visible:ring-accent",
              selected ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
            )}
          >
            <MoreHorizontal className="h-[15px] w-[15px]" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export interface TaskRowProps extends Omit<TaskRowBaseProps, "handle" | "dragging"> {
  dragDisabled?: boolean
}

export function TaskRow({ dragDisabled, ...props }: TaskRowProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } = useDraggable({
    id: props.task.id,
    data: { type: "task", taskId: props.task.id, quadrant: props.task.quadrant },
    disabled: dragDisabled,
  })
  const { setNodeRef: setDropRef } = useDroppable({
    id: `task:${props.task.id}`,
    data: { type: "task", taskId: props.task.id, quadrant: props.task.quadrant },
    disabled: dragDisabled,
  })

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node)
      setDropRef(node)
    },
    [setNodeRef, setDropRef],
  )

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label="Drag task"
      {...attributes}
      {...listeners}
      className={cn(
        "flex h-[14px] w-[14px] shrink-0 cursor-grab items-center justify-center rounded-[2px] text-faint outline-none hover:text-muted focus-visible:ring-2 focus-visible:ring-accent active:cursor-grabbing",
        props.selected ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
      )}
    >
      <GripVertical className="h-[14px] w-[14px]" />
    </button>
  )

  return (
    <div ref={setRefs} className="relative">
      <TaskRowBase {...props} dragging={isDragging} handle={handle} />
    </div>
  )
}

export function TaskRowStatic({ task, category }: { task: Task; category?: Category }) {
  return (
    <div className="w-[300px] rounded-[4px] border border-line bg-surface shadow-[0_4px_12px_#0000001A]">
      <TaskRowBase task={task} category={category} showEllipsis={false} />
    </div>
  )
}
