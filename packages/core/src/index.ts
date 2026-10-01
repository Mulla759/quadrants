import { generateKeyBetween } from "fractional-indexing"
import { customAlphabet } from "nanoid"

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

const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12)

interface MapData {
  meta: MapMeta
  tasks: Map<string, Task>
  categories: Map<string, Category>
  plans: Map<string, DailyPlan>
}

const storageKey = (mapId: string) => `quadrant:map:${mapId}`

function loadMapData(mapId: string): MapData {
  if (typeof localStorage !== "undefined") {
    const raw = localStorage.getItem(storageKey(mapId))
    if (raw) {
      const parsed = JSON.parse(raw) as MapExport
      return {
        meta: parsed.map,
        tasks: new Map(parsed.tasks.map((t) => [t.id, t])),
        categories: new Map(parsed.categories.map((c) => [c.id, c])),
        plans: new Map(parsed.plans.map((p) => [p.date, p])),
      }
    }
  }
  return {
    meta: { id: mapId, name: "Untitled map", icon: "hash", createdAt: Date.now(), schemaVersion: SCHEMA_VERSION },
    tasks: new Map(),
    categories: new Map(),
    plans: new Map(),
  }
}

function serialize(data: MapData): MapExport {
  return {
    version: SCHEMA_VERSION,
    map: data.meta,
    tasks: [...data.tasks.values()],
    categories: sortByOrder([...data.categories.values()]),
    plans: [...data.plans.values()],
  }
}

export class MapStore {
  static async open(mapId: string): Promise<MapStore> {
    return new MapStore(mapId)
  }

  static async importJSON(json: string): Promise<MapStore> {
    const parsed = JSON.parse(json) as MapExport
    const mapId = nano()
    const store = new MapStore(mapId)
    const now = Date.now()
    store.data.meta = { ...parsed.map, id: mapId, createdAt: now }
    for (const task of parsed.tasks) store.data.tasks.set(task.id, { ...task })
    for (const category of parsed.categories) store.data.categories.set(category.id, { ...category })
    for (const plan of parsed.plans) store.data.plans.set(plan.date, { date: plan.date, focus: cap(plan.focus, FOCUS_LIMIT), sideQuests: cap(plan.sideQuests, FOCUS_LIMIT) })
    store.persist()
    return store
  }

  readonly mapId: string
  private data: MapData
  private listeners = new Set<() => void>()

  private constructor(mapId: string) {
    this.mapId = mapId
    this.data = loadMapData(mapId)
  }

  get meta(): MapMeta {
    return this.data.meta
  }

  get saved(): boolean {
    return true
  }

  renameMap(name: string): void {
    this.data.meta = { ...this.data.meta, name }
    this.commit()
  }

  setIcon(icon: string): void {
    this.data.meta = { ...this.data.meta, icon }
    this.commit()
  }

  listTasks(filter?: { quadrant?: TaskLocation; includeCompleted?: boolean; includeArchived?: boolean }): Task[] {
    const includeCompleted = filter?.includeCompleted ?? true
    const includeArchived = filter?.includeArchived ?? false
    return sortByOrder(
      [...this.data.tasks.values()].filter((t) => {
        if (filter?.quadrant && t.quadrant !== filter.quadrant) return false
        if (!includeArchived && t.archivedAt) return false
        if (!includeCompleted && t.completedAt) return false
        return true
      }),
    )
  }

  getTask(id: string): Task | undefined {
    return this.data.tasks.get(id)
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
    this.data.tasks.set(id, {
      id,
      title: input.title.trim(),
      quadrant,
      order,
      categoryId: input.categoryId,
      dueDate: input.dueDate,
      notes: input.notes,
      createdAt: now,
      updatedAt: now,
    })
    this.commit()
    return id
  }

  updateTask(id: string, patch: Partial<Pick<Task, "title" | "quadrant" | "categoryId" | "dueDate" | "notes">>): void {
    const task = this.data.tasks.get(id)
    if (!task) return
    this.data.tasks.set(id, { ...task, ...patch, updatedAt: Date.now() })
    this.commit()
  }

