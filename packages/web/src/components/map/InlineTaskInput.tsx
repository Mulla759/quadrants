import { useEffect, useRef, useState } from "react"
import type { Category } from "@quadrant/core"

export interface InlineTaskValue {
  title: string
  dueDate?: string
  categoryId?: string
}

interface InlineTaskInputProps {
  categories: Category[]
  initialTitle?: string
  initialDueDate?: string
  initialCategoryId?: string
  onSave: (value: InlineTaskValue) => void
  onCancel: () => void
}

export function InlineTaskInput({
  categories,
  initialTitle = "",
  initialDueDate = "",
  initialCategoryId = "",
  onSave,
  onCancel,
}: InlineTaskInputProps) {
  const [title, setTitle] = useState(initialTitle)
  const [dueDate, setDueDate] = useState(initialDueDate)
  const [categoryId, setCategoryId] = useState(initialCategoryId)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const submit = () => {
    const trimmed = title.trim()
    if (!trimmed) {
      onCancel()
      return
    }
    onSave({ title: trimmed, dueDate: dueDate || undefined, categoryId: categoryId || undefined })
  }

  return (
    <form
      className="flex h-[30px] w-full items-center gap-2 rounded-[4px] border border-accent bg-surface px-2"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <span className="caret h-4 w-[2px] shrink-0 rounded-full bg-accent" />
      <input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation()
            onCancel()
          }
        }}
        placeholder="New task"
        aria-label="Task title"
        className="min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
        aria-label="Due date"
        className="w-[112px] shrink-0 bg-transparent text-[11px] text-muted outline-none"
      />
      <select
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        aria-label="Category"
        className="max-w-[110px] shrink-0 truncate bg-transparent text-[11px] text-muted outline-none"
      >
        <option value="">No category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <span className="shrink-0 whitespace-nowrap text-[11px] text-faint">enter save · esc cancel</span>
    </form>
  )
}
