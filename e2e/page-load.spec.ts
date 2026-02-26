import { test, expect } from "@playwright/test";

test.describe("Page load", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Pixme UI");
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

  test("has meta description", async ({ page }) => {
    await page.goto("/");
    const desc = page.locator('meta[name="description"]');
    await expect(desc).toHaveAttribute("content", /Pixme/);
  });

  test("has favicon", async ({ page }) => {
    await page.goto("/");
    const favicon = page.locator('link[rel="icon"]');
    await expect(favicon).toHaveAttribute("href", /favicon\.svg/);
  });

  test("loads the Lit components module", async ({ page }) => {
    await page.goto("/");
    // The custom elements should be defined after the module loads
    const headerDefined = await page.evaluate(() =>
      customElements.get("pixme-header") !== undefined,
    );
    const buttonDefined = await page.evaluate(() =>
      customElements.get("pixme-button") !== undefined,
    );
    expect(headerDefined).toBe(true);
    expect(buttonDefined).toBe(true);
  });

  test("no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });
});
