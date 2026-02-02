import { test, expect } from "@playwright/test";

/**
 * Search + Catalog Health Matrix (post-recovery).
 * Recovery sonrası search, browse, typo-tolerant search, brand navigation ve category filter
 * sayfaları çökmeden çalışıyor mu kanıtla.
 * DoD: En az 14 senaryo çalışır, 0 crash.
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";

const SEARCH_ROUTES: { name: string; path: string }[] = [
  { name: "/search", path: "/search" },
  { name: "/search?q=rayban", path: "/search?q=rayban" },
  { name: "/search?q=ray-ban", path: "/search?q=ray-ban" },
  { name: "/search?q=rayben", path: "/search?q=rayben" },
  { name: "/search?q=rayban erkek", path: "/search?q=rayban%20erkek" },
  {
    name: "/search?q=raybanlar erkek gunes gozlugu",
    path: "/search?q=raybanlar%20erkek%20gunes%20gozlugu",
  },
  { name: "/search?q=damla", path: "/search?q=damla" },
  { name: "/search?q=köşeli", path: "/search?q=köşeli" },
  { name: "/search?q=kedi gozu", path: "/search?q=kedi%20gozu" },
  { name: "/search?q=polarize", path: "/search?q=polarize" },
];

const CATEGORY_FILTER_ROUTES: { name: string; path: string }[] = [
  { name: "shape=aviator", path: "/unisex/gunes-gozlugu?shape=aviator" },
  { name: "feature=polarize", path: "/unisex/gunes-gozlugu?feature=polarize" },
  {
    name: "color_frame=black",
    path: "/unisex/gunes-gozlugu?color_frame=black",
  },
  { name: "size=54", path: "/unisex/gunes-gozlugu?size=54" },
];

test.describe("Search + Catalog Health — Search routes (UI)", () => {
  for (const { name, path } of SEARCH_ROUTES) {
    test(`${name} → page loads (no console error), cards or empty-state, first 3 cards have TL`, async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState("networkidle");

      expect(
        consoleErrors,
        `No console errors expected on ${path}, got: ${consoleErrors.join("; ")}`
      ).toEqual([]);

      const cards = page.getByTestId("product-card");
      const emptyState = page.getByTestId("search-empty-state");
      const cardCount = await cards.count();
      const emptyVisible = await emptyState.isVisible();

      expect(
        cardCount > 0 || emptyVisible,
        `Expected product-card > 0 or search-empty-state visible, got cards=${cardCount} emptyVisible=${emptyVisible}`
      ).toBe(true);

      if (cardCount > 0) {
        const toCheck = Math.min(3, cardCount);
        for (let i = 0; i < toCheck; i++) {
          const card = cards.nth(i);
          await expect(card).toBeVisible();
          await expect(card.locator("text=TL")).toBeVisible();
        }
      }
    });
  }
});

test.describe("Search + Catalog Health — Category filter routes (non-flaky)", () => {
  for (const { name, path } of CATEGORY_FILTER_ROUTES) {
    test(`${name} → product cards or catalog-empty-state`, async ({ page }) => {
      await page.goto(`${BASE_URL}${path}`);
      await page.waitForLoadState("networkidle");

      const cards = page.getByTestId("product-card");
      const emptyState = page.getByTestId("catalog-empty-state");
      const cardCount = await cards.count();
      const emptyVisible = await emptyState.isVisible();

      expect(
        cardCount > 0 || emptyVisible,
        `Category filter "${name}": expected product-card > 0 or catalog-empty-state visible, got cards=${cardCount} emptyVisible=${emptyVisible}`
      ).toBe(true);
    });
  }
});
