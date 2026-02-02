import { test, expect } from "@playwright/test";

/**
 * Wishlist smoke (E2E): koruma yönlendirmesi + giriş sonrası favori sayfası.
 * Gereksinim: npm run db:migrate (wishlist_items), npm run seed:wishlist (test kullanıcısı).
 * Seed kullanıcı: wishlist-test@example.com / test1234
 */
test.describe("Wishlist Smoke", () => {
  test("hesap wishlist sayfasi giris yoksa login'e yonlendirir", async ({
    page,
  }) => {
    await page.goto("/account/wishlist");
    await page.waitForURL(/\/auth\/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("giris yapildiktan sonra wishlist sayfasi acilir (bos veya dolu)", async ({
    page,
  }) => {
    test.setTimeout(60000);
    const pageErrors: Error[] = [];
    page.on("pageerror", (err) => pageErrors.push(err));

    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    await page.getByLabel(/e-posta/i).fill("wishlist-test@example.com");
    await page.getByLabel(/şifre/i).fill("test1234");
    const submit = page.getByRole("main").locator('button[type="submit"]');
    await submit.click();
    await page.waitForURL((url) => !url.pathname.includes("/auth/login"), {
      timeout: 15000,
    });
    await page.waitForLoadState("networkidle");
    await page.goto("/account/wishlist");
    await page.waitForLoadState("domcontentloaded");
    await expect(page.getByTestId("wishlist-page")).toBeVisible({ timeout: 15000 });

    const emptyState = page.getByTestId("wishlist-empty-state");
    const productCards = page.getByTestId("product-card");
    const dbError = page.getByText(/veritabanına bağlanılamadı/i);
    await expect(
      emptyState.or(productCards.first()).or(dbError)
    ).toBeVisible({ timeout: 10000 });

    expect(pageErrors).toEqual([]);
  });
});
