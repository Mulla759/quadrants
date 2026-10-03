import type { ButtonHTMLAttributes } from "react"
import { cn } from "../../lib/utils"

export type ButtonVariant = "primary" | "secondary"
export type ButtonSize = "sm" | "md" | "lg" | "xl"

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:brightness-110",
  secondary: "border border-line bg-surface text-ink hover:bg-hover",
}

const SIZES: Record<ButtonSize, string> = {
  sm: "h-[34px] px-[14px] text-[14px]",
  md: "h-[40px] px-[16px] text-[14px]",
  lg: "h-[46px] px-[20px] text-[15px]",
  xl: "h-[50px] px-[22px] text-[16px]",
}

export function Button({
  variant = "primary",
  size = "lg",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-[8px] rounded-[6px] font-medium transition-[filter,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
