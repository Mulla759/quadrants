import * as DialogPrimitive from "@radix-ui/react-dialog"
import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onOpenChange, title, children, className }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#0F0F0F33]" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-[168px] z-50 w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-lg border border-line bg-surface shadow-[0_12px_32px_#00000026] outline-none",
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
