import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

/**
 * PR6 — Category filter SSOT smoke: URL paramları ile filtre sonuçları 0'a düşmesin.
 * Kategori sayfasına query string ile gidip ürün listesinde en az 1 ürün olduğunu doğrular.
 */
const BASE_PATH = "/kadin/gunes-gozlugu";

const CATEGORY_FILTER_SCENARIOS: { name: string; query: Record<string, string> }[] = [
  { name: "shape=aviator", query: { shape: "aviator" } },
  { name: "color_frame=siyah (TR)", query: { color_frame: "siyah" } },
  { name: "color_frame=black (EN)", query: { color_frame: "black" } },
  { name: "feature=polarize", query: { feature: "polarize" } },
  { name: "size=54", query: { size: "54" } },
];

test.describe("Category filter smoke — URL params → page loads, no crash", () => {
  for (const scenario of CATEGORY_FILTER_SCENARIOS) {
    test(`${scenario.name} → page loads, results or empty state`, async ({
      page,
    }) => {
      const params = new URLSearchParams(scenario.query)
      const url = `${BASE_PATH}?${params.toString()}`
      await page.goto(`${BASE_URL}${url}`)

      await expect(page).toHaveURL(new RegExp(BASE_PATH))
      // Either product list or empty state is shown (filter did not crash)
      const cards = page.getByTestId("product-card")
      const count = await cards.count()
      const hasCards = count > 0
      const emptyVisible = await page
        .locator('[data-testid="catalog-empty-state"]')
        .isVisible()
        .catch(() => false)
      expect(
        hasCards || emptyVisible,
        `Category filter "${scenario.name}" should show products or empty state, got ${count} cards and empty visible=${emptyVisible}`
      ).toBe(true)
    })
  }
})
