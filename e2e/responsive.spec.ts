import { test, expect, devices } from "@playwright/test";

// These tests only run in mobile projects — they rely on narrow viewport.
// In the config we have mobile-chrome (Pixel 5: 393px) and mobile-safari (iPhone 12: 390px).
// For desktop projects, the menu toggle is display:none, so we skip those.

test.describe("Responsive mobile menu", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 1280) > 768,
    "Mobile menu tests only apply to narrow viewports",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hamburger menu is visible on mobile", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await expect(toggle).toBeVisible();
  });

  test("navigation is hidden by default on mobile", async ({ page }) => {
    const nav = page.locator("pixme-header").locator("nav");
    // The nav exists but is hidden via CSS (display: none)
    await expect(nav).not.toBeVisible();
  });

  test("clicking hamburger opens the navigation", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await toggle.click();

    const nav = page.locator("pixme-header").locator("nav");
    await expect(nav).toBeVisible();
    await expect(nav).toHaveClass(/open/);
  });

  test("clicking hamburger again closes the navigation", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await toggle.click();
    await expect(page.locator("pixme-header").locator("nav")).toBeVisible();

    await toggle.click();
    const nav = page.locator("pixme-header").locator("nav");
    await expect(nav).not.toBeVisible();
  });

  test("hamburger has correct aria-expanded state", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("hamburger has aria-label", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await expect(toggle).toHaveAttribute("aria-label", "Toggle navigation");
  });

  test("hamburger has aria-controls pointing to nav", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await expect(toggle).toHaveAttribute("aria-controls", "main-nav");
  });

  test("nav links are accessible when menu is open", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await toggle.click();

    const links = page.locator("pixme-header a");
    for (let i = 0; i < 4; i++) {
      await expect(links.nth(i)).toBeVisible();
    }
  });
});
