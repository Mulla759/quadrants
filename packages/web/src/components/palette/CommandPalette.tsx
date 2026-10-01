import { Command } from "cmdk"
import {
  Archive,
  Download,
  Inbox,
  Map as MapIcon,
  Moon,
  Plus,
  Search,
  Sun,
  Tags,
  Upload,
} from "lucide-react"
import { exportMapToFile, importMapFromJSON, pickJSONFile } from "../../lib/io"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { Kbd } from "../ui/Kbd"
import { Modal } from "../ui/Modal"

const itemClass =
  "flex h-[30px] cursor-pointer items-center gap-2 rounded-[4px] px-2 text-[13px] text-ink outline-none data-[selected=true]:bg-hover"

export function CommandPalette() {
  const { workspace, maps, activeMapId, store, setActiveMap, setTheme, theme } = useWorkspace()
  const { paletteOpen, setPaletteOpen, setView, startCreate, focusedQuadrant, openDetail, setCategoriesOpen, pushToast } =
    useUI()

  const activeMap = maps.find((map) => map.id === activeMapId)
  const close = () => setPaletteOpen(false)

  const importMap = async () => {
    const json = await pickJSONFile()
    if (!json || !workspace) return
    try {
      const id = await importMapFromJSON(workspace, json)
      setActiveMap(id)
      setView("map")
      pushToast({ message: "Map imported" })
    } catch (cause) {
      pushToast({ message: cause instanceof Error ? cause.message : "Import failed" })
    }
  }

  return (
    <Modal open={paletteOpen} onOpenChange={setPaletteOpen} title="Command palette">
      <Command className="flex flex-col" label="Command palette">
        <div className="flex items-center gap-2 border-b border-line px-3 py-2">
          <Search className="h-[14px] w-[14px] text-faint" />
          <Command.Input
            autoFocus
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
          />
          <Kbd>esc</Kbd>
        </div>

        <Command.List className="max-h-[320px] overflow-y-auto p-1">
          <Command.Empty className="px-2 py-6 text-center text-[13px] text-muted">No results.</Command.Empty>

          <Command.Group
            heading="Commands"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-faint"
          >
            <Command.Item
              value="New task"
              className={itemClass}
              onSelect={() => {
                setView("map")
                startCreate(focusedQuadrant)
                close()
              }}
            >
              <Plus className="h-[14px] w-[14px] text-faint" /> New task
            </Command.Item>
            <Command.Item
              value="Go to Map"
              className={itemClass}
              onSelect={() => {
                setView("map")
                close()
              }}
            >
              <MapIcon className="h-[14px] w-[14px] text-faint" /> Go to Map
            </Command.Item>
            <Command.Item
              value="Go to Inbox"
              className={itemClass}
              onSelect={() => {
                setView("inbox")
                close()
              }}
            >
              <Inbox className="h-[14px] w-[14px] text-faint" /> Go to Inbox
            </Command.Item>
            <Command.Item
              value="Go to Today"
              className={itemClass}
              onSelect={() => {
                setView("today")
                close()
              }}
            >
              <Sun className="h-[14px] w-[14px] text-faint" /> Go to Today
            </Command.Item>
            <Command.Item
              value="Go to Archive"
              className={itemClass}
              onSelect={() => {
                setView("archive")
                close()
              }}
            >
              <Archive className="h-[14px] w-[14px] text-faint" /> Go to Archive
            </Command.Item>
            <Command.Item
              value="Manage categories"
              className={itemClass}
              onSelect={() => {
                setCategoriesOpen(true)
                close()
              }}
            >
              <Tags className="h-[14px] w-[14px] text-faint" /> Manage categories
            </Command.Item>
            <Command.Item
              value="Toggle dark mode"
              className={itemClass}
              onSelect={() => {
                setTheme(theme === "dark" ? "light" : "dark")
                close()
              }}
            >
              {theme === "dark" ? <Sun className="h-[14px] w-[14px] text-faint" /> : <Moon className="h-[14px] w-[14px] text-faint" />}{" "}
              Toggle dark mode
            </Command.Item>
            <Command.Item
              value="Export map"
              className={itemClass}
              onSelect={() => {
                if (store) exportMapToFile(store, activeMap?.name ?? "Quadrant map")
                close()
              }}
            >
              <Download className="h-[14px] w-[14px] text-faint" /> Export map
            </Command.Item>
            <Command.Item
              value="Import map"
              className={itemClass}
              onSelect={() => {
                close()
                void importMap()
              }}
            >
              <Upload className="h-[14px] w-[14px] text-faint" /> Import map
            </Command.Item>
          </Command.Group>

          {store ? (
            <Command.Group
              heading="Tasks"
              className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-faint"
            >
              {store
                .listTasks()
                .slice(0, 30)
                .map((task) => (
                  <Command.Item
                    key={task.id}
                    value={`${task.title}`}
                    className={itemClass}
                    onSelect={() => {
                      openDetail(task.id)
                      setView("map")
                      close()
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  </Command.Item>
                ))}
            </Command.Group>
          ) : null}

          <Command.Group
            heading="Maps"
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:text-faint"
          >
            {maps.map((map) => (
              <Command.Item
                key={map.id}
                value={`Map ${map.name}`}
                className={itemClass}
                onSelect={() => {
                  setActiveMap(map.id)
                  setView("map")
                  close()
                }}
              >
                <MapIcon className="h-[14px] w-[14px] text-faint" />
                <span className="flex-1 truncate">{map.name}</span>
              </Command.Item>
            ))}
            <Command.Item
              value="New map"
              className={itemClass}
              onSelect={async () => {
                if (workspace) {
                  const id = await workspace.createMap("Untitled map")
                  setActiveMap(id)
                  setView("map")
                }
                close()
              }}
            >
              <Plus className="h-[14px] w-[14px] text-faint" /> New map
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="border-t border-line px-3 py-2 text-[11px] text-faint">
          ↑↓ navigate · ↵ select · esc close
        </div>
      </Command>
    </Modal>
  )
}
