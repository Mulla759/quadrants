import type { MapExport, MapStore, Workspace } from "@quadrant/core"
import { download, safeFilename } from "./utils"

export function exportMapToFile(store: MapStore, name: string): void {
  download(`${safeFilename(name)}.json`, store.exportJSON())
}

export async function importMapFromJSON(workspace: Workspace, json: string): Promise<string> {
  const parsed = JSON.parse(json) as Partial<MapExport>
  if (!parsed || !parsed.map || !Array.isArray(parsed.tasks)) {
    throw new Error("This file is not a Quadrant map export.")
  }
  const id = await workspace.createMap(parsed.map.name ? `${parsed.map.name}` : "Imported map", parsed.map.icon)
  const store = await workspace.openMap(id)

  const categoryIds = new Map<string, string>()
  for (const category of parsed.categories ?? []) {
    categoryIds.set(category.id, store.addCategory({ name: category.name, color: category.color }))
  }

  const taskIds = new Map<string, string>()
  for (const task of parsed.tasks) {
    const newId = store.addTask({
      title: task.title,
      quadrant: task.quadrant,
      categoryId: task.categoryId ? categoryIds.get(task.categoryId) : undefined,
      dueDate: task.dueDate,
      notes: task.notes,
      order: task.order,
    })
    taskIds.set(task.id, newId)
  }

  for (const plan of parsed.plans ?? []) {
    const focus = plan.focus.map((taskId) => taskIds.get(taskId)).filter((value): value is string => Boolean(value))
    const sideQuests = plan.sideQuests
      .map((taskId) => taskIds.get(taskId))
      .filter((value): value is string => Boolean(value))
    store.setFocus(plan.date, focus)
    store.setSideQuests(plan.date, sideQuests)
  }

  return id
}

export function pickJSONFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json,.json"
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      const reader = new FileReader()
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.click()
  })
}
