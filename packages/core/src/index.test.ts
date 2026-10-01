import { afterEach, describe, expect, it } from "vitest"
import {
  MapStore,
  Workspace,
  countTasks,
  formatDueDate,
  orderAfter,
  orderBefore,
  orderBetween,
  sortByOrder,
  todayKey,
  type Task,
} from "./index"

let sequence = 0
const uid = (label: string) => `${label}-${sequence++}`

const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0))

async function waitFor(condition: () => boolean, timeout = 2000): Promise<void> {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > timeout) throw new Error("waitFor timed out")
    await tick()
  }
}

function deleteDatabase(name: string): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name)
    request.onsuccess = () => resolve()
    request.onerror = () => resolve()
    request.onblocked = () => resolve()
  })
}

const openStores: MapStore[] = []
const openWorkspaces: Workspace[] = []

async function openMap(id: string): Promise<MapStore> {
  const store = await MapStore.open(id)
  openStores.push(store)
  return store
}

async function openWorkspace(): Promise<Workspace> {
  const workspace = await Workspace.open()
  openWorkspaces.push(workspace)
  return workspace
}

afterEach(async () => {
  for (const store of openStores.splice(0)) store.destroy()
  for (const workspace of openWorkspaces.splice(0)) workspace.destroy()
  await tick()
})

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

  it("prepends before the first key", () => {
    const first = orderAfter()
    const before = orderBefore(first)
    expect(before < first).toBe(true)
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
    expect(todayKey(now)).toBe("2026-10-01")
    expect(formatDueDate(todayKey(now), now)).toBe("Today")
    expect(formatDueDate("2026-10-02", now)).toBe("Tomorrow")
    expect(formatDueDate("2026-09-30", now)).toBe("Yesterday")
    expect(formatDueDate("2026-10-03", now)).toBe("Sat")
    expect(formatDueDate("2026-10-12", now)).toBe("Oct 12")
    expect(formatDueDate("2027-01-05", now)).toBe("Jan 5, 2027")
    expect(formatDueDate(undefined, now)).toBe("")
  })
})

describe("MapStore tasks", () => {
  it("defaults new tasks to the inbox and appends their order", async () => {
    const store = await openMap(uid("append"))
    const a = store.addTask({ title: "A" })
    const b = store.addTask({ title: "B" })
    expect(store.getTask(a)?.quadrant).toBe("inbox")
    expect(store.getTask(a)!.order < store.getTask(b)!.order).toBe(true)

    const explicit = orderAfter(store.getTask(b)!.order)
    const c = store.addTask({ title: "C", order: explicit })
    expect(store.getTask(c)?.order).toBe(explicit)
    expect(store.listTasks({ quadrant: "inbox" }).map((t) => t.title)).toEqual(["A", "B", "C"])
  })

  it("adds, moves, completes, restores and deletes tasks", async () => {
    const store = await openMap(uid("crud"))
    const id = store.addTask({ title: "Finish landing page", quadrant: 1 })
    expect(store.getTask(id)?.title).toBe("Finish landing page")
    expect(store.listTasks({ quadrant: 1 })).toHaveLength(1)

    const movedOrder = orderBetween(undefined, undefined)
    store.moveTask(id, 2, movedOrder)
    expect(store.getTask(id)?.quadrant).toBe(2)
    expect(store.getTask(id)?.order).toBe(movedOrder)
    expect(store.listTasks({ quadrant: 1 })).toHaveLength(0)
    expect(store.listTasks({ quadrant: 2 })).toHaveLength(1)

    store.completeTask(id)
    expect(store.getTask(id)?.completedAt).toBeTypeOf("number")
    expect(store.listTasks({ includeCompleted: false })).toHaveLength(0)

    store.restoreTask(id)
    expect(store.getTask(id)?.completedAt).toBeUndefined()
    expect(store.listTasks()).toHaveLength(1)

    store.setFocus("2026-10-01", [id])
    store.deleteTask(id)
    expect(store.getTask(id)).toBeUndefined()
    expect(store.getPlan("2026-10-01").focus).toEqual([])
  })

  it("keeps fractional ordering stable across reorders", async () => {
    const store = await openMap(uid("reorder"))
    const first = orderAfter()
    const second = orderAfter(first)
    const id1 = store.addTask({ title: "1", quadrant: 1, order: first })
    const id2 = store.addTask({ title: "2", quadrant: 1, order: second })
    const mid = orderBetween(first, second)
    store.addTask({ title: "mid", quadrant: 1, order: mid })
    expect(store.listTasks({ quadrant: 1 }).map((t) => t.title)).toEqual(["1", "mid", "2"])

    const before = orderBefore(first)
    store.addTask({ title: "0", quadrant: 1, order: before })
    expect(store.listTasks({ quadrant: 1 }).map((t) => t.title)).toEqual(["0", "1", "mid", "2"])

    const between = orderBetween(first, mid)
    store.moveTask(id2, 1, between)
    expect(store.listTasks({ quadrant: 1 }).map((t) => t.title)).toEqual(["0", "1", "2", "mid"])
    expect(store.getTask(id1)?.order).toBe(first)
  })

  it("filters completed and archived tasks by default", async () => {
    const store = await openMap(uid("filters"))
    const done = store.addTask({ title: "Done", quadrant: 1 })
    const archived = store.addTask({ title: "Archived", quadrant: 1 })
    store.completeTask(done)
    store.completeTask(archived)
    store.archiveCompleted(0)
    expect(store.listTasks()).toHaveLength(0)
    expect(store.listTasks({ includeCompleted: true, includeArchived: true })).toHaveLength(2)
    expect(countTasks(store)).toBe(0)
  })

  it("notifies subscribers on changes and stops after unsubscribe", async () => {
    const store = await openMap(uid("subscribe"))
    let calls = 0
    const unsubscribe = store.subscribe(() => {
      calls += 1
    })
    store.addTask({ title: "A" })
    expect(calls).toBeGreaterThan(0)
    const seen = calls
    unsubscribe()
    store.addTask({ title: "B" })
    expect(calls).toBe(seen)
  })

  it("reports saved only while a write is pending", async () => {
    const store = await openMap(uid("saved"))
    expect(store.saved).toBe(true)
    store.addTask({ title: "Saving" })
    expect(store.saved).toBe(false)
    await waitFor(() => store.saved)
    expect(store.saved).toBe(true)
  })
})

