import { useEffect, useState } from "react"
import { Workspace, type MapMeta } from "@quadrant/core"

export function App() {
  const [maps, setMaps] = useState<MapMeta[]>([])

  useEffect(() => {
    let live = true
    let workspace: Workspace | undefined
    Workspace.open().then((ws) => {
      if (!live) {
        ws.destroy()
        return
      }
      workspace = ws
      setMaps(ws.listMaps())
    })
    return () => {
      live = false
      workspace?.destroy()
    }
  }, [])

  return (
    <div className="flex h-full bg-bg text-ink">
      <main className="m-auto flex flex-col items-center gap-3">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-ink text-[10px] font-semibold text-surface">4</div>
        <h1 className="text-[20px] font-semibold">Quadrant</h1>
        <p className="text-[13px] text-muted">Local-first priority map</p>
        <ul className="flex gap-4 text-[13px] text-faint">
          {maps.map((map) => (
            <li key={map.id}>{map.name}</li>
          ))}
        </ul>
      </main>
    </div>
  )
}
