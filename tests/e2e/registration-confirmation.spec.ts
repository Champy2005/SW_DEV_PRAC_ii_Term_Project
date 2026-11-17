import { expect, test, type APIRequestContext } from '@playwright/test';

const password = 'WorkshopDemo123!';
const workshopId = '690100000000000000000001';

async function createMember(request: APIRequestContext, origin: string) {
  const signup = await request.post('/api/backend/auth/register', {
    headers: { Origin: origin },
    data: {
      name: 'Confirmation Review Member',
      email: `confirmation-${crypto.randomUUID()}@example.com`,
      tel: '0812345678',
      password,
      role: 'member',
    },
  });
  expect(signup.status()).toBe(201);
}

async function createRegistration(request: APIRequestContext, origin: string): Promise<string> {
  const response = await request.post('/api/backend/registrations', {
    headers: { Origin: origin },
    data: { workshop: workshopId },
  });
  expect(response.status()).toBe(201);
  return (await response.json()).data._id;
}

test('confirmation disappears when its registration is cancelled, even with a stale URL', async ({ page, baseURL }) => {
  await createMember(page.request, baseURL!);
  const id = await createRegistration(page.request, baseURL!);
  await page.goto(`/registrations?registered=${id}`);
  const confirmation = page.getByRole('main').getByRole('status');
  await expect(confirmation).toContainText(id);

  await page.getByRole('button', { name: 'Cancel registration', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, cancel registration' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  await expect(confirmation).toHaveCount(0);
  await expect(page).toHaveURL(new RegExp(`registered=${id}$`));
  await page.reload();
  await expect(confirmation).toHaveCount(0);
});

test('fabricated, foreign, repeated and admin query references cannot create a success notice', async ({ page, request, baseURL }) => {
  // The independent request context represents a different member.
  await createMember(request, baseURL!);
  const foreignId = await createRegistration(request, baseURL!);
  await createMember(page.request, baseURL!);

  for (const query of [
    'registered=000000000000000000000000',
    `registered=${foreignId}`,
    `registered=${foreignId}&registered=000000000000000000000000`,
  ]) {
    await page.goto(`/registrations?${query}`);
    await expect(page.getByRole('main').getByRole('status')).toHaveCount(0);
    await expect(page.getByRole('article')).toHaveCount(0);
  }

  const adminLogin = await page.request.post('/api/backend/auth/login', {
    headers: { Origin: baseURL! },
    data: { email: 'admin@workshop.local', password },
  });
  expect(adminLogin.status()).toBe(200);
  await page.goto(`/registrations?registered=${foreignId}`);
  await expect(page.getByRole('heading', { name: 'All registrations.' })).toBeVisible();
  await expect(page.getByRole('main').getByRole('status')).toHaveCount(0);
});