describe("MapStore plans", () => {
  it("caps and de-duplicates focus and side quests", async () => {
    const store = await openMap(uid("plan"))
    const ids = [1, 2, 3, 4].map((n) => store.addTask({ title: `Task ${n}`, quadrant: 1 }))
    store.setFocus("2026-10-01", [ids[0], ids[0], ids[1], ids[2], ids[3]])
    expect(store.getPlan("2026-10-01").focus).toEqual([ids[0], ids[1], ids[2]])

    store.addSideQuest("2026-10-01", ids[0])
    store.addSideQuest("2026-10-01", ids[1])
    store.addSideQuest("2026-10-01", ids[2])
    store.addSideQuest("2026-10-01", ids[3])
    expect(store.getPlan("2026-10-01").sideQuests).toEqual([ids[0], ids[1], ids[2]])

    store.removeSideQuest("2026-10-01", ids[1])
    expect(store.getPlan("2026-10-01").sideQuests).toEqual([ids[0], ids[2]])
  })

  it("carries over only undone picks, respecting caps", async () => {
    const store = await openMap(uid("carry"))
    const ids = [1, 2, 3, 4].map((n) => store.addTask({ title: `Task ${n}`, quadrant: 1 }))
    store.setFocus("2026-10-01", ids)
    store.setSideQuests("2026-10-01", ids)
    expect(store.getPlan("2026-10-01").focus).toEqual([ids[0], ids[1], ids[2]])
    store.completeTask(ids[0])
    store.carryOver("2026-10-01", "2026-10-02")
    expect(store.getPlan("2026-10-02").focus).toEqual([ids[1], ids[2]])
    expect(store.getPlan("2026-10-02").sideQuests).toEqual([ids[1], ids[2]])
  })
})

describe("MapStore categories", () => {
  it("appends categories with a color and detaches them on delete", async () => {
    const store = await openMap(uid("category"))
    const school = store.addCategory({ name: "School", color: 1 })
    const website = store.addCategory({ name: "Website", color: 8 })
    expect(store.listCategories().map((c) => c.name)).toEqual(["School", "Website"])
    expect(store.listCategories()[0].order < store.listCategories()[1].order).toBe(true)
    expect(store.listCategories()[1].color).toBe(8)

    const taskId = store.addTask({ title: "Ship hero", quadrant: 1, categoryId: website })
    const other = store.addTask({ title: "Other", quadrant: 2 })
    store.deleteCategory(website)
    expect(store.getTask(taskId)?.categoryId).toBeUndefined()
    expect(store.getTask(other)?.categoryId).toBeUndefined()
    expect(store.listCategories()).toHaveLength(1)
    expect(school).toBeTruthy()
  })
})

