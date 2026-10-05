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
  if (typeof window === "undefined") return
  const target = new URL(to, window.location.origin)
  const current = window.location
  if (current.pathname === target.pathname && current.search === target.search && current.hash === target.hash) {
    return
  }
  window.history.pushState(null, "", `${target.pathname}${target.search}${target.hash}`)
  window.dispatchEvent(new Event(NAVIGATE_EVENT))
  window.scrollTo(0, 0)
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
