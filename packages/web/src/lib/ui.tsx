import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"
import type { QuadrantId } from "@quadrant/core"

export type ViewKey = "map" | "inbox" | "today" | "archive"

export interface Toast {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface UIContextValue {
  view: ViewKey
  setView: (view: ViewKey) => void
  selectedTaskId: string | null
  selectTask: (id: string | null) => void
  focusedQuadrant: QuadrantId
  setFocusedQuadrant: (id: QuadrantId) => void
  mobileQuadrant: QuadrantId
  setMobileQuadrant: (id: QuadrantId) => void
  creatingQuadrant: QuadrantId | null
  startCreate: (id: QuadrantId) => void
  cancelCreate: () => void
  editingTaskId: string | null
  startEdit: (id: string) => void
  stopEdit: () => void
  detailTaskId: string | null
  openDetail: (id: string) => void
  closeDetail: () => void
  paletteOpen: boolean
  setPaletteOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  categoriesOpen: boolean
  setCategoriesOpen: (open: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toasts: Toast[]
  pushToast: (toast: Omit<Toast, "id">) => void
  dismissToast: (id: string) => void
}

const UIContext = createContext<UIContextValue | undefined>(undefined)

let toastCounter = 0

export function UIProvider({ children }: { children: ReactNode }) {
  const [view, setViewState] = useState<ViewKey>("map")
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [focusedQuadrant, setFocusedQuadrant] = useState<QuadrantId>(1)
  const [mobileQuadrant, setMobileQuadrant] = useState<QuadrantId>(1)
  const [creatingQuadrant, setCreatingQuadrant] = useState<QuadrantId | null>(null)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const pushToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${++toastCounter}`
      setToasts((current) => [...current, { ...toast, id }])
      const timer = setTimeout(() => dismissToast(id), 5000)
      timers.current.set(id, timer)
    },
    [dismissToast],
  )

  const setView = useCallback((next: ViewKey) => {
    setViewState(next)
    setSelectedTaskId(null)
    setCreatingQuadrant(null)
    setEditingTaskId(null)
  }, [])

  const selectTask = useCallback((id: string | null) => setSelectedTaskId(id), [])

  const startCreate = useCallback((id: QuadrantId) => {
    setFocusedQuadrant(id)
    setEditingTaskId(null)
    setCreatingQuadrant(id)
  }, [])

  const cancelCreate = useCallback(() => setCreatingQuadrant(null), [])

  const startEdit = useCallback((id: string) => {
    setCreatingQuadrant(null)
    setEditingTaskId(id)
  }, [])

  const stopEdit = useCallback(() => setEditingTaskId(null), [])

  const openDetail = useCallback((id: string) => {
    setDetailTaskId(id)
    setSelectedTaskId(id)
  }, [])

  const closeDetail = useCallback(() => setDetailTaskId(null), [])

  const value = useMemo<UIContextValue>(
    () => ({
      view,
      setView,
      selectedTaskId,
      selectTask,
      focusedQuadrant,
      setFocusedQuadrant,
      mobileQuadrant,
      setMobileQuadrant,
      creatingQuadrant,
      startCreate,
      cancelCreate,
      editingTaskId,
      startEdit,
      stopEdit,
      detailTaskId,
      openDetail,
      closeDetail,
      paletteOpen,
      setPaletteOpen,
      searchOpen,
      setSearchOpen,
      categoriesOpen,
      setCategoriesOpen,
      sidebarOpen,
      setSidebarOpen,
      toasts,
      pushToast,
      dismissToast,
    }),
    [
      view,
      setView,
      selectedTaskId,
      selectTask,
      focusedQuadrant,
      mobileQuadrant,
      creatingQuadrant,
      startCreate,
      cancelCreate,
      editingTaskId,
      startEdit,
      stopEdit,
      detailTaskId,
      openDetail,
      closeDetail,
      paletteOpen,
      searchOpen,
      categoriesOpen,
      sidebarOpen,
      toasts,
      pushToast,
      dismissToast,
    ],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(): UIContextValue {
  const context = useContext(UIContext)
  if (!context) throw new Error("useUI must be used within UIProvider")
  return context
}
