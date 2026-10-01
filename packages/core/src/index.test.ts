import { describe, expect, it } from "vitest"
import {
  MapStore,
  Workspace,
  formatDueDate,
  orderAfter,
  orderBetween,
  sortByOrder,
  todayKey,
} from "./index"

describe("ordering", () => {
  it("appends after the last key", () => {
    const a = orderAfter()
    const b = orderAfter(a)
    expect(a < b).toBe(true)
  })

  it("inserts between two keys", () => {
    const a = orderAfter()
    const b = orderAfter(a)
    const mid = orderBetween(a, b)
    expect(a < mid && mid < b).toBe(true)
  })

  it("sorts by order", () => {
    const b = orderAfter()
    const a = orderAfter(b)
    expect(sortByOrder([{ order: a }, { order: b }]).map((x) => x.order)).toEqual([b, a])
  })
})

describe("dates", () => {
  it("formats relative due dates", () => {
    const now = new Date("2026-10-01T09:00:00")
    expect(formatDueDate(todayKey(now), now)).toBe("Today")
    expect(formatDueDate("2026-10-02", now)).toBe("Tomorrow")
    expect(formatDueDate("2026-10-03", now)).toBe("Sat")
    expect(formatDueDate("2026-10-12", now)).toBe("Oct 12")
  })
})

describe("MapStore", () => {
  it("adds, moves and completes tasks", async () => {
    const store = await MapStore.open("test-map")
    const id = store.addTask({ title: "Finish landing page", quadrant: 1 })
    expect(store.listTasks({ quadrant: 1 })).toHaveLength(1)
    store.moveTask(id, 2, orderAfter())
    expect(store.getTask(id)?.quadrant).toBe(2)
    store.completeTask(id)
    expect(store.getTask(id)?.completedAt).toBeTypeOf("number")
    store.restoreTask(id)
    expect(store.getTask(id)?.completedAt).toBeUndefined()
    store.destroy()
  })

  it("caps focus and side quests and carries undone picks over", async () => {
    const store = await MapStore.open("test-plan")
    const ids = [1, 2, 3, 4].map((n) => store.addTask({ title: `Task ${n}`, quadrant: 1 }))
    store.setFocus("2026-10-01", ids)
    expect(store.getPlan("2026-10-01").focus).toHaveLength(3)
    store.addSideQuest("2026-10-01", ids[0])
    store.addSideQuest("2026-10-01", ids[1])
    store.completeTask(ids[0])
    store.carryOver("2026-10-01", "2026-10-02")
    expect(store.getPlan("2026-10-02").focus).toEqual([ids[1], ids[2]])
    expect(store.getPlan("2026-10-02").sideQuests).toEqual([ids[1]])
    store.destroy()
  })

  it("detaches a deleted category from its tasks", async () => {
    const store = await MapStore.open("test-category")
    const categoryId = store.addCategory({ name: "Website", color: 2 })
    const taskId = store.addTask({ title: "Ship hero", quadrant: 1, categoryId })
    store.deleteCategory(categoryId)
    expect(store.getTask(taskId)?.categoryId).toBeUndefined()
    store.destroy()
  })

  it("round-trips through export and import", async () => {
    const store = await MapStore.open("test-export")
    store.addTask({ title: "Send project proposal", quadrant: 2, dueDate: "2026-10-03" })
    const imported = await MapStore.importJSON(store.exportJSON())
    expect(imported.mapId).not.toBe(store.mapId)
    expect(imported.listTasks()).toHaveLength(1)
    expect(imported.listTasks()[0].title).toBe("Send project proposal")
    store.destroy()
    imported.destroy()
  })

  it("archives completed tasks after the window", async () => {
    const store = await MapStore.open("test-archive")
    const id = store.addTask({ title: "Old task", quadrant: 4 })
    store.completeTask(id)
    const archived = store.archiveCompleted(0)
    expect(archived).toBe(1)
    expect(store.getTask(id)?.archivedAt).toBeTypeOf("number")
    expect(store.listTasks()).toHaveLength(0)
    store.destroy()
  })
})

describe("Workspace", () => {
  it("creates the default maps and tracks the active map", async () => {
    const workspace = await Workspace.open()
    const maps = workspace.listMaps().map((m) => m.name)
    expect(maps).toEqual(["Work", "School", "Personal"])
    expect(workspace.activeMapId).toBeDefined()
    workspace.destroy()
  })
})
