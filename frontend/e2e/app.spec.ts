import { expect, test } from "@playwright/test";

test.describe("Care Ops dashboard (E2E)", () => {
  test("loads the dashboard and shows seeded content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Care Operations Task Tracker/i })).toBeVisible();
    await expect(page.getByText(/Total Tasks/i).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /Follow up with linen vendor/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("search shows empty state when nothing matches", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("searchbox", { name: /search tasks/i }).fill("zzzz-no-match-xyz");
    await expect(page.getByRole("heading", { name: /no tasks match your filters/i })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("status filter can isolate canceled tasks", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /Follow up with linen vendor/i })).toBeVisible({
      timeout: 30_000,
    });
    await page.locator("#filter-status").selectOption("canceled");
    await expect(page.getByRole("button", { name: /Retire legacy badge printer/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole("button", { name: /Follow up with linen vendor/i })).toHaveCount(0);
  });

  test("create task form requires a title", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /new task/i }).click();
    await expect(page.getByRole("heading", { name: /create task/i })).toBeVisible();
    await page.getByRole("button", { name: /^create task$/i }).click();
    await expect(page.getByText("Title is required")).toBeVisible();
  });

  test("mark complete updates a todo task", async ({ page }) => {
    const title = `E2E complete ${Date.now()}`;
    await page.goto("/");
    await page.getByRole("button", { name: /new task/i }).click();
    await page.locator("#create-title").fill(title);
    await page.getByRole("button", { name: /^create task$/i }).click();
    await expect(page.getByText(/task created/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: new RegExp(title) })).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: new RegExp(title) }).click();
    await page.getByRole("button", { name: /mark complete/i }).click();
    await expect(page.getByText(/marked complete/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /reopen/i })).toBeVisible();
  });
});