  moveTask(id: string, quadrant: TaskLocation, order: string): void {
    const task = this.data.tasks.get(id)
    if (!task) return
    this.data.tasks.set(id, { ...task, quadrant, order, updatedAt: Date.now() })
    this.commit()
  }

  completeTask(id: string): void {
    const task = this.data.tasks.get(id)
    if (!task) return
    this.data.tasks.set(id, { ...task, completedAt: Date.now(), updatedAt: Date.now() })
    this.commit()
  }

  restoreTask(id: string): void {
    const task = this.data.tasks.get(id)
    if (!task) return
    const { completedAt: _completedAt, ...rest } = task
    this.data.tasks.set(id, { ...rest, updatedAt: Date.now() })
    this.commit()
  }

  deleteTask(id: string): void {
    this.data.tasks.delete(id)
    for (const [date, plan] of this.data.plans) {
      this.data.plans.set(date, {
        date,
        focus: plan.focus.filter((t) => t !== id),
        sideQuests: plan.sideQuests.filter((t) => t !== id),
      })
    }
    this.commit()
  }

  listCategories(): Category[] {
    return sortByOrder([...this.data.categories.values()])
  }

  addCategory(input: { name: string; color: CategoryColorIndex }): string {
    const id = nano()
    const last = this.listCategories().at(-1)
    this.data.categories.set(id, { id, name: input.name.trim(), color: input.color, order: orderAfter(last?.order) })
    this.commit()
    return id
  }

  updateCategory(id: string, patch: Partial<Pick<Category, "name" | "color">>): void {
    const category = this.data.categories.get(id)
    if (!category) return
    this.data.categories.set(id, { ...category, ...patch })
    this.commit()
  }

  deleteCategory(id: string): void {
    this.data.categories.delete(id)
    for (const [taskId, task] of this.data.tasks) {
      if (task.categoryId === id) this.data.tasks.set(taskId, { ...task, categoryId: undefined, updatedAt: Date.now() })
    }
    this.commit()
  }

  getPlan(date: string): DailyPlan {
    const plan = this.data.plans.get(date)
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
    const undone = (ids: string[]) => ids.filter((id) => !this.data.tasks.get(id)?.completedAt)
    this.writePlan(toDate, {
      focus: cap([...to.focus, ...undone(from.focus)], FOCUS_LIMIT),
      sideQuests: cap([...to.sideQuests, ...undone(from.sideQuests)], FOCUS_LIMIT),
    })
  }

  carryOverTo(toDate: string): void {
    const previous = [...this.data.plans.keys()].filter((d) => d < toDate).sort().at(-1)
    if (previous) this.carryOver(previous, toDate)
  }

  previousDate(date: string): string {
    return shiftDate(date, -1)
  }

  archiveCompleted(olderThanMs: number = ARCHIVE_AFTER_MS): number {
    const cutoff = Date.now() - olderThanMs
    let count = 0
    for (const [id, task] of this.data.tasks) {
      if (task.completedAt && !task.archivedAt && task.completedAt <= cutoff) {
        this.data.tasks.set(id, { ...task, archivedAt: Date.now() })
        count++
      }
    }
    if (count) this.commit()
    return count
  }

