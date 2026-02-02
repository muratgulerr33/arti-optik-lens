import { test, expect } from "@playwright/test";

/**
 * PR3d Search 0'a düşmesin: phrase BONUS, alias fix, multi-pass relax
 * Bu sorguların hepsi en az 1 sonuç dönmeli (0'a düşmemeli).
 */
const SEARCH_SMOKE_QUERIES = [
  "rayban erkek siyah gunes gozlugu",
  "Ray-ban erkek black güneş Gözlüğü",
  "Damla Gözlük",
  "yuvarlak men gözlük",
  "kedi gozu",
  "uv400",
  "uv 400",
];

/** PR5: Typo tolerant (pg_trgm) — "rayben" -> "Ray-Ban" gibi; DB'de Ray-Ban olduğu varsayılır. */
const TYPO_TOLERANT_QUERIES = [
  "rayben",
  "raybann",
  "reyban",
  "rayben erkek",
];

test.describe("Search smoke — 0'a düşmesin", () => {
  for (const q of SEARCH_SMOKE_QUERIES) {
    test(`"${q}" → items.length > 0`, async ({ request }) => {
      const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
      const res = await request.get(`${baseURL}/api/search`, {
        params: { q, limit: "8" },
      });
      expect(res.ok()).toBe(true);
      const body = await res.json();
      expect(Array.isArray(body.items)).toBe(true);
      expect(
        body.items.length,
        `Query "${q}" should return at least 1 result, got ${body.items.length}`
      ).toBeGreaterThan(0);
    });
  }
});

test.describe("Search smoke — typo tolerant (PR5 pg_trgm)", () => {
  for (const q of TYPO_TOLERANT_QUERIES) {
    test(`"${q}" → items.length > 0`, async ({ request }) => {
      const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
      const res = await request.get(`${baseURL}/api/search`, {
        params: { q, limit: "24" },
      });
      expect(res.ok()).toBe(true);
      const body = await res.json();
      expect(Array.isArray(body.items)).toBe(true);
      expect(
        body.items.length,
        `Typo query "${q}" should return at least 1 result (e.g. Ray-Ban), got ${body.items.length}`
      ).toBeGreaterThan(0);
    });
  }
});

/** PR Search Recovery: normalize + typo + browse + koseli */
test.describe("Search Recovery — browse, normalize, typo, koseli", () => {
  test("/search (q boş) → product-card > 0 (browse mode)", async ({ page }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    await page.goto(`${baseURL}/search`);
    await expect(page.locator("[data-testid='search-empty-state']")).not.toBeVisible();
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("/search?q=rayban → >0", async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, { params: { q: "rayban", limit: "24" } });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length, "rayban should return results").toBeGreaterThan(0);
  });

  test("/search?q=ray-ban → >0 (normalize: ray-ban ≈ rayban)", async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, { params: { q: "ray-ban", limit: "24" } });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length, "ray-ban should return results (normalized)").toBeGreaterThan(0);
  });

  test("/search?q=rayben → >0 (typo PASS3)", async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, { params: { q: "rayben", limit: "24" } });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length, "rayben typo should return results").toBeGreaterThan(0);
  });

  test("/search?q=koseli → >0 (köşeli shape map)", async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, { params: { q: "koseli", limit: "24" } });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length, "koseli should return results").toBeGreaterThan(0);
  });

  test("GET /api/search?limit=24 (no q) → browse items > 0", async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, { params: { limit: "24" } });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(body.items.length, "browse mode should return items").toBeGreaterThan(0);
  });
});

/** PR Search Final Correctness: brand phrase lock, gender scoring, shape dictionary */
test.describe("Search Final Correctness — brand lock, gender scoring", () => {
  test("q=Ray Ban&limit=100 → rayban ile aynı banda (>=20)", async ({ request }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, {
      params: { q: "Ray Ban", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "Ray Ban (brand phrase lock) should return >= 20 like rayban"
    ).toBeGreaterThanOrEqual(20);
  });

  test("q=rayban erkek&limit=100 → rayban ile aynı banda (>=20, gender scoring only)", async ({
    request,
  }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, {
      params: { q: "rayban erkek", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "rayban erkek (gender scoring only) should return >= 20 like rayban"
    ).toBeGreaterThanOrEqual(20);
  });
});

/** PR10: Search stopwords fix — damla gozluk 0 bug */
test.describe("Search stopwords (PR10) — damla gozluk, gunes gozlugu > 0", () => {
  test("GET /api/search?q=damla%20gozluk&limit=100 => items.length > 0", async ({
    request,
  }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, {
      params: { q: "damla gozluk", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "damla gozluk (stopwords fix) should return > 0"
    ).toBeGreaterThan(0);
  });

  test("GET /api/search?q=damla%20gunes%20gozlugu&limit=100 => items.length > 0", async ({
    request,
  }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, {
      params: { q: "damla gunes gozlugu", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "damla gunes gozlugu (stopwords fix) should return > 0"
    ).toBeGreaterThan(0);
  });

  test("GET /api/search?q=gunes%20gozlugu&limit=100 => items.length > 0", async ({
    request,
  }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, {
      params: { q: "gunes gozlugu", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "gunes gozlugu (browse when only stopwords) should return > 0"
    ).toBeGreaterThan(0);
  });
});

/** PR11: kedi gozu alias → cat-eye */
test.describe("Search PR11 — kedi gozu / cat-eye alias", () => {
  test("GET /api/search?q=kedi%20gozu&limit=100 => items.length > 0", async ({
    request,
  }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, {
      params: { q: "kedi gozu", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "kedi gozu (alias → cat-eye) should return > 0"
    ).toBeGreaterThan(0);
  });

  test("GET /api/search?q=cat-eye&limit=100 => items.length > 0", async ({
    request,
  }) => {
    const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
    const res = await request.get(`${baseURL}/api/search`, {
      params: { q: "cat-eye", limit: "100" },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.items)).toBe(true);
    expect(
      body.items.length,
      "cat-eye should return > 0"
    ).toBeGreaterThan(0);
  });
});
