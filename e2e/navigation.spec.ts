import { test, expect } from "@playwright/test";

test.describe("Header and navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the header", async ({ page }) => {
    const header = page.locator(".pxme-header");
    await expect(header).toBeVisible();
  });

  test("displays the Pixme logo", async ({ page }) => {
    const logo = page.locator(".pxme-header img");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("alt", "Pixme");
  });

  test("renders the navigation", async ({ page }) => {
    const nav = page.locator(".pxme-nav");
    await expect(nav).toBeVisible();
  });

  test("has sign-in link when not logged in", async ({ page }) => {
    const signIn = page.locator("#login-item a");
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/auth/signin");
    await expect(signIn).toHaveText("Sign In");
  });
});

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the footer", async ({ page }) => {
    const footer = page.locator(".pxme-footer");
    await expect(footer).toBeVisible();
  });

  test("displays copyright text", async ({ page }) => {
    const footer = page.locator(".pxme-footer");
    await expect(footer).toContainText("2026 Wattu Development");
  });

  test("displays service versions", async ({ page }) => {
    const versions = page.locator("#pxme-versions");
    // Versions are loaded asynchronously from /version endpoint
    await expect(versions).not.toBeEmpty({ timeout: 10_000 });
    const text = await versions.textContent();
    expect(text).toContain("bff");
    expect(text).toContain("api");
  });

  test("footer is fixed at bottom", async ({ page }) => {
    const footer = page.locator(".pxme-footer");
    const position = await footer.evaluate(
      (el) => getComputedStyle(el).position,
    );
    expect(position).toBe("fixed");
  });
});

test.describe("Toolbar", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the toolbar section", async ({ page }) => {
    const toolbar = page.locator(".pxme-toolbar");
    await expect(toolbar).toBeVisible();
  });

  test("contains the filter component", async ({ page }) => {
    const filter = page.locator("pxme-filter");
    await expect(filter).toBeVisible();
  });

  test("contains the sort button", async ({ page }) => {
    const sortBtn = page.locator(".pxme-icon-btn[title^='Sort']");
    await expect(sortBtn).toBeVisible();
  });
});
