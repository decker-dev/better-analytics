import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Simple test that doesn't require actual rendering
describe("Analytics Component (Next.js)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_BA_URL = undefined;
    process.env.NEXT_PUBLIC_BA_SITE = undefined;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe("Component Exists", () => {
    it("should export Analytics component", async () => {
      // Just test that the component can be imported
      const { Analytics } = await import("../next");
      expect(Analytics).toBeDefined();
      expect(typeof Analytics).toBe("function");
    });

    it("should export re-exported functions", async () => {
      const { init, track, trackPageview } = await import("../next");
      expect(init).toBeDefined();
      expect(track).toBeDefined();
      expect(trackPageview).toBeDefined();
    });
  });

  describe("Module Structure", () => {
    it("should have proper exports", async () => {
      const nextModule = await import("../next");

      expect(nextModule.Analytics).toBeDefined();
      expect(nextModule.init).toBeDefined();
      expect(nextModule.track).toBeDefined();
      expect(nextModule.trackPageview).toBeDefined();
      expect(nextModule.initWithPageview).toBeDefined();
    });
  });
});
