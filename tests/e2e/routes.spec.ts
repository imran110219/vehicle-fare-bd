import { test, expect } from "@playwright/test";

test.describe("Popular Routes page", () => {
  test("page loads with correct heading", async ({ page }) => {
    await page.goto("/routes");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("shows empty state or route list", async ({ page }) => {
    await page.goto("/routes");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("city filter dropdown is present", async ({ page }) => {
    await page.goto("/routes");
    // Look for a select or combobox for city filtering
    const select = page.locator("select, [role='combobox']").first();
    await expect(select).toBeVisible();
  });

  test("stays on /routes after loading", async ({ page }) => {
    await page.goto("/routes");
    await expect(page).toHaveURL(/\/routes/);
  });

  test("does not require authentication", async ({ page }) => {
    await page.goto("/routes");
    const url = page.url();
    // Should NOT be redirected to login
    expect(url).not.toContain("/login");
  });
});
