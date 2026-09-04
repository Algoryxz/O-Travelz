import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  registerServiceWorker,
  unregisterServiceWorker,
} from "../src/utils/registerServiceWorker";

describe("Phase 14 Step 4: PWA Offline Hardening & Service Worker Suite", () => {
  const publicDir = path.resolve(__dirname, "../public");
  const indexHtmlPath = path.resolve(__dirname, "../index.html");

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("1. Web App Manifest Compliance", () => {
    it("manifest.webmanifest exists and contains valid JSON", () => {
      const manifestPath = path.join(publicDir, "manifest.webmanifest");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const raw = fs.readFileSync(manifestPath, "utf-8");
      const manifest = JSON.parse(raw);

      expect(manifest.name).toBe("O-Travelz — Odisha Travel Intelligence");
      expect(manifest.short_name).toBe("O-Travelz");
      expect(manifest.start_url).toBe("/");
      expect(manifest.scope).toBe("/");
      expect(manifest.display).toBe("standalone");
      expect(manifest.orientation).toBe("portrait-primary");
      expect(manifest.theme_color).toBe("#0B1220");
      expect(manifest.background_color).toBe("#0B1220");
      expect(Array.isArray(manifest.icons)).toBe(true);
      expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
    });

    it("manifest specifies any and maskable icons", () => {
      const manifestPath = path.join(publicDir, "manifest.webmanifest");
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      const hasAny = manifest.icons.some((i: any) => i.purpose === "any");
      const hasMaskable = manifest.icons.some((i: any) => i.purpose === "maskable");
      expect(hasAny).toBe(true);
      expect(hasMaskable).toBe(true);

      // Verify referenced icon files exist
      manifest.icons.forEach((icon: any) => {
        const iconFilename = icon.src.replace(/^\//, "");
        const filePath = path.join(publicDir, iconFilename);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });
  });

  describe("2. Index.html PWA Metadata & Manifest Linking", () => {
    it("index.html contains manifest link and mobile web app meta tags", () => {
      expect(fs.existsSync(indexHtmlPath)).toBe(true);
      const html = fs.readFileSync(indexHtmlPath, "utf-8");

      expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
      expect(html).toMatch(/<meta name="theme-color" content="(#FBF9F5|#0B1220)"/);
      expect(html).toContain('<meta name="mobile-web-app-capable" content="yes" />');
      expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
      expect(html).toContain('<link rel="apple-touch-icon" href="/logo.jpeg" />');
      expect(html).toContain('<link rel="icon" type="image/svg+xml" href="/icon.svg" />');
    });
  });

  describe("3. Native Service Worker Rules & Caching Strategy", () => {
    it("sw.js exists and defines versioned caches and pre-cached core shell", () => {
      const swPath = path.join(publicDir, "sw.js");
      expect(fs.existsSync(swPath)).toBe(true);

      const swContent = fs.readFileSync(swPath, "utf-8");
      expect(swContent).toContain("otravelz-static-v1.0.0");
      expect(swContent).toContain("otravelz-images-v1.0.0");
      expect(swContent).toContain("/manifest.webmanifest");
      expect(swContent).toContain("/logo.jpeg");
      expect(swContent).toContain("/icon.svg");
    });

    it("sw.js enforces strict bypass for auth, sync, share mutation, and AI endpoints", () => {
      const swContent = fs.readFileSync(path.join(publicDir, "sw.js"), "utf-8");

      expect(swContent).toContain("/\\/auth\\//");
      expect(swContent).toContain("/\\/api\\/v1\\/sync\\//");
      expect(swContent).toContain("/\\/api\\/v1\\/trips\\/share/");
      expect(swContent).toContain("/\\/ai\\//");
      expect(swContent).toContain('request.method !== "GET"');
    });

    it("sw.js handles stale cache eviction during activate event", () => {
      const swContent = fs.readFileSync(path.join(publicDir, "sw.js"), "utf-8");

      expect(swContent).toContain('self.addEventListener("activate"');
      expect(swContent).toContain("caches.delete");
      expect(swContent).toContain("self.clients.claim()");
    });

    it("sw.js provides size-bounded image caching", () => {
      const swContent = fs.readFileSync(path.join(publicDir, "sw.js"), "utf-8");

      expect(swContent).toContain("MAX_IMAGE_ENTRIES");
      expect(swContent).toContain("pruneCache");
    });
  });

  describe("4. Service Worker Frontend Registration", () => {
    it("registerServiceWorker registers /sw.js on window load", () => {
      const registerMock = vi.fn().mockResolvedValue({
        installing: null,
        onupdatefound: null,
      });

      let loadListener: (() => void) | null = null;

      vi.stubGlobal("window", {
        addEventListener: vi.fn((event, callback) => {
          if (event === "load") {
            loadListener = callback;
          }
        }),
      });

      vi.stubGlobal("navigator", {
        serviceWorker: {
          register: registerMock,
        },
      });

      registerServiceWorker();

      expect(window.addEventListener).toHaveBeenCalledWith("load", expect.any(Function));
      expect(loadListener).not.toBeNull();

      // Trigger window load
      if (loadListener) {
        (loadListener as any)();
      }

      expect(registerMock).toHaveBeenCalledWith("/sw.js", { scope: "/" });
    });

    it("registerServiceWorker degrades safely when serviceWorker is unsupported", () => {
      vi.stubGlobal("window", { addEventListener: vi.fn() });
      vi.stubGlobal("navigator", {});

      expect(() => registerServiceWorker()).not.toThrow();
    });

    it("unregisterServiceWorker unregisters existing service worker cleanly", async () => {
      const unregisterMock = vi.fn().mockResolvedValue(true);
      vi.stubGlobal("window", {});
      vi.stubGlobal("navigator", {
        serviceWorker: {
          getRegistration: vi.fn().mockResolvedValue({
            unregister: unregisterMock,
          }),
        },
      });

      const result = await unregisterServiceWorker();
      expect(result).toBe(true);
      expect(unregisterMock).toHaveBeenCalled();
    });
  });
});
