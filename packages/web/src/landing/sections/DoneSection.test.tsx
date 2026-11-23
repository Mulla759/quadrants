import { act, cleanup, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DoneSection } from "./DoneSection"

// The real Scribble draws to a 2D canvas context and drives itself with
// requestAnimationFrame, neither of which jsdom provides. Replace it with a
// plain marker element so the test can count how many done rows are crossed out.
vi.mock("../ui/Scribble", () => ({
  Scribble: () => <canvas data-testid="scribble" />,
}))

const TITLES = [
  "Email recruiter back",
  "Return library books",
  "Call grandma",
  "Book dentist appointment",
  "Outline research essay",
]

// jsdom has no IntersectionObserver. This mock keeps every instance so tests
// can drive visibility through DoneSection's useSectionPresence hook.
const observers: MockIntersectionObserver[] = []

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin = "0px"
  readonly thresholds: ReadonlyArray<number> = [0]

  private readonly callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback
    observers.push(this)
  }

  observe(): void {}

  unobserve(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  disconnect(): void {
    const index = observers.indexOf(this)
    if (index !== -1) observers.splice(index, 1)
  }

  fire(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this)
  }
}

// jsdom also has no matchMedia; DoneSection reads it via prefersReducedMotion().
function stubMatchMedia(matches: boolean): void {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener() {},
      removeEventListener() {},
    })),
  })
}

function fireIntersection(isIntersecting: boolean): void {
  for (const observer of observers) observer.fire(isIntersecting)
}

function toastWrapper(): HTMLElement {
  const text = screen.getByText("Completed “Book dentist appointment”")
  if (!text.parentElement) throw new Error("toast wrapper not found")
  return text.parentElement
}

beforeEach(() => {
  observers.length = 0
  vi.useFakeTimers()
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  stubMatchMedia(false)
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  delete (window as { matchMedia?: unknown }).matchMedia
})

describe("DoneSection", () => {
  it("renders all five task titles and the heading", () => {
    render(<DoneSection />)

    expect(screen.getByText("Cross it out.")).toBeTruthy()
    for (const title of TITLES) {
      expect(screen.getByText(title)).toBeTruthy()
    }
  })

  it("shows no scribbles and a hidden toast before the section enters the viewport", () => {
    render(<DoneSection />)

    expect(screen.queryAllByTestId("scribble")).toHaveLength(0)
    expect(toastWrapper().className).toContain("opacity-0")
  })

  it("runs the completion sequence once the section enters the viewport", () => {
    render(<DoneSection />)

    act(() => {
      fireIntersection(true)
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // One scribble for each of the three done rows.
    expect(screen.getAllByTestId("scribble")).toHaveLength(3)
    expect(screen.getByText("Completed “Book dentist appointment”")).toBeTruthy()
    expect(toastWrapper().className).toContain("opacity-100")
  })

  it("replays the sequence when the section re-enters the viewport", () => {
    render(<DoneSection />)

    act(() => {
      fireIntersection(true)
    })
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getAllByTestId("scribble")).toHaveLength(3)

    // Leave and re-enter: the sequence resets before the timers run again.
    act(() => {
      fireIntersection(false)
    })
    act(() => {
      fireIntersection(true)
    })
    expect(screen.queryAllByTestId("scribble")).toHaveLength(0)
    expect(toastWrapper().className).toContain("opacity-0")

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getAllByTestId("scribble")).toHaveLength(3)
    expect(toastWrapper().className).toContain("opacity-100")
  })

  it("completes immediately when reduced motion is preferred", () => {
    stubMatchMedia(true)
    render(<DoneSection />)

    // Before entering the viewport nothing is crossed out yet.
    expect(screen.queryAllByTestId("scribble")).toHaveLength(0)

    act(() => {
      fireIntersection(true)
    })
    act(() => {
      vi.advanceTimersByTime(50)
    })

    // No long staggered delays: the final state is reached at once.
    expect(screen.getAllByTestId("scribble")).toHaveLength(3)
    expect(toastWrapper().className).toContain("opacity-100")
  })
})
