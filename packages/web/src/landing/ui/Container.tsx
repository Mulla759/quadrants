import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-[116px]", className)}>{children}</div>
}
