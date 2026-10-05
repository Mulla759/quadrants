import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  MapStore,
  Workspace,
  todayKey,
  type Category,
  type MapMeta,
  type Task,
} from "@quadrant/core"
import { Logo } from "../components/ui/Logo"
import { hasIndexedDB } from "./browser"

export interface MapSnapshot {
  tasks: Task[]
  categories: Category[]
  meta: MapMeta | undefined
  saved: boolean
}

export interface WorkspaceSnapshot {
  maps: MapMeta[]
  activeMapId: string | undefined
  theme: "light" | "dark"
}

interface WorkspaceContextValue extends WorkspaceSnapshot {
  workspace: Workspace | undefined
  store: MapStore | undefined
  map: MapSnapshot
  counts: Record<string, number>
  status: "loading" | "ready" | "error"
  error: Error | undefined
  setActiveMap: (id: string) => void
  createMap: (name: string, icon?: string) => Promise<string>
  renameMap: (id: string, name: string) => void
  deleteMap: (id: string) => void
  setTheme: (theme: "light" | "dark") => void
}

interface ExternalStore<T> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => T
  destroy: () => void
}

function createExternalStore<T>(compute: () => T, subscribeTo: (cb: () => void) => () => void): ExternalStore<T> {
  let snapshot = compute()
  const listeners = new Set<() => void>()
  const emit = () => {
    snapshot = compute()
    for (const listener of listeners) listener()
  }
  const unsubscribeSource = subscribeTo(emit)
  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => snapshot,
    destroy() {
      unsubscribeSource()
      listeners.clear()
    },
  }
}

const noopSubscribe = () => () => undefined

let workspacePromise: Promise<Workspace> | undefined

function openWorkspace(): Promise<Workspace> {
  if (!workspacePromise) workspacePromise = Workspace.open()
  return workspacePromise
}

const emptyMapSnapshot: MapSnapshot = { tasks: [], categories: [], meta: undefined, saved: true }
const emptyWorkspaceSnapshot: WorkspaceSnapshot = { maps: [], activeMapId: undefined, theme: "light" }

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined)

function StorageUnavailable() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-ink">
      <Logo className="h-8 w-8 rounded-[6px]" />
      <p className="text-[14px] font-medium">Quadrant needs browser storage.</p>
      <p className="max-w-[380px] text-[13px] text-muted">
        This browser has IndexedDB disabled or unavailable, often because you are in private mode or a restricted
        context. Open Quadrant in a normal window, or update to a current version of Chrome, Edge, Firefox, or Safari.
      </p>
    </div>
  )
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  if (!hasIndexedDB()) return <StorageUnavailable />
  return <WorkspaceProviderInner>{children}</WorkspaceProviderInner>
}

function WorkspaceProviderInner({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>()
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [error, setError] = useState<Error>()

  useEffect(() => {
    let live = true
    openWorkspace()
      .then((ws) => {
        if (!live) return
        setWorkspace(ws)
        setStatus("ready")
      })
      .catch((cause: unknown) => {
        if (!live) return
        setError(cause instanceof Error ? cause : new Error(String(cause)))
        setStatus("error")
      })
    return () => {
      live = false
    }
  }, [])

  const workspaceStore = useMemo(() => {
    if (!workspace) return undefined
    return createExternalStore<WorkspaceSnapshot>(
      () => ({ maps: workspace.listMaps(), activeMapId: workspace.activeMapId, theme: workspace.theme }),
      (cb) => workspace.subscribe(cb),
    )
  }, [workspace])

  useEffect(() => {
    return () => workspaceStore?.destroy()
  }, [workspaceStore])

  const workspaceSnapshot = useSyncExternalStore(
    workspaceStore?.subscribe ?? noopSubscribe,
    () => workspaceStore?.getSnapshot() ?? emptyWorkspaceSnapshot,
    () => workspaceStore?.getSnapshot() ?? emptyWorkspaceSnapshot,
  )

  const { maps, activeMapId, theme } = workspaceSnapshot

  const [store, setStore] = useState<MapStore>()
  const [initializedMaps] = useState(() => new Set<string>())

  useEffect(() => {
    if (!workspace || !activeMapId) {
      setStore(undefined)
      return
    }
    let live = true
    workspace
      .openMap(activeMapId)
      .then((opened) => {
        if (!live) return
        if (!initializedMaps.has(activeMapId)) {
          initializedMaps.add(activeMapId)
          opened.archiveCompleted()
          opened.carryOverTo(todayKey())
        }
        setStore(opened)
      })
      .catch(() => {
        if (live) setStore(undefined)
      })
    return () => {
      live = false
    }
  }, [workspace, activeMapId, initializedMaps])

  const mapStore = useMemo(() => {
    if (!store) return undefined
    return createExternalStore<MapSnapshot>(
      () => ({ tasks: store.listTasks(), categories: store.listCategories(), meta: store.meta, saved: store.saved }),
      (cb) => store.subscribe(cb),
    )
  }, [store])

  useEffect(() => {
    return () => mapStore?.destroy()
  }, [mapStore])

  const map = useSyncExternalStore(
    mapStore?.subscribe ?? noopSubscribe,
    () => mapStore?.getSnapshot() ?? emptyMapSnapshot,
    () => mapStore?.getSnapshot() ?? emptyMapSnapshot,
  )

  const mapIds = useMemo(() => maps.map((m) => m.id), [maps])
  const countsKey = mapIds.join("|")
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!workspace || mapIds.length === 0) {
      setCounts({})
      return
    }
    let live = true
    const opened = new Map<string, MapStore>()
    const unsubscribers: Array<() => void> = []
    const recompute = () => {
      const next: Record<string, number> = {}
      for (const [id, candidate] of opened) {
        next[id] = candidate.listTasks({ includeCompleted: true, includeArchived: false }).length
      }
      setCounts(next)
    }
    Promise.all(mapIds.map((id) => workspace.openMap(id).then((candidate) => [id, candidate] as const)))
      .then((entries) => {
        if (!live) return
        for (const [id, candidate] of entries) {
          opened.set(id, candidate)
          unsubscribers.push(candidate.subscribe(recompute))
        }
        recompute()
      })
      .catch(() => undefined)
    return () => {
      live = false
      for (const unsubscribe of unsubscribers) unsubscribe()
    }
  }, [workspace, countsKey, mapIds])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", theme === "dark")
    root.style.colorScheme = theme
  }, [theme])

  const setActiveMap = useCallback(
    (id: string) => {
      workspace?.setActiveMap(id)
    },
    [workspace],
  )

  const createMap = useCallback(
    async (name: string, icon?: string) => {
      if (!workspace) throw new Error("Workspace is not ready")
      const id = await workspace.createMap(name, icon)
      workspace.setActiveMap(id)
      return id
    },
    [workspace],
  )

  const renameMap = useCallback(
    (id: string, name: string) => {
      workspace?.renameMap(id, name)
    },
    [workspace],
  )

  const deleteMap = useCallback(
    (id: string) => {
      workspace?.deleteMap(id)
    },
    [workspace],
  )

  const setTheme = useCallback(
    (next: "light" | "dark") => {
      workspace?.setTheme(next)
    },
    [workspace],
  )

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      workspace,
      store,
      map,
      counts,
      maps,
      activeMapId,
      theme,
      status,
      error,
      setActiveMap,
      createMap,
      renameMap,
      deleteMap,
      setTheme,
    }),
    [
      workspace,
      store,
      map,
      counts,
      maps,
      activeMapId,
      theme,
      status,
      error,
      setActiveMap,
      createMap,
      renameMap,
      deleteMap,
      setTheme,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return context
}
