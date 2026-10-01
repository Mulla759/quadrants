import { useUI } from "../../lib/ui"

export function Toaster() {
  const { toasts, dismissToast } = useUI()

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-center gap-2 rounded-[4px] border border-line bg-surface px-3 py-2 text-[13px] text-ink shadow-[0_4px_12px_#0000001A]"
        >
          <span>{toast.message}</span>
          {toast.actionLabel ? (
            <>
              <span className="text-faint">·</span>
              <button
                type="button"
                className="rounded-[3px] px-1 text-[13px] font-medium text-accent outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent"
                onClick={() => {
                  toast.onAction?.()
                  dismissToast(toast.id)
                }}
              >
                {toast.actionLabel}
              </button>
            </>
          ) : null}
        </div>
      ))}
    </div>
  )
}
