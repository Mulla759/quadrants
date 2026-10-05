import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { CATEGORY_COLORS, type CategoryColorIndex } from "@quadrant/core"
import { useUI } from "../../lib/ui"
import { useWorkspace } from "../../lib/workspace"
import { cn } from "../../lib/utils"
import { Modal } from "../ui/Modal"

function CategoryName({ value, onCommit }: { value: string; onCommit: (next: string) => void }) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        const trimmed = draft.trim()
        if (trimmed && trimmed !== value) onCommit(trimmed)
        else setDraft(value)
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur()
        if (event.key === "Escape") {
          event.stopPropagation()
          setDraft(value)
          event.currentTarget.blur()
        }
      }}
      aria-label="Category name"
      className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none"
    />
  )
}

export function CategoriesDialog() {
  const { store, map } = useWorkspace()
  const { categoriesOpen, setCategoriesOpen } = useUI()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categories = map.categories
  const atLimit = categories.length >= 8

  const addCategory = () => {
    if (!store || atLimit) return
    const color = ((categories.length % 8) + 1) as CategoryColorIndex
    const id = store.addCategory({ name: "New category", color })
    setExpandedId(id)
  }

  return (
    <Modal open={categoriesOpen} onOpenChange={setCategoriesOpen} title="Categories">
      <div className="flex flex-col">
        <div className="border-b border-line px-3 py-2">
          <h2 className="text-[13px] font-medium text-ink">Categories</h2>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-1">
          {categories.map((category) => {
            const expanded = expandedId === category.id
            const count = map.tasks.filter((task) => task.categoryId === category.id).length
            return (
              <div key={category.id}>
                <div
                  className={cn(
                    "group/row flex h-[30px] items-center gap-2 rounded-[4px] px-2",
                    expanded ? "bg-selected" : "hover:bg-hover",
                  )}
                >
                  <button
                    type="button"
                    aria-label="Change color"
                    onClick={() => setExpandedId(expanded ? null : category.id)}
                    className="h-[14px] w-[14px] shrink-0 rounded-full ring-1 ring-inset ring-[#0000001A] outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    style={{ background: CATEGORY_COLORS[category.color - 1] }}
                  />
                  <CategoryName
                    value={category.name}
                    onCommit={(next) => store?.updateCategory(category.id, { name: next })}
                  />
                  <span className="shrink-0 font-mono text-[11px] tabular-nums text-faint">{count}</span>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        type="button"
                        aria-label={`Options for ${category.name}`}
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-faint opacity-0 outline-none hover:text-muted focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent group-hover/row:opacity-100"
                      >
                        <MoreHorizontal className="h-[14px] w-[14px]" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        sideOffset={4}
                        className="z-[60] min-w-[150px] rounded-[4px] border border-line bg-surface p-1 text-[13px] shadow-[0_4px_12px_#0000001A]"
                      >
                        <DropdownMenu.Item
                          onSelect={() => setExpandedId(category.id)}
                          className="cursor-pointer rounded-[3px] px-2 py-[6px] text-ink outline-none data-[highlighted]:bg-hover"
                        >
                          Change color
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => store?.deleteCategory(category.id)}
                          className="flex cursor-pointer items-center gap-2 rounded-[3px] px-2 py-[6px] text-ink outline-none data-[highlighted]:bg-hover"
                        >
                          <Trash2 className="h-[14px] w-[14px] text-faint" /> Delete
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>

                {expanded ? (
                  <div className="flex items-center gap-1 px-2 pb-2 pt-1">
                    {CATEGORY_COLORS.map((color, index) => {
                      const colorIndex = (index + 1) as CategoryColorIndex
                      const active = category.color === colorIndex
                      return (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Color ${index + 1}`}
                          onClick={() => store?.updateCategory(category.id, { color: colorIndex })}
                          className={cn(
                            "h-[14px] w-[14px] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent",
                            active ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : "ring-1 ring-inset ring-[#0000001A]",
                          )}
                          style={{ background: color }}
                        />
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="border-t border-line p-1">
          <button
            type="button"
            onClick={addCategory}
            disabled={atLimit}
            className="flex h-[30px] w-full items-center gap-2 rounded-[4px] px-2 text-[14px] text-faint outline-none hover:bg-hover hover:text-muted focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Plus className="h-[15px] w-[15px]" />
            {atLimit ? "Up to 8 categories" : "New category"}
          </button>
        </div>

        <p className="border-t border-line px-3 py-2 text-[11px] text-faint">
          Quadrants stay uncolored. Color marks the life area.
        </p>
      </div>
    </Modal>
  )
}
