import { cn } from "../../lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn("flex h-5 w-5 items-center justify-center rounded-[4px] bg-ink text-surface", className)}
      aria-hidden
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        <rect x="0" y="0" width="5" height="5" rx="1" />
        <rect x="7" y="0" width="5" height="5" rx="1" />
        <rect x="0" y="7" width="5" height="5" rx="1" />
        <rect x="7" y="7" width="5" height="5" rx="1" />
      </svg>
    </span>
  )
}
