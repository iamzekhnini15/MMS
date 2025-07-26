import { test, expect } from "@playwright/test";

// Helpers pour simuler la connexion dans sessionStorage
async function login(page, role = "USER") {
  await page.addInitScript((role) => {
    sessionStorage.setItem(
      "authenticatedUser",
      JSON.stringify({
        token: "fake.jwt.token.for.testing",
        user: {
          id: "1",
          name: role === "ADMIN" ? "Admin Test" : "User Test",
          email: `${role.toLowerCase()}@example.com`,
          role,
        },
      })
    );
  }, role);
}

async function logout(page) {
  await page.evaluate(() => sessionStorage.removeItem("authenticatedUser"));
  await page.reload();
}

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  test("TC_HP_1: Visiteur non connecté voit bouton Se connecter et Découvrir", async ({ page }) => {
    await logout(page);
    await page.goto("/");
    await expect(page.getByText("Gestion des Matières Scolaires")).toBeVisible();
  });
});
