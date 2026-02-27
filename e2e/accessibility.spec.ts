import { test, expect } from "@playwright/test";

test.describe("Keyboard accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sign-in link is focusable via Tab", async ({ page }) => {
    let found = false;
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      // Check both light DOM and shadow DOM active elements
      const result = await page.evaluate(() => {
        let el = document.activeElement;
        // Traverse into shadow roots to find the deepest active element
        while (el?.shadowRoot?.activeElement) {
          el = el.shadowRoot.activeElement;
        }
        return {
          tag: el?.tagName,
          text: el?.textContent?.trim(),
        };
      });
      if (result.tag === "A" && result.text === "Sign In") {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test("Tab navigates through interactive elements", async ({ page }) => {
    const focusedElements: string[] = [];

    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        let el = document.activeElement;
        // Traverse into shadow roots to find the deepest active element
        while (el?.shadowRoot?.activeElement) {
          el = el.shadowRoot.activeElement;
        }
        if (el && el !== document.body) {
          return `${el.tagName}:${el.textContent?.trim().substring(0, 20)}`;
        }
        return "";
      });
      if (info) focusedElements.push(info);
    }

    expect(focusedElements.length).toBeGreaterThan(0);
  });

  test("page has lang attribute", async ({ page }) => {
    const lang = await page.getAttribute("html", "lang");
    expect(lang).toBe("en");
  });

  test("gallery images have alt attributes", async ({ page }) => {
    const gallery = page.locator("pxme-gallery");
    const firstImg = gallery.locator(".pxme-gallery__img").first();
    await expect(firstImg).toBeVisible({ timeout: 15_000 });

    // alt is set to the image ID (truthy but not necessarily descriptive)
    const alt = await firstImg.getAttribute("alt");
    expect(alt).toBeTruthy();
  });

  test("logo has alt text", async ({ page }) => {
    const logo = page.locator(".pxme-header img");
    await expect(logo).toHaveAttribute("alt", "Pixme");
  });

  test("filter toggle has title attribute", async ({ page }) => {
    const toggle = page.locator("pxme-filter .pxme-filter__toggle");
    await expect(toggle).toHaveAttribute("title", "Filter");
  });

  test("sort button has title attribute", async ({ page }) => {
    const sortBtn = page.locator(".pxme-icon-btn[title^='Sort']");
    await expect(sortBtn).toHaveAttribute("title", /^Sort/);
  });
});
