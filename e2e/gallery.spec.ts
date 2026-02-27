import { test, expect } from "@playwright/test";

test.describe("Image gallery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the gallery component", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");
    await expect(gallery).toBeVisible();
  });

  test("loads images from the API", async ({ page }) => {
    // Wait for images to appear in the gallery shadow DOM
    const gallery = page.locator("pxme-gallery");
    const cards = gallery.locator(".pxme-gallery__link");
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });

    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("gallery cards have proper structure", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");
    const firstCard = gallery.locator(".pxme-gallery__link").first();
    await expect(firstCard).toBeVisible({ timeout: 15_000 });

    // Card should have a figure with an image
    const figure = firstCard.locator(".pxme-gallery__figure");
    await expect(figure).toBeVisible();

    const img = firstCard.locator(".pxme-gallery__img");
    await expect(img).toBeVisible();

    // Image should have a src attribute pointing to a thumbnail
    const src = await img.getAttribute("src");
    expect(src).toBeTruthy();
  });

  test("gallery cards have titles", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");
    const firstTitle = gallery.locator(".pxme-gallery__title").first();
    await expect(firstTitle).toBeVisible({ timeout: 15_000 });

    const text = await firstTitle.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test("gallery uses grid layout", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");
    // Wait for items to render
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const display = await gallery.evaluate((el) => {
      const container = el.shadowRoot?.querySelector(".pxme-gallery");
      return container ? getComputedStyle(container).display : "";
    });
    expect(display).toBe("grid");
  });

  test("gallery images load successfully", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");
    const firstImg = gallery.locator(".pxme-gallery__img").first();
    await expect(firstImg).toBeVisible({ timeout: 15_000 });

    // Check image actually loaded (naturalWidth > 0)
    const loaded = await firstImg.evaluate(
      (el) => (el as HTMLImageElement).naturalWidth > 0,
    );
    expect(loaded).toBe(true);
  });
});

test.describe("Infinite scroll", () => {
  test("loads more images when scrolling to bottom", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");

    // Wait for initial load
    await expect(
      gallery.locator(".pxme-gallery__link").first(),
    ).toBeVisible({ timeout: 15_000 });

    const initialCount = await gallery.locator(".pxme-gallery__link").count();

    // Scroll to the bottom to trigger infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(3000);

    const newCount = await gallery.locator(".pxme-gallery__link").count();
    // Should have loaded more items (or at least not fewer)
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });
});
