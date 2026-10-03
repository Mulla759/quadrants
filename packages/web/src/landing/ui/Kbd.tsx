import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[3px] border border-line bg-surface px-[5px] font-mono text-[10px] leading-none text-muted",
        className,
      )}
    >
      {children}
    </kbd>
  )
}
