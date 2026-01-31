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
