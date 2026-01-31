import { test, expect } from "@playwright/test";

const SCREEN_DIR = "docs/forensics/screens/2026-01-29";

test.describe("UX flows", () => {
  test("1) Home: bannerlar, Popüler Markalar, markalar grid", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const status500: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("response", (res) => {
      if (res.status() === 500) status500.push(res.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("home-hero")).toBeVisible();
    await expect(page.getByTestId("home-banner-kadin")).toBeVisible();
    await expect(page.getByTestId("home-banner-erkek")).toBeVisible();
    await expect(page.getByTestId("home-brand-grid")).toBeVisible();

    await page.screenshot({
      path: `${SCREEN_DIR}/01-home.png`,
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
    expect(status500).toEqual([]);
  });

  test("2) Kadın banner -> /kadin/gunes-gozlugu: ürün kartları (en az 1)", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    await page.getByTestId("home-banner-kadin").click();
    await page.waitForURL(/\/kadin\/gunes-gozlugu/);
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("product-grid")).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: `${SCREEN_DIR}/02-kadin-category.png`,
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
  });

  test("3) Erkek banner -> /erkek/gunes-gozlugu: ürün kartları (en az 1)", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    await page.getByTestId("home-banner-erkek").click();
    await page.waitForURL(/\/erkek\/gunes-gozlugu/);
    await page.waitForLoadState("networkidle");

    await expect(page.getByTestId("product-grid")).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: `${SCREEN_DIR}/03-erkek-category.png`,
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
  });

  test("4) Header search ikon -> /search: input görünür ve focus", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/");
    await page.getByTestId("header-search").click();
    await page.waitForURL(/\/search/);
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByTestId("search-input");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();

    await page.screenshot({
      path: `${SCREEN_DIR}/04-search-input.png`,
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
  });

  test("5) Input Ray-Ban, enter -> /search?q=Ray-Ban: sonuç listesi", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const status500: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("response", (res) => {
      if (res.status() === 500) status500.push(res.url());
    });

    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByTestId("search-input");
    await searchInput.fill("Ray-Ban");
    await page.waitForTimeout(400);
    await searchInput.press("Enter");

    await page.waitForURL(/\/search\?q=Ray-Ban/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");

    expect(page.url()).toMatch(/\/search\?q=Ray-Ban/);

    await page.screenshot({
      path: `${SCREEN_DIR}/05-search-rayban.png`,
      fullPage: true,
    });

    expect(consoleErrors).toEqual([]);
    expect(status500).toEqual([]);
  });

  test("6) Popüler Markalar chip -> /search?q=Ray-Ban: patlamasın", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    await page.goto("/search");
    await page.waitForLoadState("networkidle");

    const raybanChip = page.getByTestId("popular-brand-ray-ban");
    await expect(raybanChip).toBeVisible();
    await raybanChip.click();

    await page.waitForURL(/\/search\?q=Ray-Ban/);
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: `${SCREEN_DIR}/06-search-popular-brand.png`,
      fullPage: true,
    });

    await expect(page.getByTestId("search-input")).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
