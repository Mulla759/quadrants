import { afterEach, describe, expect, it, vi } from "vitest"
import {
  SUPPORT_MATRIX,
  getBrowserSupport,
  hasIndexedDB,
  prefersReducedMotion,
  randomId,
  supportsClipboard,
  supportsIntl,
  supportsMatchMedia,
  supportsStructuredClone,
} from "./browser"

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function stubMatchMedia(matches: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({ matches, media: query })),
  })
}

function stubClipboard(value: unknown): void {
  Object.defineProperty(navigator, "clipboard", { configurable: true, value })
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  delete (window as { matchMedia?: unknown }).matchMedia
  delete (navigator as { clipboard?: unknown }).clipboard
})

describe("browser capability helpers", () => {
  it("detects IndexedDB presence without throwing when absent", () => {
    vi.stubGlobal("indexedDB", undefined)
    expect(hasIndexedDB()).toBe(false)

    vi.stubGlobal("indexedDB", { open: vi.fn() })
    expect(hasIndexedDB()).toBe(true)
  })

  it("detects structuredClone support", () => {
    vi.stubGlobal("structuredClone", undefined)
    expect(supportsStructuredClone()).toBe(false)

    vi.stubGlobal("structuredClone", (value: unknown) => value)
    expect(supportsStructuredClone()).toBe(true)
  })

  it("reports Intl support", () => {
    expect(supportsIntl()).toBe(true)
  })

  it("detects the async clipboard API", () => {
    stubClipboard(undefined)
    expect(supportsClipboard()).toBe(false)

    stubClipboard({ writeText: vi.fn() })
    expect(supportsClipboard()).toBe(true)
  })

  it("detects matchMedia and reduced-motion preference", () => {
    stubMatchMedia(false)
    expect(supportsMatchMedia()).toBe(true)
    expect(prefersReducedMotion()).toBe(false)

    stubMatchMedia(true)
    expect(prefersReducedMotion()).toBe(true)
  })

  it("returns a fully boolean support matrix", () => {
    const support = getBrowserSupport()
    for (const value of Object.values(support)) expect(typeof value).toBe("boolean")
    expect(SUPPORT_MATRIX.safari).toBe("14+")
    expect(SUPPORT_MATRIX.firefox).toBe("90+")
  })
})

describe("randomId", () => {
  it("uses crypto.randomUUID when available", () => {
    const spy = vi.spyOn(crypto, "randomUUID").mockReturnValue("11111111-2222-4333-8444-555555555555")
    expect(randomId()).toBe("11111111-2222-4333-8444-555555555555")
    expect(spy).toHaveBeenCalledOnce()
  })

  it("falls back to a valid v4 UUID without crypto", () => {
    vi.stubGlobal("crypto", undefined)
    expect(randomId()).toMatch(UUID_V4)
  })
})
