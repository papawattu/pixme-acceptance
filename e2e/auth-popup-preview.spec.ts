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

test.describe("Popup auth preview", () => {
  test("shows preview hero for anonymous users", async ({ page }) => {
    await page.goto("/preview-auth.html");

    await expect(page.locator("pxme-hero")).toContainText(
      "Try the same-page sign-in preview.",
    );
    await expect(page.locator("pxme-hero")).toContainText(
      "Try sign in without leaving the page",
    );
    await expect(page.locator("pxme-gallery")).not.toBeVisible();
  });

  test("popup success refreshes into gallery view", async ({ page }) => {
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

    await page.goto("/preview-auth.html");

    await page.evaluate(() => {
      window.open = () => ({ closed: false, close() {} });
    });

    const button = page.getByRole("button", {
      name: "Try sign in without leaving the page",
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
    await page.goto("/preview-auth.html");

    await page.evaluate(() => {
      window.open = () => null;
    });

    await page.getByRole("button", {
      name: "Try sign in without leaving the page",
    }).click();

    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=/);
  });
});
