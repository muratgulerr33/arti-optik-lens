import { test, expect } from "@playwright/test";

/**
 * PR8 Search matrix: query varyasyonları, brand param geri uyumluluk, limit kontrol.
 * Assert: crash yok; çoğu sorguda product-card > 0 veya search-empty-state görünür.
 */

const QUERY_VARIATIONS = [
  "rayban",
  "ray-ban",
  "Ray-Ban",
  "rayben",
  "reyban",
  "raybann",
  "rayban erkek",
  "rayban erkek siyah gunes gozlugu",
  "kedi gozu",
  "uv400",
  "damlla",
  "gunnes",
];

test.describe("Search matrix — query variations", () => {
  for (const q of QUERY_VARIATIONS) {
    test(`"${q}" → no crash, cards > 0 or empty state`, async ({ page }) => {
      await page.goto(`/search?q=${encodeURIComponent(q)}`);
      await page.waitForLoadState("networkidle");

      const cards = page.getByTestId("product-card");
      const emptyState = page.getByTestId("search-empty-state");
      const cardCount = await cards.count();
      const emptyVisible = await emptyState.isVisible();

      expect(
        cardCount > 0 || emptyVisible,
        `Query "${q}": expected product-card > 0 or search-empty-state visible, got cards=${cardCount} emptyVisible=${emptyVisible}`
      ).toBe(true);
    });
  }
});

test.describe("Search matrix — brand param backward compatibility", () => {
  test("/search?brand=ray-ban → product-card > 0", async ({ page }) => {
    await page.goto("/search?brand=ray-ban");
    await page.waitForLoadState("networkidle");

    const cards = page.getByTestId("product-card");
    const count = await cards.count();
    expect(
      count,
      "brand=ray-ban should show at least one product card"
    ).toBeGreaterThan(0);
  });

  test("/search?brand=prada → product-card > 0 or empty state", async ({
    page,
  }) => {
    await page.goto("/search?brand=prada");
    await page.waitForLoadState("networkidle");

    const cards = page.getByTestId("product-card");
    const emptyState = page.getByTestId("search-empty-state");
    const cardCount = await cards.count();
    const emptyVisible = await emptyState.isVisible();

    expect(cardCount > 0 || emptyVisible).toBe(true);
  });
});

test.describe("Search matrix — limit param", () => {
  test("limit=100 returns >= limit=24 items count", async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

    const res24 = await request.get(`${baseURL}/api/search`, {
      params: { q: "rayban", limit: "24" },
    });
    const res100 = await request.get(`${baseURL}/api/search`, {
      params: { q: "rayban", limit: "100" },
    });

    expect(res24.ok()).toBe(true);
    expect(res100.ok()).toBe(true);

    const body24 = await res24.json();
    const body100 = await res100.json();

    const len24 = Array.isArray(body24.items) ? body24.items.length : 0;
    const len100 = Array.isArray(body100.items) ? body100.items.length : 0;

    expect(
      len100 >= len24,
      `limit=100 (${len100}) should be >= limit=24 (${len24})`
    ).toBe(true);
  });
});
