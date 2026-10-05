import { describe, expect, it } from "vitest"
import { SCRIBBLE_SEGMENTS, easeOutCubic, scribblePath, scribblePoint } from "./scribble"

describe("scribble geometry", () => {
  it("keeps points inside the vertical band", () => {
    for (let i = 0; i <= 20; i++) {
      const point = scribblePoint(i / 20, 200)
      expect(point.y).toBeGreaterThan(-5)
      expect(point.y).toBeLessThan(25)
    }
  })

  it("produces a complete path at full progress", () => {
    expect(scribblePath(200, 1)).toHaveLength(SCRIBBLE_SEGMENTS + 1)
    expect(scribblePath(200, 0)).toHaveLength(3)
  })

  it("eases out between 0 and 1", () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })
})
