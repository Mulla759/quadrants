import { Check, Plus, X } from "lucide-react"
import { useMemo, useState } from "react"
import { CATEGORY_COLORS, FOCUS_LIMIT, formatDueDate, todayKey, type Category, type Task } from "@quadrant/core"
import { useTaskActions } from "../../lib/actions"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { cn } from "../../lib/utils"
import { AddPickDialog, type PickSection } from "./AddPickDialog"

interface PickRowProps {
  task: Task
  category?: Category
  index?: number
  selected: boolean
  onSelect: () => void
  onToggle: () => void
  onOpenDetail: () => void
  onRemove: () => void
}

function PickRow({ task, category, index, selected, onSelect, onToggle, onOpenDetail, onRemove }: PickRowProps) {
  const completed = Boolean(task.completedAt)
  const meta = [category?.name, task.dueDate ? formatDueDate(task.dueDate) : undefined].filter(Boolean).join(" · ")
  return (
    <div
      data-task-id={task.id}
      className={cn(
        "group/row flex h-[30px] items-center gap-2 rounded-[4px] px-2",
        selected ? "bg-selected" : "hover:bg-hover",
      )}
      onClick={onSelect}
    >
      {index ? <span className="w-4 shrink-0 font-mono text-[11px] text-faint">{index}</span> : <span className="w-1" />}
      <button
        type="button"
        aria-label={completed ? "Mark incomplete" : "Mark complete"}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
        className={cn(
          "flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full border text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent",
          completed ? "border-muted" : "border-muted/60 hover:border-accent",
        )}
      >
        {completed ? <Check className="h-[10px] w-[10px]" strokeWidth={3} /> : null}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onOpenDetail()
        }}
        className={cn(
          "min-w-0 flex-1 truncate text-left text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-accent",
          completed ? "text-faint" : "text-ink",
        )}
      >
        {task.title}
      </button>
      {category ? (
        <span
          className="h-[6px] w-[6px] shrink-0 rounded-full"
          style={{ background: CATEGORY_COLORS[category.color - 1] }}
          aria-hidden
        />
      ) : null}
      {meta ? <span className="shrink-0 whitespace-nowrap text-[11px] text-faint">{meta}</span> : null}
      <button
        type="button"
        aria-label="Remove pick"
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-faint opacity-0 outline-none hover:text-muted focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover/row:opacity-100"
      >
        <X className="h-[14px] w-[14px]" />
      </button>
    </div>
  )
}

export function TodayView() {
  const { store, map } = useWorkspace()
  const { selectedTaskId, selectTask, openDetail } = useUI()
  const { toggleComplete } = useTaskActions()
  const [pickerSection, setPickerSection] = useState<PickSection | null>(null)

  const date = todayKey()
  const plan = store?.getPlan(date) ?? { date, focus: [], sideQuests: [] }

  const taskById = useMemo(() => new Map(map.tasks.map((task) => [task.id, task])), [map.tasks])
  const focusTasks = plan.focus.map((id) => taskById.get(id)).filter((task): task is Task => Boolean(task))
  const sideTasks = plan.sideQuests.map((id) => taskById.get(id)).filter((task): task is Task => Boolean(task))
  const picked = new Set([...plan.focus, ...plan.sideQuests])

  const candidates = map.tasks.filter((task) => !task.completedAt && !picked.has(task.id))
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  const removePick = (section: PickSection, id: string) => {
    if (!store) return
    if (section === "focus") store.removeFocus(date, id)
    else store.removeSideQuest(date, id)
  }

  const addPick = (section: PickSection, id: string) => {
    if (!store) return
    if (section === "focus") store.addFocus(date, id)
    else store.addSideQuest(date, id)
    setPickerSection(null)
  }

  const renderSection = (
    section: PickSection,
    title: string,
    subtitle: string,
    tasks: Task[],
  ) => (
    <section className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-medium text-ink">{title}</h2>
          <span className="font-mono text-[11px] text-faint">
            {tasks.length} / {FOCUS_LIMIT}
          </span>
        </div>
        <p className="text-[11px] text-faint">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-[2px]">
        {tasks.map((task, index) => (
          <PickRow
            key={task.id}
            task={task}
            category={map.categories.find((category) => category.id === task.categoryId)}
            index={section === "focus" ? index + 1 : undefined}
            selected={selectedTaskId === task.id}
            onSelect={() => selectTask(task.id)}
            onToggle={() => toggleComplete(task.id)}
            onOpenDetail={() => openDetail(task.id)}
            onRemove={() => removePick(section, task.id)}
          />
        ))}
        {tasks.length < FOCUS_LIMIT ? (
          <button
            type="button"
            onClick={() => setPickerSection(section)}
            className="flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2 text-[14px] text-faint outline-none hover:bg-hover hover:text-muted focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Plus className="h-[15px] w-[15px]" />
            Add pick
          </button>
        ) : null}
      </div>
    </section>
  )

  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-y-auto px-4 py-8">
      <div className="flex w-full max-w-[560px] flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-[20px] font-semibold text-ink">Today</h1>
          <p className="text-[11px] text-faint">{todayLabel} · picks stay until done</p>
        </header>

        {renderSection(
          "focus",
          "Top three",
          "Urgent + important — pick up to three",
          focusTasks,
        )}
        {renderSection(
          "sideQuests",
          "Side quests",
          "Rest, play, people — keep the day balanced",
          sideTasks,
        )}

        {focusTasks.length === 0 && sideTasks.length === 0 ? (
          <p className="text-[13px] text-muted">Nothing picked yet. Choose a few things for today.</p>
        ) : null}
      </div>

      <AddPickDialog
        open={pickerSection !== null}
        section={pickerSection ?? "focus"}
        candidates={candidates}
        categories={map.categories}
        onOpenChange={(open) => setPickerSection(open ? pickerSection ?? "focus" : null)}
        onPick={(id) => addPick(pickerSection ?? "focus", id)}
      />
    </div>
  )
}
