import { generateKeyBetween } from "fractional-indexing"
import { customAlphabet } from "nanoid"
import * as Y from "yjs"
import { IndexeddbPersistence, clearDocument } from "y-indexeddb"

export type QuadrantId = 1 | 2 | 3 | 4
export type TaskLocation = QuadrantId | "inbox"
export type CategoryColorIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface Task {
  id: string
  title: string
  quadrant: TaskLocation
  order: string
  categoryId?: string
  dueDate?: string
  notes?: string
  completedAt?: number
  archivedAt?: number
  createdAt: number
  updatedAt: number
}

export interface Category {
  id: string
  name: string
  color: CategoryColorIndex
  order: string
}

export interface DailyPlan {
  date: string
  focus: string[]
  sideQuests: string[]
}

export interface MapMeta {
  id: string
  name: string
  icon?: string
  createdAt: number
  schemaVersion: number
}

export interface MapExport {
  version: number
  map: MapMeta
  tasks: Task[]
  categories: Category[]
  plans: DailyPlan[]
}

export function orderBetween(prev?: string, next?: string): string {
  return generateKeyBetween(prev ?? null, next ?? null)
}

export function orderAfter(last?: string): string {
  return generateKeyBetween(last ?? null, null)
}

export function orderBefore(first?: string): string {
  return generateKeyBetween(null, first ?? null)
}

export function sortByOrder<T extends { order: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.order < b.order ? -1 : a.order > b.order ? 1 : 0))
}

export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

const DAY = 24 * 60 * 60 * 1000

export function formatDueDate(due?: string, now: Date = new Date()): string {
  if (!due) return ""
  const target = new Date(`${due}T00:00:00`)
  if (Number.isNaN(target.getTime())) return due
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diff = Math.round((startOfDay(target) - startOfDay(now)) / DAY)
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff === -1) return "Yesterday"
  const sameYear = target.getFullYear() === now.getFullYear()
  const month = target.toLocaleString("en-US", { month: "short" })
  if (diff > 1 && diff < 7) return target.toLocaleString("en-US", { weekday: "short" })
  return sameYear ? `${month} ${target.getDate()}` : `${month} ${target.getDate()}, ${target.getFullYear()}`
}

