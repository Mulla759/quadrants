import { useCallback, useMemo } from "react"
import { orderAfter, orderBetween, type MapStore, type QuadrantId, type TaskLocation } from "@quadrant/core"
import { useUI } from "./ui"
import { useWorkspace } from "./workspace"

function computeOrder(store: MapStore, taskId: string, quadrant: TaskLocation, beforeTaskId: string | null): string {
  const siblings = store
    .listTasks({ quadrant, includeCompleted: true, includeArchived: true })
    .filter((task) => task.id !== taskId)
  if (!beforeTaskId) return orderAfter(siblings.at(-1)?.order)
  const index = siblings.findIndex((task) => task.id === beforeTaskId)
  if (index < 0) return orderAfter(siblings.at(-1)?.order)
  return orderBetween(siblings[index - 1]?.order, siblings[index]?.order)
}

export function useTaskActions() {
  const { store } = useWorkspace()
  const { pushToast, selectTask, closeDetail } = useUI()

  const addTask = useCallback(
    (input: {
      title: string
      quadrant: TaskLocation
      categoryId?: string
      dueDate?: string
      notes?: string
      order?: string
    }) => {
      const trimmed = input.title.trim()
      if (!store || !trimmed) return undefined
      return store.addTask({ ...input, title: trimmed })
    },
    [store],
  )

  const completeTask = useCallback(
    (id: string) => {
      const task = store?.getTask(id)
      if (!store || !task || task.completedAt) return
      store.completeTask(id)
      pushToast({
        message: "Task completed",
        actionLabel: "Undo",
        onAction: () => store.restoreTask(id),
      })
    },
    [store, pushToast],
  )

  const toggleComplete = useCallback(
    (id: string) => {
      const task = store?.getTask(id)
      if (!store || !task) return
      if (task.completedAt) store.restoreTask(id)
      else completeTask(id)
    },
    [store, completeTask],
  )

  const restoreTask = useCallback(
    (id: string) => {
      const task = store?.getTask(id)
      if (!store || !task) return
      store.restoreTask(id)
      if (store.getTask(id)?.archivedAt) {
        const snapshot = store.getTask(id)
        if (snapshot) {
          store.deleteTask(id)
          store.addTask({
            title: snapshot.title,
            quadrant: snapshot.quadrant,
            categoryId: snapshot.categoryId,
            dueDate: snapshot.dueDate,
            notes: snapshot.notes,
            order: snapshot.order,
          })
        }
      }
    },
    [store],
  )

  const deleteTask = useCallback(
    (id: string) => {
      if (!store) return
      store.deleteTask(id)
      selectTask(null)
      closeDetail()
    },
    [store, selectTask, closeDetail],
  )

  const moveTask = useCallback(
    (id: string, quadrant: TaskLocation, beforeTaskId: string | null = null) => {
      if (!store) return
      const order = computeOrder(store, id, quadrant, beforeTaskId)
      store.moveTask(id, quadrant, order)
    },
    [store],
  )

  const moveTaskToQuadrant = useCallback(
    (id: string, quadrant: QuadrantId) => {
      moveTask(id, quadrant, null)
    },
    [moveTask],
  )

  const updateTask = useCallback(
    (id: string, patch: Parameters<MapStore["updateTask"]>[1]) => {
      store?.updateTask(id, patch)
    },
    [store],
  )

  return useMemo(
    () => ({
      addTask,
      completeTask,
      toggleComplete,
      restoreTask,
      deleteTask,
      moveTask,
      moveTaskToQuadrant,
      updateTask,
    }),
    [
      addTask,
      completeTask,
      toggleComplete,
      restoreTask,
      deleteTask,
      moveTask,
      moveTaskToQuadrant,
      updateTask,
    ],
  )
}
