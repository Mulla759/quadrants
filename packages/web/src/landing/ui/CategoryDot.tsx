import { cn } from "../../lib/utils"

export function CategoryDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn("inline-block h-[6px] w-[6px] shrink-0 rounded-full", className)}
      style={{ backgroundColor: color }}
    />
  )
}
