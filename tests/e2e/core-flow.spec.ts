import { test, expect } from "@playwright/test";

test.describe("V1 Core Flow Sanity Check", () => {
  test("ana sayfa -> arama -> sepet drawer (boş)", async ({ page }) => {
    // 1. Ana sayfaya git (/)
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // 2. Header'daki Search inputunun görünür olduğunu doğrula (data-testid=header-search-form)
    await expect(page.getByTestId("header-search-form")).toBeVisible();

    // 3. Search inputuna "Ray-Ban" yaz ve Enter'a bas
    const searchInput = page.getByTestId("search-input");
    await searchInput.fill("Ray-Ban");
    await searchInput.press("Enter");

    // 4. URL'in /search?q=Ray-Ban olduğunu doğrula
    await page.waitForURL(/\/search\?q=Ray-Ban/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/search\?q=Ray-Ban/);

    // Header scroll ile gizlenebildiği için en üste kaydırıp sepetin görünmesini sağla
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForLoadState("networkidle");

    // 5. Header'daki Sepet ikonuna tıkla (data-testid=header-cart)
    await page.getByTestId("header-cart").click();

    // 6. Sepet Drawer'ının açıldığını doğrula (data-testid=cart-drawer)
    await expect(page.getByTestId("cart-drawer")).toBeVisible();

    // 7. Sepet boş mesajının göründüğünü doğrula ("Sepetiniz Boş" veya benzeri)
    await expect(
      page.getByText(/Sepetiniz Boş|Sepetiniz boş/i)
    ).toBeVisible();
  });
});