  exportJSON(): string {
    return JSON.stringify(serialize(this.data))
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  destroy(): void {
    this.listeners.clear()
  }

  private lastOrder(quadrant: TaskLocation): string | undefined {
    return this.listTasks({ quadrant, includeCompleted: true, includeArchived: true }).at(-1)?.order
  }

  private writePlan(date: string, patch: Partial<Omit<DailyPlan, "date">>): void {
    const current = this.getPlan(date)
    this.data.plans.set(date, { ...current, ...patch })
    this.commit()
  }

  private commit(): void {
    this.persist()
    for (const listener of this.listeners) listener()
  }

  private persist(): void {
    if (typeof localStorage === "undefined") return
    try {
      localStorage.setItem(storageKey(this.mapId), this.exportJSON())
    } catch {
      /* storage full or unavailable */
    }
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
  { id: 1, number: "01", name: "Most important", description: "Urgent and important — do first" },
  { id: 2, number: "02", name: "Semi-important", description: "Urgent, less important — batch or delegate" },
  { id: 3, number: "03", name: "Good to do", description: "Important, not urgent — schedule it" },
  { id: 4, number: "04", name: "Least important", description: "Neither — drop it or do it later" },
]

export const FOCUS_LIMIT = 3
export const SCHEMA_VERSION = 1
export const ARCHIVE_AFTER_MS = 7 * DAY

interface WorkspaceData {
  deviceId: string
  mapIds: string[]
  activeMapId?: string
  theme: "light" | "dark"
}

const WORKSPACE_KEY = "quadrant:workspace"

export class Workspace {
  static async open(): Promise<Workspace> {
    const workspace = new Workspace()
    if (workspace.data.mapIds.length === 0) {
      for (const name of ["Work", "School", "Personal"]) {
        await workspace.createMap(name, "hash")
      }
      workspace.setActiveMap(workspace.data.mapIds[0])
    }
    return workspace
  }

  private data: WorkspaceData
  private listeners = new Set<() => void>()
  private stores = new Map<string, MapStore>()

  private constructor() {
    let parsed: WorkspaceData | undefined
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(WORKSPACE_KEY)
      if (raw) parsed = JSON.parse(raw) as WorkspaceData
    }
    this.data = parsed ?? { deviceId: nano(), mapIds: [], activeMapId: undefined, theme: "light" }
    if (!parsed) this.persist()
  }

  listMaps(): MapMeta[] {
    return this.data.mapIds.map((id) => {
      const open = this.stores.get(id)
      if (open) return open.meta
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(storageKey(id))
        if (raw) return (JSON.parse(raw) as MapExport).map
      }
      return { id, name: "Untitled map", createdAt: Date.now(), schemaVersion: SCHEMA_VERSION }
    })
  }

  async createMap(name: string, icon?: string): Promise<string> {
    const id = nano()
    const store = await MapStore.open(id)
    store.renameMap(name)
    if (icon) store.setIcon(icon)
    this.stores.set(id, store)
    this.data.mapIds = [...this.data.mapIds, id]
    if (!this.data.activeMapId) this.data.activeMapId = id
    this.commit()
    return id
  }

  renameMap(id: string, name: string): void {
    const store = this.stores.get(id)
    if (store) store.renameMap(name)
    else this.data.mapIds = [...this.data.mapIds]
    this.commit()
  }

  deleteMap(id: string): void {
    this.stores.get(id)?.destroy()
    this.stores.delete(id)
    this.data.mapIds = this.data.mapIds.filter((m) => m !== id)
    if (this.data.activeMapId === id) this.data.activeMapId = this.data.mapIds[0]
    if (typeof localStorage !== "undefined") localStorage.removeItem(storageKey(id))
    this.commit()
  }

  async openMap(id: string): Promise<MapStore> {
    const existing = this.stores.get(id)
    if (existing) return existing
    const store = await MapStore.open(id)
    this.stores.set(id, store)
    return store
  }

  get activeMapId(): string | undefined {
    return this.data.activeMapId
  }

  setActiveMap(id: string): void {
    this.data.activeMapId = id
    this.commit()
  }

  get theme(): "light" | "dark" {
    return this.data.theme
  }

  setTheme(theme: "light" | "dark"): void {
    this.data.theme = theme
    this.commit()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  destroy(): void {
    this.listeners.clear()
    for (const store of this.stores.values()) store.destroy()
    this.stores.clear()
  }

  private commit(): void {
    this.persist()
    for (const listener of this.listeners) listener()
  }

  private persist(): void {
    if (typeof localStorage === "undefined") return
    localStorage.setItem(WORKSPACE_KEY, JSON.stringify(this.data))
  }
}

export function countTasks(store: MapStore): number {
  return store.listTasks({ includeCompleted: true, includeArchived: false }).length
}
