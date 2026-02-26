import { test, expect } from "@playwright/test";

test.describe("Header component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the header element", async ({ page }) => {
    const header = page.locator("pixme-header");
    await expect(header).toBeVisible();
  });

  test("displays the brand text", async ({ page }) => {
    const brand = page.locator("pixme-header").getByRole("link", { name: "Pixme UI" });
    await expect(brand).toBeVisible();
  });

  test("brand links to root", async ({ page }) => {
    const brand = page.locator("pixme-header").getByRole("link", { name: "Pixme UI" });
    await expect(brand).toHaveAttribute("href", "/");
  });

  test("renders all navigation links", async ({ page }) => {
    // Use direct child selector to get only light DOM slotted links, not the brand <a> in shadow DOM
    const links = page.locator("pixme-header > a");
    await expect(links).toHaveCount(4);
  });

  test("navigation links have correct text", async ({ page }) => {
    const links = page.locator("pixme-header > a");
    await expect(links.nth(0)).toHaveText("Home");
    await expect(links.nth(1)).toHaveText("About");
    await expect(links.nth(2)).toHaveText("Docs");
    await expect(links.nth(3)).toHaveText("Contact");
  });

  test("navigation links have correct hrefs", async ({ page }) => {
    const links = page.locator("pixme-header > a");
    await expect(links.nth(0)).toHaveAttribute("href", "#home");
    await expect(links.nth(1)).toHaveAttribute("href", "#about");
    await expect(links.nth(2)).toHaveAttribute("href", "#docs");
    await expect(links.nth(3)).toHaveAttribute("href", "#contact");
  });

  test("header has aria-label on navigation", async ({ page }) => {
    // Access shadow DOM nav
    const nav = page.locator("pixme-header").locator("nav");
    await expect(nav).toHaveAttribute("aria-label", "Main navigation");
  });

  test("header has accessible banner role", async ({ page }) => {
    const header = page.locator("pixme-header header");
    await expect(header).toBeVisible();
  });
});
