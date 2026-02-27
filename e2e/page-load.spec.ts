import { test, expect } from "@playwright/test";

test.describe("Page load", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Pixme");
  });

  test("serves a valid HTML page", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-type"]).toContain("text/html");
  });

  test("has correct meta viewport", async ({ page }) => {
    await page.goto("/");
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute(
      "content",
      "width=device-width, initial-scale=1.0",
    );
  });

  test("has theme-color meta tag", async ({ page }) => {
    await page.goto("/");
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute("content", "#ffffff");
  });

  test("has favicon", async ({ page }) => {
    await page.goto("/");
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveCount(2); // 32x32 and 16x16
  });

  test("has apple-touch-icon", async ({ page }) => {
    await page.goto("/");
    const icon = page.locator('link[rel="apple-touch-icon"]');
    await expect(icon).toHaveAttribute("href", /apple-touch-icon/);
  });

  test("loads CSS stylesheet", async ({ page }) => {
    await page.goto("/");
    const stylesheet = page.locator('link[rel="stylesheet"]');
    await expect(stylesheet).toHaveAttribute("href", /style\.css/);
  });

  test("registers custom elements", async ({ page }) => {
    await page.goto("/");
    // Wait for modules to load
    await page.waitForFunction(
      () => customElements.get("pxme-gallery") !== undefined,
      null,
      { timeout: 10_000 },
    );
    const galleryDefined = await page.evaluate(
      () => customElements.get("pxme-gallery") !== undefined,
    );
    const filterDefined = await page.evaluate(
      () => customElements.get("pxme-filter") !== undefined,
    );
    expect(galleryDefined).toBe(true);
    expect(filterDefined).toBe(true);
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/");
    // Wait for gallery to start loading images
    await page.waitForTimeout(2000);
    expect(errors).toEqual([]);
  });

  test("design tokens are defined", async ({ page }) => {
    await page.goto("/");
    const primaryColor = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--pxme-color-primary")
        .trim(),
    );
    expect(primaryColor).toBeTruthy();
  });
});
