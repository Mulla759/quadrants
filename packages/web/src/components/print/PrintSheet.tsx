import { createPortal } from "react-dom"
import { Printer, X } from "lucide-react"
import {
  CATEGORY_COLORS,
  QUADRANTS,
  formatDueDate,
  todayKey,
  type Category,
  type QuadrantId,
  type Task,
} from "@quadrant/core"
import { cn } from "../../lib/utils"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"

const PRINT_ROWS: QuadrantId[][] = [
  [3, 1],
  [4, 2],
]

const RULE = "border-[#1f1f1f]/15"

function quadrant(id: QuadrantId) {
  return QUADRANTS.find((entry) => entry.id === id) as (typeof QUADRANTS)[number]
}

function TaskLine({
  task,
  category,
  numbered,
}: {
  task: Task
  category: Category | undefined
  numbered?: number
}) {
  const completed = Boolean(task.completedAt)
  const meta = [category?.name, task.dueDate ? formatDueDate(task.dueDate) : undefined]
    .filter(Boolean)
    .join(" · ")
  return (
    <li className="flex items-center gap-[8px] text-[12px] leading-[18px]">
      {numbered ? (
        <span className="w-[12px] shrink-0 text-right font-mono text-[10px] text-[#999]">
          {numbered}
        </span>
      ) : null}
      <span
        className={cn(
          "flex h-[12px] w-[12px] shrink-0 items-center justify-center rounded-[2px] border",
          completed ? "border-[#999] bg-[#999]" : "border-[#555]",
        )}
        aria-hidden
      >
        {completed ? (
          <svg viewBox="0 0 10 10" className="h-[8px] w-[8px] text-white" fill="none">
            <path d="M1.5 5.2 4 7.5 8.5 2.6" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        ) : null}
      </span>
      <span className={cn("min-w-0 flex-1 truncate", completed && "text-[#a1a1aa] line-through")}>
        {task.title}
      </span>
      {category ? (
        <span
          className="h-[6px] w-[6px] shrink-0 rounded-full"
          style={{ backgroundColor: CATEGORY_COLORS[category.color - 1] }}
          aria-hidden
        />
      ) : null}
      {meta ? <span className="shrink-0 text-[10px] text-[#888]">{meta}</span> : null}
    </li>
  )
}

