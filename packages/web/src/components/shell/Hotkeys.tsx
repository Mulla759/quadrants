import { useEffect } from "react"
import { todayKey, type QuadrantId, type Task } from "@quadrant/core"
import { useTaskActions } from "../../lib/actions"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { isEditableTarget } from "../../lib/utils"

const VISUAL_ORDER: QuadrantId[] = [3, 1, 4, 2]
const HORIZONTAL: Record<QuadrantId, QuadrantId> = { 1: 3, 3: 1, 2: 4, 4: 2 }

export function Hotkeys() {
  const { store, theme, setTheme } = useWorkspace()
  const ui = useUI()
  const { completeTask, deleteTask, moveTaskToQuadrant } = useTaskActions()

  useEffect(() => {
    const scrollTo = (taskId: string) => {
      requestAnimationFrame(() => {
        document.querySelector(`[data-task-id="${taskId}"]`)?.scrollIntoView({ block: "nearest" })
      })
    }

    const listForView = (): Task[] => {
      if (!store) return []
      if (ui.view === "inbox") return store.listTasks({ quadrant: "inbox" })
      if (ui.view === "archive") {
        return store
          .listTasks({ includeArchived: true })
          .filter((task) => task.archivedAt)
          .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0))
      }
      if (ui.view === "today") {
        const plan = store.getPlan(todayKey())
        const byId = new Map(store.listTasks().map((task) => [task.id, task]))
        return [...plan.focus, ...plan.sideQuests]
          .map((id) => byId.get(id))
          .filter((task): task is Task => Boolean(task))
      }
      const all = store.listTasks()
      return VISUAL_ORDER.flatMap((quadrant) => all.filter((task) => task.quadrant === quadrant))
    }

    const selectAt = (task: Task | undefined) => {
      if (!task) return
      ui.selectTask(task.id)
      if (typeof task.quadrant === "number") ui.setFocusedQuadrant(task.quadrant)
      scrollTo(task.id)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey

      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault()
        ui.setPaletteOpen(true)
        return
      }
      if (mod && event.shiftKey && event.key.toLowerCase() === "l") {
        event.preventDefault()
        setTheme(theme === "dark" ? "light" : "dark")
        return
      }
      if (event.key === "Escape") {
        if (ui.paletteOpen) ui.setPaletteOpen(false)
        else if (ui.searchOpen) ui.setSearchOpen(false)
        else if (ui.categoriesOpen) ui.setCategoriesOpen(false)
        else if (ui.detailTaskId) ui.closeDetail()
        else if (ui.editingTaskId) ui.stopEdit()
        else if (ui.creatingQuadrant) ui.cancelCreate()
        else ui.selectTask(null)
        return
      }

      if (isEditableTarget(event.target)) return
      if (ui.paletteOpen || ui.searchOpen || ui.categoriesOpen || ui.detailTaskId) return

      if (event.key === "/") {
        event.preventDefault()
        ui.setSearchOpen(true)
        return
      }

      if (event.key === "n" || event.key === "N") {
        event.preventDefault()
        ui.startCreate(ui.focusedQuadrant)
        return
      }

      const selected = ui.selectedTaskId ? store?.getTask(ui.selectedTaskId) : undefined

      if (event.key === "e" || event.key === "E") {
        if (selected) {
          event.preventDefault()
          ui.startEdit(selected.id)
        }
        return
      }

      if (event.key === " " || event.key === "Spacebar") {
        if (selected) {
          event.preventDefault()
          completeTask(selected.id)
        }
        return
      }

      if (["1", "2", "3", "4"].includes(event.key) && !mod) {
        if (selected) {
          event.preventDefault()
          const quadrant = Number(event.key) as QuadrantId
          moveTaskToQuadrant(selected.id, quadrant)
          ui.setFocusedQuadrant(quadrant)
        }
        return
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        if (selected) {
          event.preventDefault()
          deleteTask(selected.id)
        }
        return
      }

      if (event.key === "Enter") {
        if (selected) {
          event.preventDefault()
          ui.openDetail(selected.id)
        }
        return
      }

      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        const list = listForView()
        if (list.length === 0) return
        event.preventDefault()
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          if (ui.view !== "map") return
          const target = HORIZONTAL[ui.focusedQuadrant]
          ui.setFocusedQuadrant(target)
          const first = list.find((task) => task.quadrant === target)
          if (first) selectAt(first)
          return
        }
        const index = list.findIndex((task) => task.id === ui.selectedTaskId)
        if (event.key === "ArrowDown") {
          selectAt(list[index < 0 ? 0 : Math.min(index + 1, list.length - 1)])
        } else {
          selectAt(list[index <= 0 ? 0 : index - 1])
        }
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [store, theme, setTheme, ui, completeTask, deleteTask, moveTaskToQuadrant])

  return null
}
