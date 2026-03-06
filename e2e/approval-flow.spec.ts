import { test, expect } from "@playwright/test";

const adminSession = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    image: "https://example.com/avatar.png",
    role: "admin",
    approved: true,
  },
  expires: "2099-12-31T23:59:59.000Z",
};

test.describe("Approval flow", () => {
  test("admin can approve a pending user from the admin page", async ({ page }) => {
    let approved = false;

    await page.route("**/auth/session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(adminSession),
      });
    });

    await page.route("**/users/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "admin-1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
          approved: true,
        }),
      });
    });

    await page.route("**/users", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "pending-1",
            name: "Pending User",
            email: "pending@example.com",
            role: "user",
            approved,
          },
          {
            id: "admin-1",
            name: "Admin User",
            email: "admin@example.com",
            role: "admin",
            approved: true,
          },
        ]),
      });
    });

    await page.route("**/users/pending-1/approve", async (route) => {
      approved = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "pending-1",
          name: "Pending User",
          email: "pending@example.com",
          role: "user",
          approved: true,
        }),
      });
    });

    page.on("dialog", (dialog) => dialog.accept());

    await page.goto("/admin.html");

    await expect(page.locator("pxme-admin")).toContainText("1 pending approval");
    await expect(page.locator("pxme-admin")).toContainText("Pending User");
    await expect(page.getByRole("button", { name: "Approve" })).toBeVisible();

    await page.getByRole("button", { name: "Approve" }).click();

    await expect(page.locator("pxme-admin")).not.toContainText("1 pending approval");
    await expect(page.locator("pxme-admin")).toContainText("approved");
  });
});
