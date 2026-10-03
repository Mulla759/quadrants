import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export function MonoLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[12px] tracking-[1px] text-muted", className)}>{children}</span>
  )
}
