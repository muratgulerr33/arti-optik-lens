import { test, expect } from "@playwright/test";

/**
 * PR9 Search health matrix: default limit, gender hint, stem/brand lock, browse mode, typo sanity.
 * Selector: [data-testid="product-card"]
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Search health — API", () => {
  test("GET /api/search?q=rayban → items.length >= 20 (default limit fix)", async ({
    request,
  }) => {
    const res = await request.get(`${BASE_URL}/api/search`, {
      params: { q: "rayban" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "q=rayban without limit should return >= 20 (default 24)"
    ).toBeGreaterThanOrEqual(20);
  });

  test("GET /api/search?q=rayban&limit=100 → items.length === 22 (local DB assumption)", async ({
    request,
  }) => {
    const res = await request.get(`${BASE_URL}/api/search`, {
      params: { q: "rayban", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "q=rayban limit=100 should return 22 (Ray-Ban count in local DB)"
    ).toBe(22);
  });
});

test.describe("Search health — UI", () => {
  test("/search?q=rayban → product-card >= 20", async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=rayban`);
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(count, "product-card count for q=rayban").toBeGreaterThanOrEqual(20);
  });

  test("/search?q=rayban%20erkek → product-card >= 20 (gender is hint)", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/search?q=rayban%20erkek`);
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(count, "product-card count for q=rayban erkek").toBeGreaterThanOrEqual(20);
  });

  test("/search?q=raybanlar%20erkek%20gunes%20gozlugu → product-card >= 20 (stem/brand lock)", async ({
    page,
  }) => {
    await page.goto(
      `${BASE_URL}/search?q=raybanlar%20erkek%20gunes%20gozlugu`
    );
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(
      count,
      "product-card count for raybanlar erkek gunes gozlugu"
    ).toBeGreaterThanOrEqual(20);
  });

  test("/search (empty) → product-card > 0 (browse mode)", async ({ page }) => {
    await page.goto(`${BASE_URL}/search`);
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(count, "browse mode should show at least one product").toBeGreaterThan(0);
  });
});

test.describe("Search health — typo sanity", () => {
  test("/search?q=rayben → > 0", async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=rayben`);
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(count, "typo rayben should return results").toBeGreaterThan(0);
  });

  test("/search?q=reyban → > 0", async ({ page }) => {
    await page.goto(`${BASE_URL}/search?q=reyban`);
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.locator('[data-testid="product-card"]').count();
    expect(count, "typo reyban should return results").toBeGreaterThan(0);
  });
});
