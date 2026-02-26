import { test, expect } from "@playwright/test";

test.describe("Button components", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders two buttons", async ({ page }) => {
    const buttons = page.locator("pixme-button");
    await expect(buttons).toHaveCount(2);
  });

  test("primary button displays correct text", async ({ page }) => {
    const primaryButton = page.locator('pixme-button[variant="primary"]');
    await expect(primaryButton).toBeVisible();
    const button = primaryButton.locator("button");
    await expect(button).toHaveText("Hello, Click Me!");
  });

  test("secondary button displays correct text", async ({ page }) => {
    const secondaryButton = page.locator('pixme-button[variant="secondary"]');
    await expect(secondaryButton).toBeVisible();
    const button = secondaryButton.locator("button");
    await expect(button).toHaveText("Hello, Submit!");
  });

  test("primary button has primary styling class", async ({ page }) => {
    const button = page
      .locator('pixme-button[variant="primary"]')
      .locator("button");
    await expect(button).toHaveClass(/primary/);
  });

  test("secondary button has secondary styling class", async ({ page }) => {
    const button = page
      .locator('pixme-button[variant="secondary"]')
      .locator("button");
    await expect(button).toHaveClass(/secondary/);
  });

  test("primary button has blue background", async ({ page }) => {
    const button = page
      .locator('pixme-button[variant="primary"]')
      .locator("button");
    const bgColor = await button.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    // #0066ff = rgb(0, 102, 255)
    expect(bgColor).toBe("rgb(0, 102, 255)");
  });

  test("primary button has white text", async ({ page }) => {
    const button = page
      .locator('pixme-button[variant="primary"]')
      .locator("button");
    const color = await button.evaluate((el) => getComputedStyle(el).color);
    // white = rgb(255, 255, 255)
    expect(color).toBe("rgb(255, 255, 255)");
  });

  test("buttons are clickable", async ({ page }) => {
    const button = page
      .locator('pixme-button[variant="primary"]')
      .locator("button");
    // Should not throw
    await button.click();
  });

  test("buttons have cursor pointer", async ({ page }) => {
    const button = page
      .locator('pixme-button[variant="primary"]')
      .locator("button");
    const cursor = await button.evaluate(
      (el) => getComputedStyle(el).cursor,
    );
    expect(cursor).toBe("pointer");
  });
});
