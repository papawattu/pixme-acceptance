import { test, expect } from "@playwright/test";

// Visual snapshot baselines are chromium-only — skip other browsers
test.skip(({ browserName }) => browserName !== "chromium", "Visual tests run on chromium only");

test.describe("Visual snapshots", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for gallery images to load so the page is stable
    const gallery = page.locator("pxme-gallery");
    await gallery.locator(".pxme-gallery__img").first().waitFor({ timeout: 15_000 });
  });

  test("full page above the fold", async ({ page }) => {
    await expect(page).toHaveScreenshot("full-page.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("header component", async ({ page }) => {
    const header = page.locator("pxme-header");
    await expect(header).toHaveScreenshot("header.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("toolbar component", async ({ page }) => {
    const toolbar = page.locator("pxme-toolbar");
    await expect(toolbar).toHaveScreenshot("toolbar.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("footer component", async ({ page }) => {
    // The <pxme-footer> host is zero-height in flow (inner content is position:fixed),
    // so screenshot the inner .pxme-footer bar directly
    const footerBar = page.locator("pxme-footer .pxme-footer");
    // Wait for the version text to load (async fetch inside component)
    await expect(footerBar.locator(".pxme-footer__versions")).not.toHaveText("");
    await expect(footerBar).toHaveScreenshot("footer.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("gallery first card", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");
    const firstCard = gallery.locator(".pxme-gallery__link").first();
    await expect(firstCard).toHaveScreenshot("gallery-card.png", {
      maxDiffPixelRatio: 0.01,
    });
  });

  test("filter dropdown open", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    const toggle = filter.locator(".pxme-filter__toggle");
    await toggle.click();
    const dropdown = filter.locator(".pxme-filter__dropdown");
    await expect(dropdown).toBeVisible();
    await expect(filter).toHaveScreenshot("filter-open.png", {
      maxDiffPixelRatio: 0.01,
    });
  });
});

test.describe("Visual snapshots — view page", () => {
  test("image viewer", async ({ page }) => {
    // Navigate to gallery first to get a real image URL
    await page.goto("/");
    const gallery = page.locator("pxme-gallery");
    const firstLink = gallery.locator(".pxme-gallery__link").first();
    await firstLink.waitFor({ timeout: 15_000 });
    const href = await firstLink.getAttribute("href");
    expect(href).toBeTruthy();

    await page.goto(href!);
    const viewer = page.locator("pxme-viewer");
    await viewer.locator(".pxme-viewer__img").waitFor({ timeout: 10_000 });

    // Wait for image to fully render
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("viewer-page.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});

test.describe("Visual snapshots — admin page", () => {
  test("admin page layout", async ({ page }) => {
    await page.goto("/admin.html");
    // Admin page should render header + admin panel (with auth gate message) + footer
    const header = page.locator("pxme-header");
    await expect(header).toBeVisible();
    // Wait for footer version text to load
    const footer = page.locator("pxme-footer");
    await expect(footer.locator(".pxme-footer__versions")).not.toHaveText("", { timeout: 10_000 });

    await expect(page).toHaveScreenshot("admin-page.png", {
      fullPage: false,
      maxDiffPixelRatio: 0.01,
    });
  });
});
