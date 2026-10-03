import { useSyncExternalStore } from "react"

const NAVIGATE_EVENT = "quadrant:navigate"

function subscribe(callback: () => void): () => void {
  window.addEventListener("popstate", callback)
  window.addEventListener(NAVIGATE_EVENT, callback)
  return () => {
    window.removeEventListener("popstate", callback)
    window.removeEventListener(NAVIGATE_EVENT, callback)
  }
}

function getSnapshot(): string {
  return window.location.pathname
}

function getServerSnapshot(): string {
  return "/"
}

export function navigate(to: string): void {
  if (window.location.pathname === to) return
  window.history.pushState(null, "", to)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
  window.scrollTo(0, 0)
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