describe("MapStore archive", () => {
  it("archives completed tasks older than the window", async () => {
    const store = await openMap(uid("archive"))
    const id = store.addTask({ title: "Old task", quadrant: 4 })
    store.completeTask(id)
    expect(store.archiveCompleted(0)).toBe(1)
    expect(store.getTask(id)?.archivedAt).toBeTypeOf("number")
    expect(store.listTasks()).toHaveLength(0)
    expect(store.listTasks({ includeArchived: true })).toHaveLength(1)

    const fresh = store.addTask({ title: "Fresh", quadrant: 4 })
    store.completeTask(fresh)
    expect(store.archiveCompleted()).toBe(0)
    expect(store.getTask(fresh)?.archivedAt).toBeUndefined()
  })
})

describe("MapStore export/import", () => {
  it("round-trips content into a new map", async () => {
    const store = await openMap(uid("export"))
    store.renameMap("Client work")
    const categoryId = store.addCategory({ name: "Website", color: 2 })
    const taskId = store.addTask({ title: "Send proposal", quadrant: 2, dueDate: "2026-10-03", categoryId })
    store.setFocus("2026-10-01", [taskId])

    const imported = await MapStore.importJSON(store.exportJSON())
    openStores.push(imported)
    expect(imported.mapId).not.toBe(store.mapId)
    expect(imported.meta.name).toBe("Client work")

    const tasks = imported.listTasks()
    expect(tasks).toHaveLength(1)
    expect(tasks[0].title).toBe("Send proposal")
    expect(tasks[0].dueDate).toBe("2026-10-03")
    expect(tasks[0].categoryId).toBe(categoryId)
    expect(imported.listCategories()[0].name).toBe("Website")
    expect(imported.getPlan("2026-10-01").focus).toEqual([taskId])
  })
})

describe("persistence", () => {
  it("reloads a map with its tasks after reopen", async () => {
    const mapId = uid("persist-map")
    const store = await MapStore.open(mapId)
    const taskId = store.addTask({ title: "Persisted task", quadrant: 3 })
    await waitFor(() => store.saved)
    store.destroy()

    const reopened = await openMap(mapId)
    expect(reopened.getTask(taskId)?.title).toBe("Persisted task")
    expect(reopened.listTasks()).toHaveLength(1)
  })
})

describe("Workspace", () => {
  it("creates the default maps and tracks the active map", async () => {
    await deleteDatabase("quadrant-workspace")
    const workspace = await openWorkspace()
    const maps = workspace.listMaps()
    expect(maps.map((m) => m.name)).toEqual(["Work", "School", "Personal"])
    expect(workspace.activeMapId).toBe(maps[0].id)
    expect(workspace.theme).toBe("light")

    workspace.setTheme("dark")
    expect(workspace.theme).toBe("dark")
    workspace.setActiveMap(maps[1].id)
    expect(workspace.activeMapId).toBe(maps[1].id)

    const extra = await workspace.createMap("Side project", "star")
    expect(workspace.listMaps().some((m) => m.name === "Side project" && m.icon === "star")).toBe(true)
    const store = await workspace.openMap(extra)
    const taskId = store.addTask({ title: "Workspace task", quadrant: 1 })
    expect(store.getTask(taskId)?.title).toBe("Workspace task")
  })

  it("reloads maps and tasks across workspace reopen", async () => {
    const workspace = await openWorkspace()
    const mapId = await workspace.createMap("Reopen", "hash")
    const store = await workspace.openMap(mapId)
    const taskId = store.addTask({ title: "Reload me", quadrant: 2 })
    await waitFor(() => store.saved)

    workspace.destroy()
    const reopened = await openWorkspace()
    expect(reopened.listMaps().some((m) => m.id === mapId)).toBe(true)
    const reopenedStore = await reopened.openMap(mapId)
    expect(reopenedStore.getTask(taskId)?.title).toBe("Reload me")
  })
})

describe("type surface", () => {
  it("keeps the Task shape", () => {
    const task: Task = {
      id: "x",
      title: "x",
      quadrant: "inbox",
      order: "a0",
      createdAt: 0,
      updatedAt: 0,
    }
    expect(task.quadrant).toBe("inbox")
  })
})
