import { test, expect } from "@playwright/test";

test.describe("Keyboard accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("brand link is focusable via Tab", async ({ page }) => {
    await page.keyboard.press("Tab");
    // First focusable element should be the brand link in shadow DOM
    const focused = await page.evaluate(() => {
      const header = document.querySelector("pixme-header");
      return header?.shadowRoot?.activeElement?.className ?? "";
    });
    expect(focused).toContain("brand");
  });

  test("Tab navigates through interactive elements", async ({ page }) => {
    // Collect the text of focused elements as we tab through
    const focusedTexts: string[] = [];

    // Tab through all elements, collecting focused element text
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press("Tab");
      const text = await page.evaluate(() => {
        // Check shadow roots first
        const header = document.querySelector("pixme-header");
        const shadowActive = header?.shadowRoot?.activeElement;
        if (shadowActive) {
          return `header:${shadowActive.textContent?.trim()}`;
        }
        // Check active element in document
        const active = document.activeElement;
        if (active && active !== document.body) {
          return active.textContent?.trim() ?? active.tagName;
        }
        return "";
      });
      if (text) focusedTexts.push(text);
    }

    // We should be able to tab to the brand link and at least some nav items
    expect(focusedTexts.length).toBeGreaterThan(0);
  });

  test("buttons show focus ring on keyboard focus", async ({ page }) => {
    // Tab to the first button (past header elements)
    // Use locator focus to test the focus style directly
    const button = page
      .locator('pixme-button[variant="primary"]')
      .locator("button");
    await button.focus();

    const outlineStyle = await button.evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    // When :focus-visible applies, outline should be set (solid)
    // Some browsers may not show focus-visible on programmatic focus,
    // but the CSS rule should exist
    expect(outlineStyle).not.toBe("none");
  });
});

test.describe("Keyboard accessibility - mobile menu", () => {
  test.skip(
    ({ viewport }) => (viewport?.width ?? 1280) > 768,
    "Mobile menu keyboard tests only apply to narrow viewports",
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Escape key closes the mobile menu", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await toggle.click();

    const nav = page.locator("pixme-header").locator("nav");
    await expect(nav).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await expect(nav).not.toBeVisible();
  });

  test("Escape returns focus to the menu toggle button", async ({ page }) => {
    const toggle = page.locator("pixme-header").locator("button.menu-toggle");
    await toggle.click();
    await page.keyboard.press("Escape");

    const focusedClass = await page.evaluate(() => {
      const header = document.querySelector("pixme-header");
      return header?.shadowRoot?.activeElement?.className ?? "";
    });
    expect(focusedClass).toContain("menu-toggle");
  });
});
