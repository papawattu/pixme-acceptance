import { test, expect } from "@playwright/test";

const authenticatedSession = {
  user: {
    name: "Test User",
    email: "test@example.com",
    image: "https://example.com/avatar.png",
    role: "admin",
  },
  expires: "2099-12-31T23:59:59.000Z",
};

test.describe("Popup auth flow", () => {
  test("main landing page exposes popup sign-in CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("pxme-hero")).toContainText(
      "A private home for the moments that matter.",
    );
    await expect(page.locator("pxme-hero")).toContainText(
      "Sign in to continue",
    );
    await expect(page.locator("pxme-gallery")).not.toBeVisible();
  });

  test("popup success refreshes the main page into gallery view", async ({ page }) => {
    let authed = false;

    await page.route("**/auth/session", async (route) => {
      if (authed) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(authenticatedSession),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    });

    await page.goto("/");

    await page.evaluate(() => {
      window.open = () => ({ closed: false, close() {} });
    });

    const button = page.getByRole("button", {
      name: "Sign in to continue",
    });
    await button.click();

    authed = true;
    await page.evaluate(() => {
      window.postMessage({ type: "pixme-auth-success" }, window.location.origin);
    });

    await expect(page.locator("pxme-gallery .pxme-gallery__link").first()).toBeVisible({
      timeout: 15_000,
    });
  });

  test("popup blocked falls back to redirect signin URL", async ({ page }) => {
    await page.goto("/");

    await page.evaluate(() => {
      window.open = () => null;
    });

    await page.getByRole("button", {
      name: "Sign in to continue",
    }).click();

    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=/);
  });

  test("main popup launches direct provider flow via launcher page", async ({
    page,
  }) => {
    await page.goto("/");

    const popupPromise = page.waitForEvent("popup");
    await page.getByRole("button", {
      name: "Sign in to continue",
    }).click();

    const popup = await popupPromise;
    await popup.waitForURL(/\/auth-launch\.html\?callbackUrl=/);
  });
});
