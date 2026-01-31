import { test, expect } from "@playwright/test";

/**
 * PR7 Search UI — /search sayfası /api/search (SSOT) ile aynı sonucu göstermeli.
 * /search?q=... açıldığında [data-testid="product-card"] sayısı > 0 olmalı (ray-ban, typo, rayban erkek).
 */
test.describe("Search UI smoke — product cards visible", () => {
  test("/search?q=rayban → product-card count > 0", async ({ page }) => {
    await page.goto("/search?q=rayban");
    await expect(page.getByTestId("product-card").first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.getByTestId("product-card").count();
    expect(count, "At least one product card should be visible for q=rayban").toBeGreaterThan(0);
  });

  test("/search?q=rayben (typo) → product-card count > 0", async ({ page }) => {
    await page.goto("/search?q=rayben");
    await expect(page.getByTestId("product-card").first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.getByTestId("product-card").count();
    expect(count, "Typo 'rayben' should still show results (e.g. Ray-Ban)").toBeGreaterThan(0);
  });

  test("/search?q=rayban%20erkek → product-card count > 0", async ({ page }) => {
    await page.goto("/search?q=rayban%20erkek");
    await expect(page.getByTestId("product-card").first()).toBeVisible({
      timeout: 10000,
    });
    const count = await page.getByTestId("product-card").count();
    expect(count, "q=rayban erkek should show at least one product").toBeGreaterThan(0);
  });
});
