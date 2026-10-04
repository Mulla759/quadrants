export interface BrowserSupport {
  indexedDB: boolean
  structuredClone: boolean
  intl: boolean
  clipboard: boolean
  matchMedia: boolean
  reducedMotion: boolean
}

export interface BrowserRequirement {
  name: string
  minimum: string
}

export const SUPPORT_MATRIX = {
  chrome: "90+",
  edge: "90+",
  firefox: "90+",
  safari: "14+",
  iosSafari: "14+",
  androidChrome: "latest",
} as const satisfies Record<string, string>

export const SUPPORT_MATRIX_LABELS: readonly BrowserRequirement[] = [
  { name: "Chrome / Edge", minimum: SUPPORT_MATRIX.chrome },
  { name: "Firefox", minimum: SUPPORT_MATRIX.firefox },
  { name: "Safari", minimum: SUPPORT_MATRIX.safari },
  { name: "iOS Safari", minimum: SUPPORT_MATRIX.iosSafari },
  { name: "Android Chrome", minimum: SUPPORT_MATRIX.androidChrome },
]

export function hasIndexedDB(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null
  } catch {
    return false
  }
}

export function supportsStructuredClone(): boolean {
  try {
    return typeof structuredClone === "function"
  } catch {
    return false
  }
}

export function supportsIntl(): boolean {
  try {
    return typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function"
  } catch {
    return false
  }
}

export function supportsClipboard(): boolean {
  try {
    return (
      typeof navigator !== "undefined" &&
      navigator.clipboard !== undefined &&
      navigator.clipboard !== null &&
      typeof navigator.clipboard.writeText === "function"
    )
  } catch {
    return false
  }
}

export function supportsMatchMedia(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.matchMedia === "function"
  } catch {
    return false
  }
}

export function prefersReducedMotion(): boolean {
  if (!supportsMatchMedia()) return false
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {
    return false
  }
}

export function randomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID()
    } catch {
      // Fall through to the manual generator below.
    }
  }

  const bytes = new Uint8Array(16)
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex
    .slice(8, 10)
    .join("")}-${hex.slice(10, 16).join("")}`
}

export function getBrowserSupport(): BrowserSupport {
  return {
    indexedDB: hasIndexedDB(),
    structuredClone: supportsStructuredClone(),
    intl: supportsIntl(),
    clipboard: supportsClipboard(),
    matchMedia: supportsMatchMedia(),
    reducedMotion: prefersReducedMotion(),
  }
}