function shiftDate(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00`)
  d.setDate(d.getDate() + days)
  return todayKey(d)
}

function cap(ids: string[], limit: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const id of ids) {
    if (seen.has(id)) continue
    seen.add(id)
    out.push(id)
    if (out.length === limit) break
  }
  return out
}

function withoutUndefined<T extends object>(value: T): T {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(value)) {
    const v = (value as Record<string, unknown>)[key]
    if (v !== undefined) out[key] = v
  }
  return out as T
}

const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12)

const MAP_DOC_PREFIX = "quadrant-map-"
const WORKSPACE_DOC = "quadrant-workspace"
const mapDocName = (mapId: string) => `${MAP_DOC_PREFIX}${mapId}`

const mapStoreCache = new Map<string, Promise<MapStore>>()

export class MapStore {
  static open(mapId: string): Promise<MapStore> {
    const existing = mapStoreCache.get(mapId)
    if (existing) return existing
    const created = MapStore.create(mapId)
    mapStoreCache.set(mapId, created)
    created.catch(() => {
      if (mapStoreCache.get(mapId) === created) mapStoreCache.delete(mapId)
    })
    return created
  }

  static async importJSON(json: string): Promise<MapStore> {
    const parsed = JSON.parse(json) as MapExport
    const mapId = nano()
    const store = await MapStore.open(mapId)
    store.doc.transact(() => {
      store.metaMap.set("id", mapId)
      store.metaMap.set("name", parsed.map.name || "Untitled map")
      if (parsed.map.icon) store.metaMap.set("icon", parsed.map.icon)
      store.metaMap.set("createdAt", Date.now())
      store.metaMap.set("schemaVersion", SCHEMA_VERSION)
      for (const task of parsed.tasks) store.tasksMap.set(task.id, withoutUndefined({ ...task }))
      for (const category of parsed.categories) store.categoriesMap.set(category.id, withoutUndefined({ ...category }))
      for (const plan of parsed.plans) {
        store.plansMap.set(plan.date, {
          date: plan.date,
          focus: cap(plan.focus, FOCUS_LIMIT),
          sideQuests: cap(plan.sideQuests, FOCUS_LIMIT),
        })
      }
    })
    await store.whenSaved()
    return store
  }

  private static async create(mapId: string): Promise<MapStore> {
    const store = new MapStore(mapId)
    await store.persistence.whenSynced
    if (!store.metaMap.has("createdAt")) {
      store.doc.transact(() => {
        store.metaMap.set("id", mapId)
        store.metaMap.set("name", "Untitled map")
        store.metaMap.set("createdAt", Date.now())
        store.metaMap.set("schemaVersion", SCHEMA_VERSION)
      })
    }
    await store.whenSaved()
    return store
  }

  readonly mapId: string
  private readonly doc: Y.Doc
  private readonly persistence: IndexeddbPersistence
  private readonly tasksMap: Y.Map<Task>
  private readonly categoriesMap: Y.Map<Category>
  private readonly plansMap: Y.Map<DailyPlan>
  private readonly metaMap: Y.Map<string | number>
  private readonly listeners = new Set<() => void>()
  private pendingWrites = 0
  private destroyed = false

  private constructor(mapId: string) {
    this.mapId = mapId
    this.doc = new Y.Doc()
    this.tasksMap = this.doc.getMap<Task>("tasks")
    this.categoriesMap = this.doc.getMap<Category>("categories")
    this.plansMap = this.doc.getMap<DailyPlan>("plans")
    this.metaMap = this.doc.getMap<string | number>("meta")
    this.persistence = new IndexeddbPersistence(mapDocName(mapId), this.doc)
    this.doc.on("update", this.onDocUpdate)
  }

  private readonly onDocUpdate = (_update: Uint8Array, origin: unknown): void => {
    if (origin !== this.persistence) this.trackWrite()
    this.notify()
  }

  get meta(): MapMeta {
    return {
      id: this.mapId,
      name: (this.metaMap.get("name") as string) ?? "Untitled map",
      icon: this.metaMap.get("icon") as string | undefined,
      createdAt: (this.metaMap.get("createdAt") as number) ?? 0,
      schemaVersion: (this.metaMap.get("schemaVersion") as number) ?? SCHEMA_VERSION,
    }
  }

  get saved(): boolean {
    return this.persistence.synced && this.pendingWrites === 0
  }

  renameMap(name: string): void {
    this.metaMap.set("name", name)
  }

  setIcon(icon: string): void {
    this.metaMap.set("icon", icon)
  }

  listTasks(filter?: { quadrant?: TaskLocation; includeCompleted?: boolean; includeArchived?: boolean }): Task[] {
    const includeCompleted = filter?.includeCompleted ?? true
    const includeArchived = filter?.includeArchived ?? false
    return sortByOrder(
      [...this.tasksMap.values()].filter((t) => {
        if (filter?.quadrant && t.quadrant !== filter.quadrant) return false
        if (!includeArchived && t.archivedAt) return false
        if (!includeCompleted && t.completedAt) return false
        return true
      }),
    )
  }

  getTask(id: string): Task | undefined {
    return this.tasksMap.get(id)
  }

  addTask(input: {
    title: string
    quadrant?: TaskLocation
    categoryId?: string
    dueDate?: string
    notes?: string
    order?: string
  }): string {
    const id = nano()
    const now = Date.now()
    const quadrant = input.quadrant ?? "inbox"
    const order = input.order ?? orderAfter(this.lastOrder(quadrant))
    this.tasksMap.set(
      id,
      withoutUndefined({
        id,
        title: input.title.trim(),
        quadrant,
        order,
        categoryId: input.categoryId,
        dueDate: input.dueDate,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      }),
    )
    return id
  }

  updateTask(id: string, patch: Partial<Pick<Task, "title" | "quadrant" | "categoryId" | "dueDate" | "notes">>): void {
    const task = this.tasksMap.get(id)
    if (!task) return
    this.tasksMap.set(id, withoutUndefined({ ...task, ...patch, updatedAt: Date.now() }))
  }

  moveTask(id: string, quadrant: TaskLocation, order: string): void {
    const task = this.tasksMap.get(id)
    if (!task) return
    this.tasksMap.set(id, withoutUndefined({ ...task, quadrant, order, updatedAt: Date.now() }))
  }

  completeTask(id: string): void {
    const task = this.tasksMap.get(id)
    if (!task) return
    this.tasksMap.set(id, withoutUndefined({ ...task, completedAt: Date.now(), updatedAt: Date.now() }))
  }

  restoreTask(id: string): void {
    const task = this.tasksMap.get(id)
    if (!task) return
    const { completedAt: _completedAt, ...rest } = task
    this.tasksMap.set(id, withoutUndefined({ ...rest, updatedAt: Date.now() }))
  }

  deleteTask(id: string): void {
    this.doc.transact(() => {
      this.tasksMap.delete(id)
      for (const [date, plan] of this.plansMap) {
        const focus = plan.focus.filter((t) => t !== id)
        const sideQuests = plan.sideQuests.filter((t) => t !== id)
        if (focus.length !== plan.focus.length || sideQuests.length !== plan.sideQuests.length) {
          this.plansMap.set(date, { date, focus, sideQuests })
        }
      }
    })
  }

  listCategories(): Category[] {
    return sortByOrder([...this.categoriesMap.values()])
  }

  addCategory(input: { name: string; color: CategoryColorIndex }): string {
    const id = nano()
    const last = this.listCategories().at(-1)
    this.categoriesMap.set(id, { id, name: input.name.trim(), color: input.color, order: orderAfter(last?.order) })
    return id
  }

  updateCategory(id: string, patch: Partial<Pick<Category, "name" | "color">>): void {
    const category = this.categoriesMap.get(id)
    if (!category) return
    this.categoriesMap.set(id, withoutUndefined({ ...category, ...patch }))
  }

  deleteCategory(id: string): void {
    this.doc.transact(() => {
      this.categoriesMap.delete(id)
      for (const [taskId, task] of this.tasksMap) {
        if (task.categoryId === id) {
          const { categoryId: _categoryId, ...rest } = task
          this.tasksMap.set(taskId, withoutUndefined({ ...rest, updatedAt: Date.now() }))
        }
      }
    })
  }

  getPlan(date: string): DailyPlan {
    const plan = this.plansMap.get(date)
    return plan ? { date, focus: [...plan.focus], sideQuests: [...plan.sideQuests] } : { date, focus: [], sideQuests: [] }
  }

  setFocus(date: string, taskIds: string[]): void {
    this.writePlan(date, { focus: cap(taskIds, FOCUS_LIMIT) })
  }

  setSideQuests(date: string, taskIds: string[]): void {
    this.writePlan(date, { sideQuests: cap(taskIds, FOCUS_LIMIT) })
  }

  addFocus(date: string, taskId: string): void {
    this.setFocus(date, [...this.getPlan(date).focus, taskId])
  }

  removeFocus(date: string, taskId: string): void {
    this.setFocus(date, this.getPlan(date).focus.filter((t) => t !== taskId))
  }

  addSideQuest(date: string, taskId: string): void {
    this.setSideQuests(date, [...this.getPlan(date).sideQuests, taskId])
  }

  removeSideQuest(date: string, taskId: string): void {
    this.setSideQuests(date, this.getPlan(date).sideQuests.filter((t) => t !== taskId))
  }

  carryOver(fromDate: string, toDate: string): void {
    const from = this.getPlan(fromDate)
    const to = this.getPlan(toDate)
    const undone = (ids: string[]) => ids.filter((id) => !this.getTask(id)?.completedAt)
    this.writePlan(toDate, {
      focus: cap([...to.focus, ...undone(from.focus)], FOCUS_LIMIT),
      sideQuests: cap([...to.sideQuests, ...undone(from.sideQuests)], FOCUS_LIMIT),
    })
  }

  carryOverTo(toDate: string): void {
    const previous = [...this.plansMap.keys()].filter((d) => d < toDate).sort().at(-1)
    if (previous) this.carryOver(previous, toDate)
  }

  previousDate(date: string): string {
    return shiftDate(date, -1)
  }

  archiveCompleted(olderThanMs: number = ARCHIVE_AFTER_MS): number {
    const cutoff = Date.now() - olderThanMs
    let count = 0
    this.doc.transact(() => {
      for (const [id, task] of this.tasksMap) {
        if (task.completedAt && !task.archivedAt && task.completedAt <= cutoff) {
          this.tasksMap.set(id, { ...task, archivedAt: Date.now() })
          count++
        }
      }
    })
    return count
  }

  exportJSON(): string {
    const data: MapExport = {
      version: SCHEMA_VERSION,
      map: this.meta,
      tasks: [...this.tasksMap.values()],
      categories: this.listCategories(),
      plans: [...this.plansMap.values()],
    }
    return JSON.stringify(data)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.listeners.clear()
    this.doc.off("update", this.onDocUpdate)
    mapStoreCache.delete(this.mapId)
    void this.persistence.destroy()
    this.doc.destroy()
  }

  private lastOrder(quadrant: TaskLocation): string | undefined {
    return this.listTasks({ quadrant, includeCompleted: true, includeArchived: true }).at(-1)?.order
  }

  private writePlan(date: string, patch: Partial<Omit<DailyPlan, "date">>): void {
    const current = this.getPlan(date)
    this.plansMap.set(date, { ...current, ...patch })
  }

  private trackWrite(): void {
    const db = this.persistence.db
    if (!db || this.persistence._destroyed || this.destroyed) return
    this.pendingWrites++
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      this.pendingWrites = Math.max(0, this.pendingWrites - 1)
      this.notify()
    }
    try {
      const tx = db.transaction("updates", "readonly")
      tx.objectStore("updates").count()
      tx.oncomplete = done
      tx.onerror = done
      tx.onabort = done
    } catch {
      done()
    }
  }

  private notify(): void {
    for (const listener of [...this.listeners]) listener()
  }

  private whenSaved(): Promise<void> {
    if (this.saved) return Promise.resolve()
    return new Promise((resolve) => {
      const unsubscribe = this.subscribe(() => {
        if (this.saved) {
          unsubscribe()
          resolve()
        }
      })
    })
  }
}

export const CATEGORY_COLORS = [
  "#4E8A7E",
  "#5B7CBA",
  "#9A5C8F",
  "#B98A2F",
  "#C05F45",
  "#6E9163",
  "#BC5B6B",
  "#64748B",
] as const

export const QUADRANTS: readonly { id: QuadrantId; number: string; name: string; description: string }[] = [
  { id: 1, number: "01", name: "Most important", description: "Urgent and important. Do first" },
  { id: 2, number: "02", name: "Semi-important", description: "Urgent, less important. Batch or delegate" },
  { id: 3, number: "03", name: "Good to do", description: "Important, not urgent. Schedule it" },
  { id: 4, number: "04", name: "Least important", description: "Neither. Drop it or do it later" },
]

export const FOCUS_LIMIT = 3
export const SCHEMA_VERSION = 1
export const ARCHIVE_AFTER_MS = 7 * DAY

export class Workspace {
  static async open(): Promise<Workspace> {
    const workspace = new Workspace()
    await workspace.persistence.whenSynced
    workspace.ensureDevice()
    if (workspace.mapIds.length === 0) {
      for (const name of ["Work", "School", "Personal"]) {
        await workspace.createMap(name, "hash")
      }
    }
    const active = workspace.activeMapId
    if (!active || !workspace.mapIds.includes(active)) {
      const first = workspace.mapIds[0]
      if (first) workspace.setActiveMap(first)
    }
    for (const id of workspace.mapIds) await workspace.openMap(id)
    return workspace
  }

  private readonly doc: Y.Doc
  private readonly persistence: IndexeddbPersistence
  private readonly metaMap: Y.Map<string>
  private readonly mapIdsArr: Y.Array<string>
  private readonly listeners = new Set<() => void>()
  private readonly stores = new Map<string, MapStore>()
  private destroyed = false

  private constructor() {
    this.doc = new Y.Doc()
    this.metaMap = this.doc.getMap<string>("meta")
    this.mapIdsArr = this.doc.getArray<string>("mapIds")
    this.persistence = new IndexeddbPersistence(WORKSPACE_DOC, this.doc)
    this.doc.on("update", this.onDocUpdate)
  }

  private readonly onDocUpdate = (): void => {
    this.notify()
  }

  private get mapIds(): string[] {
    return this.mapIdsArr.toArray()
  }

  listMaps(): MapMeta[] {
    return this.mapIds.map((id) => {
      const store = this.stores.get(id)
      if (store) return store.meta
      return { id, name: "Untitled map", createdAt: 0, schemaVersion: SCHEMA_VERSION }
    })
  }

  async createMap(name: string, icon?: string): Promise<string> {
    const id = nano()
    const store = await MapStore.open(id)
    store.renameMap(name)
    if (icon) store.setIcon(icon)
    this.stores.set(id, store)
    this.mapIdsArr.push([id])
    if (!this.activeMapId) this.metaMap.set("activeMapId", id)
    this.notify()
    return id
  }

  renameMap(id: string, name: string): void {
    const store = this.stores.get(id)
    if (store) store.renameMap(name)
    else void MapStore.open(id).then((s) => s.renameMap(name))
    this.notify()
  }

  deleteMap(id: string): void {
    this.stores.get(id)?.destroy()
    this.stores.delete(id)
    for (let i = this.mapIdsArr.length - 1; i >= 0; i--) {
      if (this.mapIdsArr.get(i) === id) this.mapIdsArr.delete(i, 1)
    }
    if (this.activeMapId === id) {
      const next = this.mapIds[0]
      if (next) this.metaMap.set("activeMapId", next)
      else this.metaMap.delete("activeMapId")
    }
    void clearDocument(mapDocName(id))
    this.notify()
  }

  async openMap(id: string): Promise<MapStore> {
    const existing = this.stores.get(id)
    if (existing) return existing
    const store = await MapStore.open(id)
    this.stores.set(id, store)
    return store
  }

  get activeMapId(): string | undefined {
    return this.metaMap.get("activeMapId")
  }

  setActiveMap(id: string): void {
    this.metaMap.set("activeMapId", id)
  }

  get theme(): "light" | "dark" {
    return this.metaMap.get("theme") === "dark" ? "dark" : "light"
  }

  setTheme(theme: "light" | "dark"): void {
    this.metaMap.set("theme", theme)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  destroy(): void {
    if (this.destroyed) return
    this.destroyed = true
    this.listeners.clear()
    this.doc.off("update", this.onDocUpdate)
    for (const store of this.stores.values()) store.destroy()
    this.stores.clear()
    void this.persistence.destroy()
    this.doc.destroy()
  }

  private ensureDevice(): void {
    if (!this.metaMap.has("deviceId")) this.metaMap.set("deviceId", nano())
  }

  private notify(): void {
    for (const listener of [...this.listeners]) listener()
  }
}

export function countTasks(store: MapStore): number {
  return store.listTasks({ includeCompleted: true, includeArchived: false }).length
}