function QuadrantCell({
  id,
  tasks,
  categories,
  className,
}: {
  id: QuadrantId
  tasks: Task[]
  categories: Category[]
  className?: string
}) {
  const info = quadrant(id)
  const open = tasks.filter((task) => !task.completedAt).length
  return (
    <div className={cn("print-cell flex flex-col gap-[10px] p-[24px]", RULE, className)}>
      <div className="flex items-baseline gap-[8px]">
        <span className="font-mono text-[11px] text-[#888]">{info.number}</span>
        <span className="text-[16px] font-semibold tracking-[-0.2px]">{info.name}</span>
        <span className="ml-auto font-mono text-[11px] text-[#888]">{open}</span>
      </div>
      <p className="text-[11px] leading-[16px] text-[#777]">{info.description}</p>
      {tasks.length === 0 ? (
        <p className="text-[11px] text-[#b0b0b0]">Nothing here.</p>
      ) : (
        <ul className="flex flex-col gap-[6px]">
          {tasks.map((task) => (
            <TaskLine
              key={task.id}
              task={task}
              category={categories.find((entry) => entry.id === task.categoryId)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export function PrintSheet() {
  const { printOpen, setPrintOpen } = useUI()
  const { store, map, maps, activeMapId } = useWorkspace()

  if (!printOpen || !store) return null

  const activeMap = maps.find((entry) => entry.id === activeMapId)
  const allTasks = store.listTasks({ includeCompleted: true, includeArchived: false })
  const taskById = new Map(allTasks.map((task) => [task.id, task]))
  const plan = store.getPlan(todayKey())
  const focus = plan.focus
    .map((id) => taskById.get(id))
    .filter((task): task is Task => Boolean(task))
  const side = plan.sideQuests
    .map((id) => taskById.get(id))
    .filter((task): task is Task => Boolean(task))

  const openCount = allTasks.filter((task) => !task.completedAt).length
  const doneCount = allTasks.length - openCount
  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return createPortal(
    <div className="print-root print-overlay fixed inset-0 z-[60] overflow-y-auto bg-[#0F0F0FAA] px-4 py-8">
      <div className="print-toolbar mx-auto mb-4 flex w-full max-w-[880px] items-center justify-between">
        <span className="text-[13px] text-white/80">
          Print preview · {activeMap?.name ?? "Untitled map"}
        </span>
        <div className="flex items-center gap-[8px]">
          <button
            type="button"
            onClick={() => setPrintOpen(false)}
            className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] border border-white/20 px-[14px] text-[13px] font-medium text-white/90 outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X size={15} />
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] bg-white px-[14px] text-[13px] font-medium text-[#1f1f1f] outline-none hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <Printer size={15} />
            Print
          </button>
        </div>
      </div>

      <div className="print-enter print-paper mx-auto w-full max-w-[880px] rounded-[8px] bg-white p-[48px] text-[#1f1f1f] shadow-[0_24px_60px_#00000040]">
        <header className="flex items-end justify-between gap-[24px] border-b pb-[16px] border-[#1f1f1f]/20">
          <div className="flex flex-col gap-[4px]">
            <span className="font-mono text-[11px] tracking-[1.5px] text-[#888]">QUADRANT</span>
            <h1 className="text-[26px] font-semibold tracking-[-0.6px]">
              {activeMap?.name ?? "Untitled map"}
            </h1>
          </div>
          <div className="text-right text-[11px] leading-[17px] text-[#888]">
            <div>{dateLabel}</div>
            <div>
              {openCount} open · {doneCount} done
            </div>
          </div>
        </header>

        {focus.length + side.length > 0 ? (
          <section className={cn("mt-[24px] grid grid-cols-2 gap-[32px] border-b pb-[24px]", RULE)}>
            <div className="flex flex-col gap-[8px]">
              <span className="font-mono text-[11px] tracking-[1.5px] text-[#888]">
                TODAY · TOP THREE
              </span>
              {focus.length === 0 ? (
                <span className="text-[11px] text-[#b0b0b0]">Nothing picked.</span>
              ) : (
                <ul className="flex flex-col gap-[6px]">
                  {focus.map((task, index) => (
                    <TaskLine
                      key={task.id}
                      task={task}
                      numbered={index + 1}
                      category={map.categories.find((entry) => entry.id === task.categoryId)}
                    />
                  ))}
                </ul>
              )}
            </div>
            <div className="flex flex-col gap-[8px]">
              <span className="font-mono text-[11px] tracking-[1.5px] text-[#888]">
                TODAY · SIDE QUESTS
              </span>
              {side.length === 0 ? (
                <span className="text-[11px] text-[#b0b0b0]">Nothing picked.</span>
              ) : (
                <ul className="flex flex-col gap-[6px]">
                  {side.map((task) => (
                    <TaskLine
                      key={task.id}
                      task={task}
                      category={map.categories.find((entry) => entry.id === task.categoryId)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </section>
        ) : null}

        <section className="mt-[24px] grid grid-cols-2 border-t border-[#1f1f1f]/20">
          {PRINT_ROWS.flatMap((row, rowIndex) =>
            row.map((id, columnIndex) => (
              <QuadrantCell
                key={id}
                id={id}
                categories={map.categories}
                tasks={store.listTasks({
                  quadrant: id,
                  includeCompleted: true,
                  includeArchived: false,
                })}
                className={cn(
                  columnIndex === 0 && "border-r",
                  rowIndex === 0 && "border-b",
                )}
              />
            )),
          )}
        </section>

        <footer className="mt-[32px] flex items-center justify-between border-t pt-[12px] border-[#1f1f1f]/15 text-[10px] text-[#999]">
          <span>Printed from Quadrant · local-first, no account</span>
          <span>{new Date().toLocaleString()}</span>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
