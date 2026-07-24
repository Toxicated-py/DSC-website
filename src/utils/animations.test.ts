import { afterEach, describe, expect, it, vi } from "vitest";

describe("reduced-motion animations", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("removes movement and transition duration", async () => {
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true })));
    vi.resetModules();

    const animations = await import("./animations");

    expect(animations.prefersReducedMotion).toBe(true);
    expect(animations.safeTransition).toEqual({ duration: 0 });
    expect((animations.slideLeft.hidden as { x: number }).x).toBe(0);
  });
});
