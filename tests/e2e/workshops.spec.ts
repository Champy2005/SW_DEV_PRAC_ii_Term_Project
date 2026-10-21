import { expect, test, type Page } from "@playwright/test";

const password = "WorkshopDemo123!";
const reactWorkshop = "Build Your First React App";
const designWorkshop = "Design Systems in Practice";

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Welcome back" }).click();
  await expect(page).toHaveURL(/\/registrations/);
}

test("guests can search, shortlist across reloads, and browse on a phone", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: reactWorkshop })).toBeVisible();
  await page.getByRole("button", { name: `Save ${reactWorkshop}`, exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: /^Saved/ }).click();
  await expect(page.getByRole("heading", { name: reactWorkshop })).toBeVisible();
  await expect(page.getByRole("heading", { name: designWorkshop })).toHaveCount(0);
  await page.goto("/?search=React");
  await expect(page.getByRole("heading", { name: reactWorkshop })).toBeVisible();
  await expect(page.getByRole("heading", { name: designWorkshop })).toHaveCount(0);
  await page.goto("/?search=no-such-workshop-qx91");
  await expect(page.getByText("No workshops found.")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "CraftTable home" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("member signs up, reserves, sees duplicate error, moves and cancels", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Your name").fill("Browser Member");
  await page.getByLabel("Email address").fill(`member-${Date.now()}@example.com`);
  await page.getByLabel("Phone number").fill("0812345678");
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/registrations/);
  await page.goto("/");
  await page.getByRole("heading", { name: reactWorkshop }).getByRole("link").click();
  await page.getByRole("button", { name: "Register for this workshop" }).click();
  await expect(page).toHaveURL(/\/registrations/);
  await expect(page.getByRole("heading", { name: reactWorkshop })).toBeVisible();
  await page.getByRole("heading", { name: reactWorkshop }).getByRole("link").click();
  await page.getByRole("button", { name: "Register for this workshop" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("already registered");
  await page.goto("/registrations");
  await page.getByRole("button", { name: "Change workshop" }).click();
  const option = page.getByLabel("Choose a workshop").locator("option").filter({ hasText: designWorkshop });
  await page.getByLabel("Choose a workshop").selectOption((await option.getAttribute("value"))!);
  await page.getByRole("button", { name: "Move registration", exact: true }).click();
  await expect(page.getByRole("heading", { name: designWorkshop })).toBeVisible();
  await page.getByRole("button", { name: "Cancel registration", exact: true }).click();
  await page.getByRole("button", { name: "Yes, cancel registration" }).click();
  await expect(page.getByRole("heading", { name: "Your next experience is waiting." })).toBeVisible();
  await page.goto("/admin/workshops");
  await expect(page).not.toHaveURL(/\/admin\/workshops/);
  await page.getByRole("button", { name: /Log out/i }).click();
  await expect(page.getByRole("link", { name: "Log in", exact: true })).toBeVisible();
  await page.goto("/registrations");
  await expect(page).toHaveURL(/\/login/);
});

test("admin creates, edits and soft-deletes workshops through the UI", async ({ page }) => {
  await login(page, "admin@workshop.local");
  await page.getByRole("link", { name: "Manage workshops" }).click();
  await page.getByRole("button", { name: "+ Create workshop" }).click();
  const name = `Browser Workshop ${Date.now()}`;
  await page.getByLabel("Workshop name", { exact: true }).fill(name);
  await page.getByLabel("Instructor", { exact: true }).fill("Demo Instructor");
  await page.getByLabel("Description", { exact: true }).fill("A workshop created by the browser test.");
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  await page.getByLabel("Workshop date (UTC)").fill(nextWeek);
  await page.getByLabel("Total capacity").fill("5");
  await page.getByLabel("Location", { exact: true }).fill("Test Studio");
  await page.getByRole("button", { name: "Create workshop", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Workshop created.");
  await page.getByRole("button", { name: `Edit ${name}`, exact: true }).click();
  await page.getByLabel("Workshop name", { exact: true }).fill(`${name} Updated`);
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("heading", { name: `${name} Updated` })).toBeVisible();
  await page.getByRole("button", { name: `Delete ${name} Updated`, exact: true }).click();
  await page.getByRole("button", { name: "Delete workshop", exact: true }).click();
  await expect(page.getByRole("heading", { name: `${name} Updated` })).toHaveCount(0);
  await page.goto(`/?search=${encodeURIComponent(name)}`);
  await expect(page.getByText("No workshops found.")).toBeVisible();
});

test("authentication hides bearer tokens and rejects cross-origin writes", async ({ request, baseURL }) => {
  const blocked = await request.post("/api/backend/auth/login", {
    headers: { Origin: "https://another-site.example" },
    data: { email: "member@workshop.local", password },
  });
  expect(blocked.status()).toBe(403);
  const loginResponse = await request.post("/api/backend/auth/login", {
    headers: { Origin: baseURL! },
    data: { email: "member@workshop.local", password },
  });
  expect(loginResponse.status()).toBe(200);
  const body = await loginResponse.json();
  expect(body.data.token).toBeUndefined();
  const cookie = (await request.storageState()).cookies.find((item) => item.name === "workshop_session");
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe("Lax");
  expect((await request.get("/api/backend/auth/me")).status()).toBe(200);
  await request.post("/api/backend/auth/logout", { headers: { Origin: baseURL! } });
  expect((await request.get("/api/backend/auth/me")).status()).toBe(401);
});

test("admin can move and cancel another member's registration", async ({ page, request, baseURL }) => {
  const signup = await request.post("/api/backend/auth/register", {
    headers: { Origin: baseURL! },
    data: { name: "Admin Review Member", email: `admin-review-${Date.now()}@example.com`, tel: "0812345678", password, role: "member" },
  });
  expect(signup.status()).toBe(201);
  const workshops = (await (await request.get("/api/backend/workshops")).json()).data;
  const target = workshops.find((workshop: { name: string }) => workshop.name === "Ship Your Next.js Project");
  expect((await request.post("/api/backend/registrations", {
    headers: { Origin: baseURL! }, data: { workshop: target._id },
  })).status()).toBe(201);
  await login(page, "admin@workshop.local");
  const registration = page.getByRole("article", { name: "Ship Your Next.js Project", exact: true });
  await expect(registration).toContainText("Admin Review Member");
  await registration.getByRole("button", { name: "Change workshop" }).click();
  const option = registration.getByLabel("Choose a workshop").locator("option").filter({ hasText: "Testing with Confidence" });
  await registration.getByLabel("Choose a workshop").selectOption((await option.getAttribute("value"))!);
  await registration.getByRole("button", { name: "Move registration", exact: true }).click();
  const moved = page.getByRole("article", { name: "Testing with Confidence", exact: true });
  await expect(moved).toContainText("Admin Review Member");
  await moved.getByRole("button", { name: "Cancel registration", exact: true }).click();
  await moved.getByRole("button", { name: "Yes, cancel registration" }).click();
  await expect(moved).toHaveCount(0);
  // Request context remains the member's session; this observes the admin change as its owner.
  const own = await (await request.get("/api/backend/registrations")).json();
  expect(own.data).toEqual([]);
});
