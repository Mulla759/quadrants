import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-[3px] border border-line bg-surface px-[3px] font-mono text-[10px] leading-none text-muted",
        className,
      )}
    >
      {children}
    </kbd>
  )
}
