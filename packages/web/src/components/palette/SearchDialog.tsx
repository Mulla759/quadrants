import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { CATEGORY_COLORS } from "@quadrant/core"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { Kbd } from "../ui/Kbd"
import { Modal } from "../ui/Modal"

const rowClass =
  "flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2 text-left text-[13px] text-ink outline-none hover:bg-hover focus-visible:bg-hover focus-visible:ring-2 focus-visible:ring-accent"

function GroupHeading({ children }: { children: string }) {
  return <div className="px-2 py-1 text-[11px] text-faint">{children}</div>
}

export function SearchDialog() {
  const { map, maps, setActiveMap } = useWorkspace()
  const { searchOpen, setSearchOpen, setView, openDetail, setCategoriesOpen } = useUI()
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (searchOpen) setQuery("")
  }, [searchOpen])

  const q = query.trim().toLowerCase()
  const taskResults = q ? map.tasks.filter((task) => task.title.toLowerCase().includes(q)).slice(0, 8) : []
  const mapResults = q ? maps.filter((candidate) => candidate.name.toLowerCase().includes(q)) : []
  const categoryResults = q ? map.categories.filter((category) => category.name.toLowerCase().includes(q)) : []
  const hasResults = taskResults.length + mapResults.length + categoryResults.length > 0

  const close = () => setSearchOpen(false)

  return (
    <Modal open={searchOpen} onOpenChange={setSearchOpen} title="Search">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <Search className="h-[14px] w-[14px] text-faint" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tasks, maps, categories…"
          aria-label="Search"
          className="flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
        />
        <Kbd>esc</Kbd>
      </div>

      <div className="max-h-[320px] overflow-y-auto p-1">
        {!q ? (
          <p className="px-2 py-6 text-center text-[13px] text-muted">
            Type to search tasks, maps, and categories.
          </p>
        ) : !hasResults ? (
          <p className="px-2 py-6 text-center text-[13px] text-muted">No results.</p>
        ) : (
          <>
            {taskResults.length > 0 ? (
              <div className="mb-1">
                <GroupHeading>Tasks</GroupHeading>
                {taskResults.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className={rowClass}
                    onClick={() => {
                      openDetail(task.id)
                      setView("map")
                      close()
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{task.title}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {mapResults.length > 0 ? (
              <div className="mb-1">
                <GroupHeading>Maps</GroupHeading>
                {mapResults.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className={rowClass}
                    onClick={() => {
                      setActiveMap(candidate.id)
                      setView("map")
                      close()
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{candidate.name}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {categoryResults.length > 0 ? (
              <div className="mb-1">
                <GroupHeading>Categories</GroupHeading>
                {categoryResults.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className={rowClass}
                    onClick={() => {
                      setCategoriesOpen(true)
                      close()
                    }}
                  >
                    <span
                      className="h-[6px] w-[6px] rounded-full"
                      style={{ background: CATEGORY_COLORS[category.color - 1] }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </Modal>
  )
}
